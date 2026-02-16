'use server';

import prisma from 'lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Interface untuk data anak magang yang tidak presensi
 */
export interface AbsentIntern {
    intern_id: string;
    intern_name: string;
    intern_email: string;
    unit_name: string;
    supervisor_id: string;
    supervisor_name: string;
    supervisor_email: string;
    internship_start: Date | null;
    internship_end: Date | null;
}

/**
 * Query untuk mengambil data anak magang yang tidak melakukan presensi hari ini
 * beserta informasi VIC (supervisor) mereka
 */
export async function getAbsentInternsToday(type: 'check_in' | 'check_out' = 'check_in'): Promise<AbsentIntern[]> {
    try {
        const { formatInTimeZone } = await import('date-fns-tz');
        const formattedToday = formatInTimeZone(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd');

        const condition = type === 'check_in'
            ? Prisma.sql`a.id IS NULL OR a.check_in_time IS NULL`
            : Prisma.sql`a.check_out_time IS NULL`;

        const absentInterns = await prisma.$queryRaw<AbsentIntern[]>`
            SELECT 
                u.id as intern_id,
                u.name as intern_name,
                u.email as intern_email,
                un.name as unit_name,
                s.id as supervisor_id,
                s.name as supervisor_name,
                s.email as supervisor_email,
                u.internship_start,
                u.internship_end
            FROM users u
            LEFT JOIN attendances a ON u.id = a.user_id AND a.date = ${formattedToday}::DATE
            LEFT JOIN users s ON u.supervisor_id = s.id
            LEFT JOIN units un ON u.unit_id = un.id
            WHERE 
                u.role = 'participant'
                AND u.status = 'active'
                AND u.deleted_at IS NULL
                AND ${condition}
                AND s.id IS NOT NULL  -- Harus punya supervisor
            ORDER BY s.email, u.name
        `;

        return absentInterns;
    } catch (error) {
        console.error('Error fetching absent interns:', error);
        throw error;
    }
}

/**
 * Query alternatif menggunakan Prisma ORM (lebih readable tapi mungkin lebih lambat)
 */
export async function getAbsentInternsTodayORM(): Promise<AbsentIntern[]> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Ambil semua participant yang aktif dan punya supervisor
        const activeInterns = await prisma.user.findMany({
            where: {
                role: 'participant',
                status: 'active',
                deleted_at: null,
                supervisor_id: { not: null },
                internship_start: { lte: today },
                OR: [
                    { internship_end: null },
                    { internship_end: { gte: today } }
                ]
            },
            include: {
                supervisor: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                unit: {
                    select: {
                        name: true
                    }
                },
                attendances: {
                    where: {
                        date: today
                    }
                }
            }
        });

        // Filter yang tidak ada attendance hari ini
        const absentInterns = activeInterns
            .filter(intern => intern.attendances.length === 0)
            .map(intern => ({
                intern_id: intern.id,
                intern_name: intern.name,
                intern_email: intern.email,
                unit_name: intern.unit?.name || 'N/A',
                supervisor_id: intern.supervisor?.id || '',
                supervisor_name: intern.supervisor?.name || 'N/A',
                supervisor_email: intern.supervisor?.email || '',
                internship_start: intern.internship_start,
                internship_end: intern.internship_end
            }));

        return absentInterns;
    } catch (error) {
        console.error('Error fetching absent interns (ORM):', error);
        throw error;
    }
}

/**
 * Group absent interns by supervisor untuk batch notification
 */
export async function getAbsentInternsGroupedBySupervisor(type: 'check_in' | 'check_out' = 'check_in') {
    const absentInterns = await getAbsentInternsToday(type);

    const grouped = absentInterns.reduce((acc, intern) => {
        const supervisorEmail = intern.supervisor_email;

        if (!acc[supervisorEmail]) {
            acc[supervisorEmail] = {
                supervisor_id: intern.supervisor_id,
                supervisor_name: intern.supervisor_name,
                supervisor_email: intern.supervisor_email,
                absent_interns: []
            };
        }

        acc[supervisorEmail].absent_interns.push({
            intern_id: intern.intern_id,
            intern_name: intern.intern_name,
            intern_email: intern.intern_email,
            unit_name: intern.unit_name
        });

        return acc;
    }, {} as Record<string, {
        supervisor_id: string;
        supervisor_name: string;
        supervisor_email: string;
        absent_interns: Array<{
            intern_id: string;
            intern_name: string;
            intern_email: string;
            unit_name: string;
        }>;
    }>);

    return Object.values(grouped);
}
