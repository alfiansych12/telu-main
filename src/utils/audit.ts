'use server';

import prisma from 'lib/prisma';
import { getserverAuthSession } from 'utils/authOptions';
import { headers } from 'next/headers';

interface AuditLogParams {
    action: string;
    entity: string;
    entityId?: string;
    details?: any;
}

/**
 * Logs a system activity to the audit_logs table.
 * This is intended to be called from Server Actions or API routes.
 */
export async function logAudit({
    action,
    entity,
    entityId,
    details
}: AuditLogParams) {
    try {
        const session = await getserverAuthSession();

        let ipAddress = 'unknown';
        let userAgent = 'unknown';

        try {
            const headerList = headers();
            ipAddress = headerList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
            userAgent = headerList.get('user-agent') || 'unknown';
        } catch (hError) {
            // headers() might not be available in some non-request contexts
            console.warn('Headers not available for audit log');
        }

        await (prisma as any).auditLog.create({
            data: {
                user_id: (session?.user as any)?.id || null,
                action,
                entity,
                entity_id: entityId,
                details: details ? JSON.parse(JSON.stringify(details)) : null,
                ip_address: ipAddress,
                user_agent: userAgent
            }
        });
    } catch (error) {
        // Critical: Audit logging should NOT break the main user flow
        console.error('CRITICAL: Audit log failed creation:', error);
    }
}
