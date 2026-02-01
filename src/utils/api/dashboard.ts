'use server';

import prisma from 'lib/prisma';
import { getserverAuthSession } from 'utils/authOptions';

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role === 'participant') {
        throw new Error('Unauthorized');
    }

    try {
        console.log('[API] getDashboardStats - Initializing stats fetch');

        // Use Jakarta timezone reference
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        const todayStart = new Date(`${todayStr}T00:00:00Z`);
        const todayEnd = new Date(`${todayStr}T23:59:59Z`);

        console.log('[API] getDashboardStats - Date Range:', { todayStr, todayStart, todayEnd });

        const [totalParticipants, totalSupervisors, totalUnits, todayPresent, unitDistribution] = await Promise.all([
            prisma.user.count({
                where: { role: 'participant', status: 'active' }
            }).catch(e => { console.error('Error counting participants:', e); return 0; }),

            prisma.user.count({
                where: { role: 'supervisor', status: 'active' }
            }).catch(e => { console.error('Error counting supervisors:', e); return 0; }),

            prisma.unit.count({
                where: { status: 'active' }
            }).catch(e => { console.error('Error counting units:', e); return 0; }),

            prisma.attendance.count({
                where: {
                    date: { gte: todayStart, lte: todayEnd },
                    status: { in: ['present', 'late'] }
                }
            }).catch(e => { console.error('Error counting attendance:', e); return 0; }),

            prisma.unit.findMany({
                where: { status: 'active' },
                select: {
                    name: true,
                    _count: {
                        select: {
                            users: {
                                where: { role: 'participant', status: 'active' }
                            }
                        }
                    }
                }
            }).catch(e => { console.error('Error fetching unit distribution:', e); return []; })
        ]);

        console.log('[API] getDashboardStats - Results:', { totalParticipants, totalSupervisors, totalUnits, todayPresent, distributionCount: unitDistribution.length });

        return {
            totalParticipants,
            totalSupervisors,
            totalUnits,
            todayPresent,
            unitDistribution: unitDistribution.map((u: any) => ({
                name: u.name,
                count: u._count.users
            }))
        };
    } catch (error) {
        console.error('[API] getDashboardStats CRITICAL ERROR:', error);
        throw error;
    }
}
