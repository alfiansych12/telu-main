'use server';

import prisma from 'lib/prisma';
import { RequestStatus, Prisma } from '@prisma/client';
import { getserverAuthSession } from 'utils/authOptions';
import { MonitoringWithRelations } from 'types/api';
import { logAudit } from 'utils/audit';
import { createNotification } from './notifications';

export interface MonitoringLocationWithUser {
    id: string;
    user_id: string;
    location_name: string;
    latitude: any; // Decimal
    longitude: any; // Decimal
    request_date: Date;
    reason: string | null;
    status: RequestStatus | null;
    notes: string | null;
    created_at: Date | null;
    user?: {
        id: string;
        name: string;
        email: string;
        unit_id: string | null;
        supervisor_id: string | null;
        unit?: {
            name: string;
        } | null;
    };
}

/**
 * Get monitoring location requests with optional filters
 */
export async function getMonitoringRequests(filters?: {
    status?: 'pending' | 'approved' | 'rejected';
    userId?: string;
    supervisorId?: string;
    unitId?: string;
    date?: string;
}) {
    const session = await getserverAuthSession();
    if (!session) {
        console.warn('[API] getMonitoringRequests - Unauthorized access attempt');
        throw new Error('Unauthorized');
    }

    const { role: userRole, id: userId } = session.user as any;

    if (filters?.userId && filters?.date) {
        try {
            await autoApproveExpiredMonitoring();
        } catch (e) {
            console.error('Failed to auto-approve monitoring:', e);
        }
    }

    try {
        const where: Prisma.MonitoringLocationWhereInput = {};

        // Security: Restrict filters by role
        if (userRole === 'participant') {
            where.user_id = userId; // Force self only
            if (filters) {
                filters.userId = userId;
                filters.supervisorId = undefined;
                filters.unitId = undefined;
            }
        } else if (userRole === 'supervisor') {
            if (filters?.userId && filters.userId !== userId) {
                where.user = { supervisor_id: userId };
            } else if (!filters?.userId) {
                where.user = { supervisor_id: userId };
            }
        }
        // Admin has no restrictions


        if (filters?.status) {
            where.status = filters.status as RequestStatus;
        }

        if (filters?.userId) {
            where.user_id = filters.userId;
        }

        if (filters?.date) {
            where.request_date = new Date(filters.date);
        }

        if (filters?.supervisorId || filters?.unitId) {
            where.user = {};
            if (filters.supervisorId) where.user.supervisor_id = filters.supervisorId;
            if (filters.unitId) where.user.unit_id = filters.unitId;
        }

        const requests = await prisma.monitoringLocation.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        unit_id: true,
                        supervisor_id: true,
                        unit: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const mappedRequests = requests.map((req: any) => ({
            ...req,
            latitude: req.latitude ? Number(req.latitude) : null,
            longitude: req.longitude ? Number(req.longitude) : null
        }));

        return mappedRequests as unknown as MonitoringWithRelations[];
    } catch (error) {
        console.error('Error fetching monitoring requests:', error);
        throw error;
    }
}

/**
 * Create new monitoring location request
 */
export async function createMonitoringRequest(requestData: any) {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const { role: userRole, id: userId } = session.user as any;

    // Security: participants can only create for themselves
    if (userRole === 'participant' && requestData.user_id !== userId) {
        throw new Error('Forbidden');
    }

    try {
        const request = await prisma.monitoringLocation.create({
            data: {
                ...requestData,
                request_date: new Date(requestData.request_date)
            }
        });

        await logAudit({
            action: 'CREATE_MONITORING_REQUEST',
            entity: 'MonitoringLocation',
            entityId: request.id,
            details: { location: request.location_name, date: request.request_date }
        });

        // Notify Supervisor
        const requester = await prisma.user.findUnique({
            where: { id: requestData.user_id },
            select: { name: true, supervisor_id: true }
        });

        if (requester?.supervisor_id) {
            await createNotification({
                userId: requester.supervisor_id,
                title: 'New Out-Area Request',
                message: `${requester.name} has submitted an out-area request for ${request.location_name} on ${new Date(request.request_date).toLocaleDateString()}. Reason: ${request.reason || '-'}`,
                type: 'monitoring',
                link: `/Monitoringsuper?monitoringId=${request.id}`
            });
        }

        return {
            ...request,
            latitude: request.latitude ? Number(request.latitude) : null,
            longitude: request.longitude ? Number(request.longitude) : null
        };
    } catch (error) {
        console.error('Error creating monitoring request:', error);
        throw error;
    }
}

export async function updateMonitoringRequest(
    id: string,
    status: 'approved' | 'rejected',
    notes?: string
) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role === 'participant') {
        throw new Error('Unauthorized');
    }

    return executeMonitoringRequestUpdate(id, status, notes);
}

/**
 * Internal function to handle the update logic without session checks
 */
async function executeMonitoringRequestUpdate(
    id: string,
    status: 'approved' | 'rejected',
    notes?: string
) {
    try {
        const request = await prisma.monitoringLocation.update({
            where: { id },
            data: {
                status: status as RequestStatus,
                notes
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // If approved, automatically create/update attendance record
        if (status === 'approved') {
            // Ensure we use the exact date from the request without timezone shifts
            const today = new Date(request.request_date);
            today.setUTCHours(0, 0, 0, 0);

            // Determine status based on reason keywords
            let attendanceStatus = 'present';
            const lowerReason = (request.reason || '').toLowerCase();

            if (lowerReason.includes('sakit') || lowerReason.includes('sick')) {
                attendanceStatus = 'sick';
            } else if (lowerReason.includes('izin') || lowerReason.includes('permit') || lowerReason.includes('cuti')) {
                attendanceStatus = 'permit';
            }

            await prisma.attendance.upsert({
                where: {
                    attendances_user_id_date_key: {
                        user_id: request.user_id,
                        date: today
                    }
                },
                update: {
                    check_in_time: new Date(), // Set check-in time to approval time
                    status: attendanceStatus as any,
                    activity_description: JSON.stringify({
                        check_in_location: [Number(request.latitude), Number(request.longitude)],
                        out_area_request_id: request.id,
                        via: 'out-area-approval',
                        reason: request.reason
                    })
                },
                create: {
                    user_id: request.user_id,
                    date: today,
                    check_in_time: new Date(),
                    status: attendanceStatus as any,
                    activity_description: JSON.stringify({
                        check_in_location: [Number(request.latitude), Number(request.longitude)],
                        out_area_request_id: request.id,
                        via: 'out-area-approval',
                        reason: request.reason
                    })
                }
            });
        }

        await logAudit({
            action: 'UPDATE_MONITORING_STATUS',
            entity: 'MonitoringLocation',
            entityId: id,
            details: { status, notes }
        });

        return {
            ...request,
            latitude: request.latitude ? Number(request.latitude) : null,
            longitude: request.longitude ? Number(request.longitude) : null
        } as unknown as MonitoringLocationWithUser;
    } catch (error) {
        console.error('Error updating monitoring request:', error);
        throw error;
    }
}

/**
 * Get pending monitoring requests count
 */
export async function getPendingRequestsCount() {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role === 'participant') {
        throw new Error('Unauthorized');
    }

    try {
        const count = await prisma.monitoringLocation.count({
            where: {
                status: 'pending'
            }
        });
        return count;
    } catch (error) {
        console.error('Error fetching pending requests count:', error);
        throw error;
    }
}

/**
 * Auto-approve pending monitoring requests older than 24 hours
 */
export async function autoApproveExpiredMonitoring() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    try {
        const expiredRequests = await prisma.monitoringLocation.findMany({
            where: {
                status: 'pending',
                created_at: {
                    lte: oneDayAgo
                }
            },
            select: {
                id: true
            }
        });

        if (expiredRequests.length === 0) return { count: 0 };

        console.log(`[System] Auto-approving ${expiredRequests.length} expired monitoring requests...`);

        let count = 0;
        for (const req of expiredRequests) {
            try {
                await executeMonitoringRequestUpdate(req.id, 'approved', 'System Auto-Approved (No response from supervisor for 24 hours)');
                count++;
            } catch (err) {
                console.error(`Failed to auto-approve monitoring request ${req.id}:`, err);
            }
        }

        return { count };
    } catch (error) {
        console.error('Error in autoApproveExpiredMonitoring:', error);
        throw error;
    }
}
