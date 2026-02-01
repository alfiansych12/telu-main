
'use server';

import prisma from 'lib/prisma';
import { getserverAuthSession } from 'utils/authOptions';

export async function getMonthlyReportData(filters: {
    month: number;
    year: number;
    userId?: string;
    unitId?: string;
    supervisorId?: string;
}) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role === 'participant') {
        throw new Error('Unauthorized');
    }

    const { role: userRole, id: sessionUserId } = session.user as any;

    try {
        const { month, year, userId, unitId, supervisorId } = filters;

        // Security: Supervisors can only generate reports for their subordinates
        let effectiveSupervisorId = supervisorId;
        if (userRole === 'supervisor') {
            effectiveSupervisorId = sessionUserId;
        }
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of month

        const where: any = {};

        // Filter by specific user or all subordinates of supervisor
        if (userId) {
            where.id = userId;
        } else {
            where.role = 'participant'; // Only generate for participants
            if (effectiveSupervisorId) {
                where.supervisor_id = effectiveSupervisorId;
            }
            if (unitId && unitId !== 'all') {
                where.unit_id = unitId;
            }
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                unit: {
                    select: { name: true }
                },
                supervisor: {
                    select: { name: true }
                },
                attendances: {
                    where: {
                        date: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    select: {
                        date: true,
                        status: true,
                        check_in_time: true,
                        check_out_time: true,
                        activity_description: true
                    }
                },
                leave_requests: {
                    where: {
                        start_date: {
                            gte: startDate
                        },
                        end_date: {
                            lte: endDate
                        },
                        status: 'approved'
                    }
                }
            }
        });

        // Process data for easy consumption
        return users.map((user: any) => {
            const attendanceStats: any = {
                present: 0,
                late: 0,
                absent: 0,
                sick: 0,
                permit: 0,
                total_days: user.attendances.length
            };

            user.attendances.forEach((att: any) => {
                if (att.status) attendanceStats[att.status]++;
            });

            // Calculate simple "score" or insight
            let performanceNote = 'Excellent';
            if (attendanceStats.absent > 1) performanceNote = 'Needs Improvement';
            else if (attendanceStats.late > 2) performanceNote = 'Good (Watch Punctuality)';

            return {
                user: {
                    name: user.name,
                    email: user.email,
                    unit: user.unit?.name || 'N/A',
                    supervisor: user.supervisor?.name || 'N/A'
                },
                stats: attendanceStats,
                attendances: user.attendances,
                leaves: user.leave_requests,
                insight: performanceNote
            };
        });

    } catch (error) {
        console.error('Error generating report data:', error);
        throw new Error('Failed to generate report data');
    }
}
