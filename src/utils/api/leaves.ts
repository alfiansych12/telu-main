'use server';

import prisma from 'lib/prisma';
import { RequestStatus, LeaveType, Prisma } from '@prisma/client';
import { getserverAuthSession } from 'utils/authOptions';
import { LeaveRequestWithRelations, PaginatedResponse } from 'types/api';
import { logAudit } from 'utils/audit';
import { createNotification } from './notifications';

export interface LeaveRequestFilters {
    userId?: string;
    unitId?: string;
    supervisorId?: string;
    status?: RequestStatus;
    page?: number;
    pageSize?: number;
    autoApprove?: boolean;
}

/**
 * Get leave requests with optional filters
 */
export async function getLeaveRequests(filters: LeaveRequestFilters = {}) {
    if (filters.autoApprove !== false) {
        try {
            await autoApproveExpiredRequests();
        } catch (e) {
            console.error('Failed to auto-approve:', e);
        }
    }

    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const { role: userRole, id: userId } = session.user as any;

    try {
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 10;
        const skip = (page - 1) * pageSize;

        const where: Prisma.LeaveRequestWhereInput = {};

        // Security: Restrict filters by role
        if (userRole === 'participant') {
            where.user_id = userId; // Force self only
            filters.userId = userId;
            filters.unitId = undefined;
            filters.supervisorId = undefined;
        } else if (userRole === 'supervisor') {
            if (filters.userId && filters.userId !== userId) {
                where.user = { supervisor_id: userId };
            } else if (!filters.userId) {
                where.user = { supervisor_id: userId };
            }
        }
        // Admin has no restrictions


        if (filters.userId) {
            where.user_id = filters.userId;
        }

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.supervisorId || filters.unitId) {
            where.user = {};
            // If supervisorId is present, filter by it.
            if (filters.supervisorId) {
                where.user.supervisor_id = filters.supervisorId;
            }
            // If unitId is present AND strictly not 'all' (though the caller handles it, being safe here)
            if (filters.unitId && filters.unitId !== 'all') {
                where.user.unit_id = filters.unitId;
            }
        }

        const [requests, total] = await Promise.all([
            prisma.leaveRequest.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            unit: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
                skip,
                take: pageSize,
                orderBy: {
                    created_at: 'desc'
                }
            }),
            prisma.leaveRequest.count({ where })
        ]);

        return {
            data: requests as unknown as LeaveRequestWithRelations[],
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        } as PaginatedResponse<LeaveRequestWithRelations>;
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        throw error;
    }
}

/**
 * Create a new leave request
 */
export async function createLeaveRequest(data: any) {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const { role: userRole, id: userId } = session.user as any;

    // Security check: participants can only create for themselves
    if (userRole === 'participant' && data.user_id !== userId) {
        throw new Error('Forbidden: Cannot create request for another user');
    }

    try {
        const { getLeaveSettings } = require('./settings');
        const settings = await getLeaveSettings();

        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);

        // Calculate duration in days (inclusive)
        const durationTime = endDate.getTime() - startDate.getTime();
        const durationDays = Math.ceil(durationTime / (1000 * 3600 * 24)) + 1;

        if (durationDays < 1) {
            throw new Error('Tanggal selesai tidak boleh sebelum tanggal mulai.');
        }

        // 1. Check Max Permit Duration
        if (data.type === 'permit' && durationDays > settings.max_permit_duration) {
            throw new Error(`Izin tidak boleh melebihi ${settings.max_permit_duration} hari berturut-turut. Silakan ajukan beberapa permintaan terpisah jika benar-benar diperlukan.`);
        }

        // 2. Check Evidence for Sick Leave
        if (data.type === 'sick' && settings.require_evidence_for_sick && !data.evidence) {
            throw new Error('Wajib melampirkan bukti foto (surat dokter/foto obat) untuk izin sakit.');
        }

        // 3. Check Monthly Quota for the month of the requested leave
        // Use the month of the start date for quota calculation
        const refDate = startDate;
        const qStartOfMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
        const qEndOfMonth = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);

        const existingRequests = await prisma.leaveRequest.findMany({
            where: {
                user_id: data.user_id,
                status: { in: ['approved', 'pending'] },
                OR: [
                    {
                        start_date: { lte: qEndOfMonth },
                        end_date: { gte: qStartOfMonth }
                    }
                ]
            }
        });

        let usedQuota = 0;
        existingRequests.forEach(req => {
            const s = new Date(req.start_date);
            const e = new Date(req.end_date);
            // Only count days falling within the reference month
            const effectiveStart = s < qStartOfMonth ? qStartOfMonth : s;
            const effectiveEnd = e > qEndOfMonth ? qEndOfMonth : e;
            const days = Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 3600 * 24)) + 1;
            usedQuota += Math.max(0, days);
        });

        if ((usedQuota + durationDays) > settings.max_monthly_quota) {
            const remaining = Math.max(0, settings.max_monthly_quota - usedQuota);
            const monthName = refDate.toLocaleString('default', { month: 'long' });
            throw new Error(`Batas kuota izin bulan ${monthName} telah mencapai batas. Kuota tersisa: ${remaining} hari. Pengajuan ini butuh ${durationDays} hari.`);
        }

        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                user_id: data.user_id,
                type: data.type as LeaveType,
                start_date: startDate,
                end_date: endDate,
                reason: data.reason,
                evidence: data.evidence,
                status: 'pending'
            }
        });
        await logAudit({
            action: 'CREATE_LEAVE_REQUEST',
            entity: 'LeaveRequest',
            entityId: leaveRequest.id,
            details: { type: leaveRequest.type, start: leaveRequest.start_date, end: leaveRequest.end_date, reason: leaveRequest.reason }
        });

        // Notify Supervisor
        const requester = await prisma.user.findUnique({
            where: { id: data.user_id },
            select: { name: true, supervisor_id: true }
        });

        if (requester?.supervisor_id) {
            const typeLabel = data.type === 'forgot' ? 'Attendance Correction' : data.type.toUpperCase();
            await createNotification({
                userId: requester.supervisor_id,
                title: `New Request: ${typeLabel}`,
                message: `${requester.name} has submitted a ${data.type} request for ${new Date(data.start_date).toLocaleDateString()} - ${new Date(data.end_date).toLocaleDateString()}. Reason: ${data.reason || '-'}`,
                type: 'leave',
                link: `/Monitoringsuper?requestId=${leaveRequest.id}`
            });
        }

        return leaveRequest;
    } catch (error) {
        console.error('Error creating leave request:', error);
        throw error;
    }
}

export async function updateLeaveRequestStatus(id: string, status: RequestStatus, notes?: string) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role === 'participant') {
        throw new Error('Unauthorized: Only supervisors or admins can update request status');
    }

    return executeLeaveRequestUpdate(id, status, notes);
}

/**
 * Internal function to handle the update logic without session checks
 * This allows system-level updates (auto-approval)
 */
async function executeLeaveRequestUpdate(id: string, status: RequestStatus, notes?: string) {
    try {
        const request = await prisma.leaveRequest.update({
            where: { id },
            data: {
                status,
                notes,
                updated_at: new Date()
            },
            include: { user: true }
        });

        // If approved, automatically create attendance records for the dates
        if (status === 'approved') {
            const start = new Date(request.start_date);
            const end = new Date(request.end_date);

            const dates: Date[] = [];
            let current = new Date(start);
            while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }

            for (const date of dates) {
                try {
                    let attendanceStatus: 'present' | 'sick' | 'permit' = 'permit';
                    if (request.type === 'sick') attendanceStatus = 'sick';
                    if (request.type === 'forgot' as any) attendanceStatus = 'present';

                    // Create or update attendance
                    await prisma.attendance.upsert({
                        where: {
                            attendances_user_id_date_key: {
                                user_id: request.user_id,
                                date: date
                            }
                        },
                        update: {
                            status: attendanceStatus,
                            activity_description: JSON.stringify({
                                via: 'leave-request',
                                request_id: request.id,
                                type: request.type,
                                reason: request.reason
                            })
                        },
                        create: {
                            user_id: request.user_id,
                            date: date,
                            status: attendanceStatus,
                            activity_description: JSON.stringify({
                                via: 'leave-request',
                                request_id: request.id,
                                type: request.type,
                                reason: request.reason
                            })
                        }
                    });
                } catch (err) {
                    console.error(`Error creating attendance for date ${date}:`, err);
                }
            }
        }
        await logAudit({
            action: 'UPDATE_LEAVE_STATUS',
            entity: 'LeaveRequest',
            entityId: id,
            details: { status, notes }
        });

        // Notify Participant
        await createNotification({
            userId: request.user_id,
            title: `Your ${request.type.toUpperCase()} Request: ${status.toUpperCase()}`,
            message: `Your ${request.type} request from ${request.start_date.toLocaleDateString()} has been ${status}. ${notes ? `Notes: ${notes}` : ''}`,
            type: 'leave',
            link: '/dashboarduser'
        });

        return request;
    } catch (error) {
        console.error('Error updating leave request:', error);
        throw error;
    }
}

/**
 * Get leave request by ID
 */
export async function getLeaveRequestById(id: string) {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const { role: userRole, id: userId } = session.user as any;

    try {
        const request = await prisma.leaveRequest.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        unit: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (!request) return null;

        // Security check
        if (userRole === 'participant' && request.user_id !== userId) {
            throw new Error('Forbidden');
        }

        return request;
    } catch (error) {
        console.error('Error fetching leave request:', error);
        throw error;
    }
}

/**
 * Auto-approve pending requests older than 24 hours
 */
export async function autoApproveExpiredRequests() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    try {
        // Find all pending requests created more than 24 hours ago
        const expiredRequests = await prisma.leaveRequest.findMany({
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

        console.log(`[System] Auto-approving ${expiredRequests.length} expired leave requests...`);

        let count = 0;
        for (const req of expiredRequests) {
            try {
                // Use the internal function to bypass session checks
                await executeLeaveRequestUpdate(req.id, 'approved', 'System Auto-Approved (No response from supervisor for 24 hours)');
                count++;
            } catch (err) {
                console.error(`Failed to auto-approve request ${req.id}:`, err);
            }
        }

        return { count };
    } catch (error) {
        console.error('Error in autoApproveExpiredRequests:', error);
        throw error;
    }
}
