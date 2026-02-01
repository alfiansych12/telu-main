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
}

/**
 * Get leave requests with optional filters
 */
export async function getLeaveRequests(filters: LeaveRequestFilters = {}) {
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

        // 3. Check Monthly Quota
        // Get start and end of current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const existingRequests = await prisma.leaveRequest.findMany({
            where: {
                user_id: data.user_id,
                status: { in: ['approved', 'pending'] },
                start_date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });

        let usedQuota = 0;
        existingRequests.forEach(req => {
            const s = new Date(req.start_date);
            const e = new Date(req.end_date);
            // Only count days falling within this month
            const effectiveStart = s < startOfMonth ? startOfMonth : s;
            const effectiveEnd = e > endOfMonth ? endOfMonth : e;
            const days = Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 3600 * 24)) + 1;
            usedQuota += Math.max(0, days);
        });

        if ((usedQuota + durationDays) > settings.max_monthly_quota) {
            const remaining = Math.max(0, settings.max_monthly_quota - usedQuota);
            throw new Error(`Anda telah mencapai batas kuota izin bulanan. Kuota tersisa: ${remaining} hari. Pengajuan ini butuh ${durationDays} hari.`);
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
            details: { type: leaveRequest.type, start: leaveRequest.start_date, end: leaveRequest.end_date }
        });

        // Notify Supervisor
        const requester = await prisma.user.findUnique({
            where: { id: data.user_id },
            select: { name: true, supervisor_id: true }
        });

        if (requester?.supervisor_id) {
            await createNotification({
                userId: requester.supervisor_id,
                title: `New Leave Request: ${data.type.toUpperCase()}`,
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

/**
 * Update leave request status (Approve/Reject)
 */
export async function updateLeaveRequestStatus(id: string, status: RequestStatus, notes?: string) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role === 'participant') {
        throw new Error('Unauthorized: Only supervisors or admins can update request status');
    }

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
                    // Create or update attendance
                    await prisma.attendance.upsert({
                        where: {
                            attendances_user_id_date_key: {
                                user_id: request.user_id,
                                date: date
                            }
                        },
                        update: {
                            status: request.type === 'sick' ? 'sick' : 'permit',
                            activity_description: JSON.stringify({
                                via: 'leave-request',
                                request_id: request.id,
                                reason: request.reason
                            })
                        },
                        create: {
                            user_id: request.user_id,
                            date: date,
                            status: request.type === 'sick' ? 'sick' : 'permit',
                            activity_description: JSON.stringify({
                                via: 'leave-request',
                                request_id: request.id,
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
