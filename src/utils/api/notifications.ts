'use server';

import prisma from 'lib/prisma';
import { getserverAuthSession } from 'utils/authOptions';
import { revalidatePath } from 'next/cache';
import { sendEmailNotification } from './email';

export type NotificationType = 'leave' | 'attendance' | 'assessment' | 'system' | 'monitoring';

interface CreateNotificationParams {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
}

/**
 * Create a new notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
    try {
        const notification = await (prisma as any).userNotification.create({
            data: {
                user_id: params.userId,
                title: params.title,
                message: params.message,
                type: params.type,
                link: params.link,
                is_read: false
            }
        });

        // In a real app, you might trigger an email here too
        const user = await prisma.user.findUnique({
            where: { id: params.userId },
            select: { email: true }
        });

        if (user?.email) {
            await sendEmailNotification(user.email, params.title, params.message);
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        // Don't throw error to avoid breaking the main flow
        return null;
    }
}

/**
 * Get notifications for the current user
 */
export async function getNotifications(limit = 20) {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const userId = (session.user as any).id;

    try {
        const notifications = await (prisma as any).userNotification.findMany({
            where: {
                user_id: userId
            },
            orderBy: {
                created_at: 'desc'
            },
            take: limit
        });

        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

/**
 * Get unread notifications count
 */
export async function getUnreadCount() {
    const session = await getserverAuthSession();
    if (!session) return 0;

    const userId = (session.user as any).id;

    try {
        const count = await (prisma as any).userNotification.count({
            where: {
                user_id: userId,
                is_read: false
            }
        });

        return count;
    } catch (error) {
        return 0;
    }
}

/**
 * Get both notifications and unread count in one call
 */
export async function getNotificationSummary(limit = 10) {
    const session = await getserverAuthSession();
    if (!session) return { notifications: [], unreadCount: 0 };

    const userId = (session.user as any).id;

    try {
        const [notifications, unreadCount] = await Promise.all([
            (prisma as any).userNotification.findMany({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' },
                take: limit
            }),
            (prisma as any).userNotification.count({
                where: { user_id: userId, is_read: false }
            })
        ]);

        return { notifications, unreadCount };
    } catch (error) {
        console.error('Error fetching notification summary:', error);
        return { notifications: [], unreadCount: 0 };
    }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(id: string) {
    const session = await getserverAuthSession();
    if (!session) throw new Error('Unauthorized');

    try {
        await (prisma as any).userNotification.update({
            where: { id },
            data: { is_read: true }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return { success: false };
    }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllAsRead() {
    const session = await getserverAuthSession();
    if (!session) throw new Error('Unauthorized');

    const userId = (session.user as any).id;

    try {
        await (prisma as any).userNotification.updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return { success: false };
    }
}
