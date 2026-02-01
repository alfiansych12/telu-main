'use server';

import prisma from 'lib/prisma';
import { getserverAuthSession } from 'utils/authOptions';

export interface AuditLogFilters {
    userId?: string;
    action?: string;
    entity?: string;
    page?: number;
    pageSize?: number;
}

/**
 * Get audit logs with optional filters (Admin only)
 */
export async function getAuditLogs(filters: AuditLogFilters = {}) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Forbidden: Admin access required');
    }

    try {
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 20;
        const skip = (page - 1) * pageSize;

        const where: any = {};
        if (filters.userId) where.user_id = filters.userId;
        if (filters.action) where.action = filters.action;
        if (filters.entity) where.entity = filters.entity;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                skip,
                take: pageSize,
                orderBy: {
                    created_at: 'desc'
                }
            }),
            prisma.auditLog.count({ where })
        ]);

        return {
            logs,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
    }
}
