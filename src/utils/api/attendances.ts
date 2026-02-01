'use server';

import prisma from 'lib/prisma';
import { AttendanceStatus } from '@prisma/client';
import { getserverAuthSession } from 'utils/authOptions';
import { AttendanceWithRelations } from 'types/api';
import { createNotification } from './notifications';

export interface GetAttendancesFilters {
    userId?: string;
    unitId?: string;
    supervisorId?: string;
    status?: 'present' | 'absent' | 'late' | 'permit' | 'sick' | 'rejected';
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
}

/**
 * Get attendances with optional filters
 */
export async function getAttendances(filters: GetAttendancesFilters = {}) {
    const session = await getserverAuthSession();
    if (!session) {
        console.warn('[API] getAttendances - Unauthorized access attempt');
        throw new Error('Unauthorized');
    }

    const { role: userRole, id: userId } = session.user as any;

    try {
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 10;
        const skip = (page - 1) * pageSize;

        const where: any = {};

        // Security: Restrict what filters can be applied based on role
        if (userRole === 'participant') {
            where.user_id = userId; // Force self only
            (filters as any).userId = userId;
            (filters as any).unitId = undefined;
            (filters as any).supervisorId = undefined;
        } else if (userRole === 'supervisor') {
            // Supervisors can see their subordinates or their own
            if (filters.userId && filters.userId !== userId) {
                where.user = { supervisor_id: userId };
            } else if (!filters.userId) {
                where.user = { supervisor_id: userId };
            }
        }
        // Admin has no restrictions on where filters


        if (filters.userId) {
            where.user_id = filters.userId;
        }

        if (filters.status) {
            if (filters.status === 'excused' as any) {
                where.status = { in: ['permit', 'sick'] };
            } else {
                where.status = filters.status as AttendanceStatus;
            }
        }

        if (filters.dateFrom || filters.dateTo) {
            where.date = {};
            if (filters.dateFrom) {
                // Ensure date is treated as YYYY-MM-DD
                const dateParts = filters.dateFrom.split('-');
                if (dateParts.length === 3) {
                    const dFrom = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
                    dFrom.setHours(0, 0, 0, 0);
                    where.date.gte = dFrom;
                } else {
                    where.date.gte = new Date(filters.dateFrom);
                }
            }
            if (filters.dateTo) {
                const dateParts = filters.dateTo.split('-');
                if (dateParts.length === 3) {
                    const dTo = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
                    dTo.setHours(23, 59, 59, 999);
                    where.date.lte = dTo;
                } else {
                    where.date.lte = new Date(filters.dateTo);
                }
            }
        }

        if (filters.supervisorId || filters.unitId) {
            where.user = where.user || {};
            if (filters.supervisorId) {
                where.user.supervisor_id = filters.supervisorId;
            }
            if (filters.unitId) {
                where.user.unit_id = filters.unitId;
            }
        }

        const [attendances, , users, leaveRequests] = await Promise.all([
            prisma.attendance.findMany({
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
                orderBy: [
                    { date: 'desc' },
                    { check_in_time: 'desc' }
                ]
            }),
            prisma.attendance.count({ where }),
            // Fetch all participants to check for those who didn't check in
            prisma.user.findMany({
                where: {
                    role: 'participant',
                    status: 'active',
                    // Apply filters if we are filtering by unit or supervisor
                    ...(filters.unitId ? { unit_id: filters.unitId } : {}),
                    ...(filters.supervisorId ? { supervisor_id: filters.supervisorId } : {}),
                    ...(filters.userId ? { id: filters.userId } : {})
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    internship_start: true,
                    internship_end: true,
                    unit_id: true,
                    unit: { select: { name: true } }
                }
            }),
            // Fetch approved leave requests to distinguish between Absent and Excused
            prisma.leaveRequest.findMany({
                where: {
                    status: 'approved',
                    ...(filters.userId ? { user_id: filters.userId } : {})
                    // Date filter will be applied during cross-check
                }
            })
        ]);

        // 3. Synthesize Absent Records
        const synthesizedData: any[] = [];
        const dateRange: string[] = [];
        const todayStr = new Date().toISOString().split('T')[0];
        const todayObj = new Date(todayStr);

        if (filters.dateFrom && filters.dateTo) {
            let curr = new Date(filters.dateFrom);
            let end = new Date(filters.dateTo);
            if (end > todayObj) end = todayObj;
            while (curr <= end) {
                dateRange.push(curr.toISOString().split('T')[0]);
                curr.setDate(curr.getDate() + 1);
            }
        } else {
            dateRange.push(todayStr);
        }

        // Fetch settings for threshold check
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'checkin_location' }
        });
        const absentThresholdStr = (setting?.value as any)?.absent_threshold_time || '12:00';
        const [abHours, abMinutes] = absentThresholdStr.split(':').map(Number);

        const now = new Date();
        const isPastAbsentThresholdToday = now.getHours() > abHours || (now.getHours() === abHours && now.getMinutes() >= abMinutes);

        // Pre-map attendances and leave requests for O(1) lookup
        const attendanceMap = new Map();
        attendances.forEach(a => {
            const key = `${a.user_id}-${new Date(a.date).toISOString().split('T')[0]}`;
            attendanceMap.set(key, a);
        });

        const leaveMap = new Map();
        leaveRequests.forEach(l => {
            // For each day of the leave, add to map
            let curr = new Date(l.start_date);
            const limit = new Date(l.end_date);
            while (curr <= limit) {
                const dayStr = curr.toISOString().split('T')[0];
                const key = `${l.user_id}-${dayStr}`;
                leaveMap.set(key, l);
                curr.setDate(curr.getDate() + 1);
            }
        });

        users.forEach(u => {
            dateRange.forEach(dStr => {
                const dateObj = new Date(dStr);
                dateObj.setHours(0, 0, 0, 0);

                // Check if user's internship has started and not ended for this date
                const start = u.internship_start ? new Date(u.internship_start) : null;
                const end = u.internship_end ? new Date(u.internship_end) : null;

                if (start) start.setHours(0, 0, 0, 0);
                if (end) end.setHours(23, 59, 59, 999);

                const isWithinInternship = (!start || dateObj >= start) && (!end || dateObj <= end);

                // If not within internship period, skip synthesis
                if (!isWithinInternship) return;

                // Check if user has an attendance record for this date
                const key = `${u.id}-${dStr}`;
                const hasRealRecord = attendanceMap.has(key);

                if (!hasRealRecord) {
                    // Check if they have an approved leave for this date
                    const leave = leaveMap.get(key);

                    // Logic: Mark as absent if it's a past date OR if it's today and past absent threshold
                    const isToday = dStr === todayStr;
                    const shouldMarkAbsent = !isToday || isPastAbsentThresholdToday;

                    if (shouldMarkAbsent || leave) {
                        synthesizedData.push({
                            id: `absent-${u.id}-${dStr}`,
                            user_id: u.id,
                            date: dateObj,
                            check_in_time: null,
                            check_out_time: null,
                            status: leave ? (leave.type === 'sick' ? 'sick' : 'permit') : 'absent',
                            activity_description: leave ? `Approved Leave: ${leave.reason}` : 'No check-in record for this day',
                            user: {
                                id: u.id,
                                name: u.name,
                                email: u.email,
                                unit: u.unit
                            },
                            created_at: new Date(),
                            updated_at: new Date()
                        });
                    }
                }
            });
        });

        // 4. Fetch Rejected Monitoring Requests
        const skipRejected = filters.status && filters.status !== 'rejected' ? true : false;
        let rejectedOnes: any[] = [];

        if (!skipRejected) {
            const rejectedWhere: any = { status: 'rejected' };
            if (filters.userId) rejectedWhere.user_id = filters.userId;
            if (filters.dateFrom || filters.dateTo) {
                rejectedWhere.request_date = {};
                if (filters.dateFrom) rejectedWhere.request_date.gte = new Date(filters.dateFrom);
                if (filters.dateTo) rejectedWhere.request_date.lte = new Date(filters.dateTo);
            }
            if (filters.supervisorId || filters.unitId) {
                rejectedWhere.user = {};
                if (filters.supervisorId) rejectedWhere.user.supervisor_id = filters.supervisorId;
                if (filters.unitId) rejectedWhere.user.unit_id = filters.unitId;
            }

            [rejectedOnes] = await Promise.all([
                prisma.monitoringLocation.findMany({
                    where: rejectedWhere,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                unit: { select: { name: true } }
                            }
                        }
                    },
                    // We take the same amount to ensure we have enough to merge
                    take: skip + pageSize,
                    orderBy: { request_date: 'desc' }
                })
            ]);
        }

        // 5. Merge and Map
        const mappedRejected = rejectedOnes.map(r => ({
            id: r.id,
            user_id: r.user_id,
            date: r.request_date,
            check_in_time: null,
            check_out_time: null,
            status: 'rejected',
            activity_description: JSON.stringify({
                plan: r.reason,
                notes: r.notes,
                via: 'out-area-rejection'
            }),
            user: r.user,
            created_at: r.created_at,
            updated_at: r.created_at
        }));

        let combined = [...attendances, ...synthesizedData, ...mappedRejected];

        // Filter by status if requested (since synthesized records have statuses too)
        if (filters.status) {
            if (filters.status === 'permit' || filters.status === 'sick') {
                combined = combined.filter(c => c.status === filters.status);
            } else if (filters.status === 'present') {
                combined = combined.filter(c => c.status === 'present');
            } else if (filters.status === 'late') {
                combined = combined.filter(c => c.status === 'late');
            } else if (filters.status === 'absent') {
                combined = combined.filter(c => c.status === 'absent');
            }
            // Add more status filters if needed
        }

        // Sort by date desc
        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Calculate final counts after synthesis
        const finalTotal = combined.length;
        const stats = {
            present: combined.filter(c => c.status === 'present').length,
            late: combined.filter(c => c.status === 'late').length,
            absent: combined.filter(c => c.status === 'absent').length,
            excused: combined.filter(c => c.status === 'permit' || c.status === 'sick').length,
        };

        // Slice to current page size
        const pagedResult = combined.slice(skip, skip + pageSize);

        return {
            data: pagedResult as unknown as AttendanceWithRelations[],
            total: finalTotal,
            stats,
            page,
            pageSize,
            totalPages: Math.ceil(finalTotal / pageSize),
        } as any;
    } catch (error) {
        console.error('Error fetching attendances:', error);
        throw error;
    }
}

/**
 * Get attendance by ID
 */
export async function getAttendanceById(id: string) {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const { role: userRole, id: userId } = session.user as any;

    try {
        const attendance = await prisma.attendance.findUnique({
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

        if (!attendance) return null;

        // Security check: participants can only see their own attendance
        if (userRole === 'participant' && attendance.user_id !== userId) {
            throw new Error('Forbidden: Access denied to this attendance record');
        }

        return attendance as unknown as AttendanceWithRelations;
    } catch (error) {
        console.error('Error fetching attendance:', error);
        throw error;
    }
}

/**
 * Create new attendance
 */
export async function createAttendance(attendanceData: any) {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const { role: userRole, id: userId } = session.user as any;

    // Security: participants can only create attendance for themselves
    if (userRole === 'participant' && attendanceData.user_id !== userId) {
        throw new Error('Forbidden: Cannot create attendance for another user');
    }

    try {
        const data: any = { ...attendanceData };

        // Ensure date is a proper Date object
        if (data.date) data.date = new Date(data.date);

        // Ensure check_in_time and check_out_time are proper Date objects
        if (typeof data.check_in_time === 'string' && data.check_in_time.match(/^\d{2}:\d{2}:\d{2}$/)) {
            data.check_in_time = new Date(`1970-01-01T${data.check_in_time}Z`);
        } else if (data.check_in_time) {
            data.check_in_time = new Date(data.check_in_time);
        }

        if (typeof data.check_out_time === 'string' && data.check_out_time.match(/^\d{2}:\d{2}:\d{2}$/)) {
            data.check_out_time = new Date(`1970-01-01T${data.check_out_time}Z`);
        } else if (data.check_out_time) {
            data.check_out_time = new Date(data.check_out_time);
        }

        // LATE & ABSENT CHECK LOGIC (with Jakarta timezone)
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'checkin_location' }
        });

        if (setting && setting.value) {
            const settingsVal = setting.value as any;
            const thresholdStr = settingsVal.late_threshold_time || '08:15';
            const absentThresholdStr = settingsVal.absent_threshold_time || '12:00';

            const [thHours, thMinutes] = thresholdStr.split(':').map(Number);
            const [abHours, abMinutes] = absentThresholdStr.split(':').map(Number);

            // Convert check-in time to Jakarta timezone for comparison
            const { toZonedTime } = await import('date-fns-tz');
            const TIMEZONE = 'Asia/Jakarta';
            const checkInTime = toZonedTime(new Date(data.check_in_time), TIMEZONE);

            // Create threshold date objects in Jakarta timezone
            const thresholdDate = new Date(checkInTime);
            thresholdDate.setHours(thHours, thMinutes, 0, 0);

            const absentThresholdDate = new Date(checkInTime);
            absentThresholdDate.setHours(abHours, abMinutes, 0, 0);

            // If check_in_time is AFTER the absent threshold, mark as Absent
            if (checkInTime > absentThresholdDate) {
                console.log(`[JAKARTA TZ] Check-in at ${checkInTime.toLocaleTimeString('id-ID', { timeZone: TIMEZONE })} is ABSENT (Threshold: ${absentThresholdStr})`);
                data.status = 'absent';
            }
            // If check_in_time is AFTER the late threshold, mark as Late
            else if (checkInTime > thresholdDate) {
                console.log(`[JAKARTA TZ] Check-in at ${checkInTime.toLocaleTimeString('id-ID', { timeZone: TIMEZONE })} is LATE (Threshold: ${thresholdStr})`);
                data.status = 'late';
            }
        }

        // Check if attendance already exists for this user and date
        const existing = await prisma.attendance.findUnique({
            where: {
                attendances_user_id_date_key: {
                    user_id: data.user_id,
                    date: data.date
                }
            }
        });

        if (existing) {
            return existing;
        }

        const attendance = await prisma.attendance.create({
            data
        });

        // Notify user if LATE or ABSENT
        if (data.status === 'late') {
            await createNotification({
                userId: data.user_id,
                title: 'Late Check-in',
                message: `You checked in late today at ${new Date(data.check_in_time).toLocaleTimeString()}. Please be on time tomorrow!`,
                type: 'attendance',
                link: '/dashboarduser'
            });
        } else if (data.status === 'absent') {
            await createNotification({
                userId: data.user_id,
                title: 'Extremely Late - Marked Absent',
                message: `You checked in at ${new Date(data.check_in_time).toLocaleTimeString()}, which is past the absent threshold (${setting ? (setting.value as any).absent_threshold_time : '12:00'}). Your status is marked as Absent.`,
                type: 'attendance',
                link: '/dashboarduser'
            });
        }

        return attendance;
    } catch (error) {
        console.error('Error creating attendance:', error);
        throw error;
    }
}

/**
 * Update attendance
 */
export async function updateAttendance(id: string, attendanceData: any) {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const { role: userRole, id: userId } = session.user as any;

    try {
        // Ownership check: participants can only update their own records
        if (userRole === 'participant') {
            const existingRecord = await prisma.attendance.findUnique({
                where: { id },
                select: { user_id: true }
            });
            if (existingRecord && existingRecord.user_id !== userId) {
                throw new Error('Forbidden: Cannot update someone else\'s record');
            }
        }

        const data: any = { ...attendanceData };

        if (data.date) data.date = new Date(data.date);

        if (typeof data.check_in_time === 'string' && data.check_in_time.match(/^\d{2}:\d{2}:\d{2}$/)) {
            data.check_in_time = new Date(`1970-01-01T${data.check_in_time}Z`);
        } else if (data.check_in_time) {
            data.check_in_time = new Date(data.check_in_time);
        }

        if (typeof data.check_out_time === 'string' && data.check_out_time.match(/^\d{2}:\d{2}:\d{2}$/)) {
            data.check_out_time = new Date(`1970-01-01T${data.check_out_time}Z`);
        } else if (data.check_out_time) {
            data.check_out_time = new Date(data.check_out_time);
        }

        // EARLY CHECKOUT PREVENTION LOGIC
        if (data.check_out_time) {
            const setting = await prisma.systemSetting.findUnique({
                where: { key: 'checkin_location' }
            });

            if (setting && setting.value) {
                const settingsVal = setting.value as any;
                const earliestStr = settingsVal.earliest_checkout_time || '17:00';
                const [eaHours, eaMinutes] = earliestStr.split(':').map(Number);

                const checkOutTime = new Date(data.check_out_time);
                // Create a limit date object for the same day as the check-out
                const limitDate = new Date(checkOutTime);
                limitDate.setHours(eaHours, eaMinutes, 0, 0);

                // If check_out_time is BEFORE the limit, throw error
                if (checkOutTime < limitDate) {
                    console.log(`Check-out at ${checkOutTime.toLocaleTimeString()} prevented (Too Early, Limit: ${earliestStr})`);
                    throw new Error(`Cannot check out before ${earliestStr}. Please wait until the designated time.`);
                }
            }
        }

        const attendance = await prisma.attendance.update({
            where: { id },
            data
        });
        return attendance;
    } catch (error) {
        console.error('Error updating attendance:', error);
        throw error;
    }
}

/**
 * Get weekly attendance trend for a supervisor or unit
 */
export async function getWeeklyAttendanceTrend(supervisorId?: string, unitId?: string) {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const { role: userRole, id: userId } = session.user as any;

    // Security: restrict visibility
    let effectiveSupervisorId = supervisorId;
    if (userRole === 'supervisor') {
        effectiveSupervisorId = userId; // Supervisors see their own trend
    } else if (userRole === 'participant') {
        throw new Error('Forbidden');
    }

    try {
        const today = new Date();
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            d.setHours(0, 0, 0, 0);
            last7Days.push(d);
        }

        const dateFrom = last7Days[0];
        const dateTo = new Date(today);
        dateTo.setHours(23, 59, 59, 999);

        const where: any = {
            date: {
                gte: dateFrom,
                lte: dateTo
            }
        };

        if (effectiveSupervisorId) {
            where.user = { supervisor_id: effectiveSupervisorId };
        }
        if (unitId) {
            where.user = { ...where.user, unit_id: unitId };
        }

        const attendances = await prisma.attendance.findMany({
            where,
            select: {
                date: true,
                status: true
            }
        });

        // Map data to days of week
        const trend = last7Days.map(day => {
            const count = attendances.filter((a: any) =>
                new Date(a.date).toDateString() === day.toDateString() &&
                (a.status === 'present' || a.status === 'late')
            ).length;

            return {
                day: day.toLocaleDateString('en-US', { weekday: 'short' }),
                count
            };
        });

        return trend;
    } catch (error) {
        console.error('Error fetching weekly trend:', error);
        throw error;
    }
}

/**
 * Get today's attendance count
 */
export async function getTodayAttendanceCount() {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role === 'participant') {
        throw new Error('Unauthorized');
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = await prisma.attendance.count({
            where: {
                date: today,
                status: 'present'
            }
        });
        return count;
    } catch (error) {
        console.error('Error fetching today attendance count:', error);
        throw error;
    }
}
