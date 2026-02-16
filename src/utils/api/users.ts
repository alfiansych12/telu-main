'use server';

import prisma from 'lib/prisma';
import { UserRole, EntityStatus, Prisma } from '@prisma/client';
import { getserverAuthSession } from 'utils/authOptions';
import { UserWithRelations, PaginatedResponse } from 'types/api';
import { logAudit } from 'utils/audit';

export interface GetUsersFilters {
    role?: 'participant' | 'supervisor' | 'admin';
    status?: 'active' | 'inactive';
    unitId?: string;
    supervisorId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

/**
 * Get all users with optional filters
 */
export async function getUsers(filters: GetUsersFilters = {}) {
    const session = await getserverAuthSession();
    if (!session) {
        console.warn('[API] getUsers - Unauthorized access attempt');
        throw new Error('Unauthorized');
    }

    const { role: userRole } = session.user as any;

    // Basic protection: only Admin and Supervisor should list users
    if (userRole !== 'admin' && userRole !== 'supervisor') {
        throw new Error('Forbidden');
    }

    try {
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 10;
        const skip = (page - 1) * pageSize;

        const where: Prisma.UserWhereInput = {
            deleted_at: null
        };

        if (filters.role) {
            where.role = filters.role as UserRole;
        }

        if (filters.status) {
            where.status = filters.status as EntityStatus;
        }

        if (filters.unitId) {
            where.unit_id = filters.unitId;
        }

        if (filters.supervisorId) {
            where.supervisor_id = filters.supervisorId;
        }

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { personal_email: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    unit: {
                        select: {
                            id: true,
                            name: true,
                            department: true
                        }
                    },
                    supervisor: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                skip,
                take: pageSize,
                orderBy: {
                    created_at: 'desc'
                }
            }),
            prisma.user.count({ where })
        ]);

        const mappedUsers = users.map((u: any) => ({
            ...u,
            supervisor_name: u.supervisor?.name
        }));

        return {
            data: mappedUsers as unknown as UserWithRelations[],
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        } as PaginatedResponse<UserWithRelations>;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
    if (!id) return null;

    const session = await getserverAuthSession();
    if (!session) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                unit: {
                    select: {
                        id: true,
                        name: true,
                        department: true
                    }
                },
                supervisor: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                assessments: {
                    take: 1,
                    orderBy: {
                        created_at: 'desc'
                    }
                }
            }
        });

        return {
            ...user,
            supervisor_name: (user as any)?.supervisor?.name
        } as unknown as (UserWithRelations & { assessments: any[] });
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

/**
 * Create new user
 */
export async function createUser(userData: any) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Operation not allowed. Admin privilege required.');
    }

    try {
        const {
            name, email, role, status,
            unit_id, supervisor_id, password,
            photo, phone, institution_name, institution_type,
            personal_email, telegram_username, id_number,
            internship_start, internship_end
        } = userData;

        const data: any = {
            name,
            email,
            role: role as UserRole,
            status: status as EntityStatus,
            photo: photo || null,
            phone: phone || null,
            institution_name: institution_name || null,
            institution_type: institution_type || null,
            personal_email: personal_email || null,
            telegram_username: telegram_username || null,
            id_number: id_number || null,
            internship_start: internship_start ? new Date(internship_start) : null,
            internship_end: internship_end ? new Date(internship_end) : null
        };

        // Secure password handling
        if (role === 'admin') {
            data.password = null; // Admins MUST use SSO
        } else if (password && typeof password === 'string' && password.trim() !== '') {
            data.password = password;
        } else {
            data.password = null; // Default to null for participants if no password provided
        }

        // Handle Relations
        if (unit_id) {
            data.unit = { connect: { id: unit_id } };
        }

        if (supervisor_id && role === 'participant') {
            data.supervisor = { connect: { id: supervisor_id } };
        }

        const user = await prisma.user.create({
            data
        });

        await logAudit({
            action: 'CREATE_USER',
            entity: 'User',
            entityId: user.id,
            details: { email: user.email, role: user.role }
        });

        return user;
    } catch (error: any) {
        console.error('Error creating user:', error);
        throw new Error(error.message || 'Error occurred while creating user');
    }
}

/**
 * Update user
 */
export async function updateUser(id: string, userData: any) {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const { role: sessionUserRole, id: sessionUserId } = session.user as any;

    // Security check: only admin can update others, users can update themselves
    if (sessionUserRole !== 'admin' && id !== sessionUserId) {
        throw new Error('Forbidden: You can only update your own profile');
    }

    try {
        const {
            name, email, role, status,
            unit_id, supervisor_id, password,
            photo, phone, institution_name, institution_type,
            personal_email, telegram_username, id_number,
            internship_start, internship_end
        } = userData;

        const data: any = {};

        // Only include fields in the update if they are provided
        if (name !== undefined) data.name = name;
        if (email !== undefined) data.email = email;
        if (role !== undefined) data.role = role as UserRole;
        if (status !== undefined) data.status = status as EntityStatus;
        if (photo !== undefined) data.photo = photo;
        if (phone !== undefined) data.phone = phone;
        if (institution_name !== undefined) data.institution_name = institution_name;
        if (institution_type !== undefined) data.institution_type = institution_type;
        if (personal_email !== undefined) data.personal_email = personal_email;
        if (telegram_username !== undefined) data.telegram_username = telegram_username;
        if (id_number !== undefined) data.id_number = id_number;
        if (internship_start !== undefined) data.internship_start = internship_start ? new Date(internship_start) : null;
        if (internship_end !== undefined) data.internship_end = internship_end ? new Date(internship_end) : null;

        // Detect current user to check role for password/supervisor logic
        let currentRole = role;
        if (!currentRole) {
            const existingUser = await prisma.user.findUnique({
                where: { id },
                select: { role: true }
            });
            currentRole = existingUser?.role;
        }

        // Secure password handling
        if (password !== undefined) {
            if (currentRole === 'admin') {
                data.password = null; // Admin MUST use SSO
            } else if (password && typeof password === 'string' && password.trim() !== '') {
                data.password = password;
            } else if (currentRole === 'participant') {
                // If it's a participant and password is blank, we might want to keep current 
                // but if it's explicitly set to something empty, maybe we don't update it
            }
        }

        // Handle unit relation
        if (unit_id !== undefined) {
            if (unit_id) {
                data.unit = { connect: { id: unit_id } };
            } else {
                data.unit = { disconnect: true };
            }
        }

        // Handle supervisor relation
        if (currentRole === 'participant') {
            if (supervisor_id !== undefined) {
                if (supervisor_id) {
                    data.supervisor = { connect: { id: supervisor_id } };
                } else {
                    data.supervisor = { disconnect: true };
                }
            }
        } else if (currentRole && currentRole !== 'participant') {
            data.supervisor = { disconnect: true };
        }

        const user = await prisma.user.update({
            where: { id },
            data
        });

        await logAudit({
            action: 'UPDATE_USER',
            entity: 'User',
            entityId: user.id,
            details: { email: user.email, updatedFields: Object.keys(data) }
        });

        return user;
    } catch (error: any) {
        console.error('Error updating user:', error);
        throw new Error(error.message || 'Error occurred while updating user');
    }
}

/**
 * Delete user
 */
export async function deleteUser(id: string) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Operation not allowed. Admin privilege required.');
    }

    try {
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            console.error(`Attempted to delete non-existent user with ID: ${id}`);
            return { success: false, message: 'User not found' };
        }

        // Prevent self-deletion
        if (user.id === (session.user as any).id) {
            throw new Error('You cannot delete your own account.');
        }

        await prisma.user.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                deleted_by: (session.user as any).id,
                status: 'inactive'
            }
        });

        await logAudit({
            action: 'SOFT_DELETE_USER',
            entity: 'User',
            entityId: id,
            details: { email: user.email, name: user.name }
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error soft deleting user:', error);
        if (error.code === 'P2025') {
            return { success: false, message: 'User already deleted or not found' };
        }
        throw error;
    }
}

/**
 * Delete multiple users
 */
export async function deleteUsers(ids: string[]) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Operation not allowed. Admin privilege required.');
    }

    try {
        const currentUserId = (session.user as any).id;

        // Filter out the current user to prevent self-deletion in bulk
        const targetIds = ids.filter(id => id !== currentUserId);

        if (targetIds.length === 0) {
            return { success: true, count: 0 };
        }

        const deleteResult = await prisma.user.updateMany({
            where: {
                id: { in: targetIds }
            },
            data: {
                deleted_at: new Date(),
                deleted_by: (session.user as any).id,
                status: 'inactive'
            }
        });

        await logAudit({
            action: 'BULK_SOFT_DELETE_USERS',
            entity: 'User',
            details: { count: deleteResult.count, ids: targetIds }
        });

        return { success: true, count: deleteResult.count };
    } catch (error: any) {
        console.error('Error bulk soft deleting users:', error);
        throw error;
    }
}

/**
 * Get all soft-deleted users
 */
export async function getDeletedUsers() {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                deleted_at: { not: null }
            },
            include: {
                unit: { select: { name: true } }
            },
            orderBy: {
                deleted_at: 'desc'
            }
        });

        // Get admin names for deleted_by
        const adminIds = users.filter((u: any) => u.deleted_by).map((u: any) => u.deleted_by);
        const admins = await prisma.user.findMany({
            where: { id: { in: adminIds } },
            select: { id: true, name: true }
        });
        const adminMap = new Map(admins.map(a => [a.id, a.name]));

        return users.map((u: any) => ({
            ...u,
            deleted_by_name: adminMap.get(u.deleted_by) || 'System'
        }));
    } catch (error) {
        console.error('Error fetching deleted users:', error);
        throw error;
    }
}

/**
 * Restore a soft-deleted user
 */
export async function restoreUser(id: string) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.user.update({
            where: { id },
            data: {
                deleted_at: null,
                deleted_by: null,
                status: 'active'
            }
        });

        await logAudit({
            action: 'RESTORE_USER',
            entity: 'User',
            entityId: id
        });

        return { success: true };
    } catch (error) {
        console.error('Error restoring user:', error);
        throw error;
    }
}

/**
 * Permanently delete a user
 */
export async function permanentlyDeleteUser(id: string) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.user.delete({
            where: { id }
        });

        await logAudit({
            action: 'PERMANENT_DELETE_USER',
            entity: 'User',
            entityId: id
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error permanently deleting user:', error);
        if (error.code === 'P2003') {
            return { success: false, message: 'Cannot delete because user has related records.' };
        }
        throw error;
    }
}

/**
 * Restore multiple soft-deleted users
 */
export async function restoreUsers(ids: string[]) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    try {
        const result = await prisma.user.updateMany({
            where: { id: { in: ids } },
            data: {
                deleted_at: null,
                deleted_by: null,
                status: 'active'
            }
        });

        await logAudit({
            action: 'BULK_RESTORE_USERS',
            entity: 'User',
            details: { count: result.count, ids }
        });

        return { success: true, count: result.count };
    } catch (error) {
        console.error('Error bulk restoring users:', error);
        throw error;
    }
}

/**
 * Permanently delete multiple users
 */
export async function permanentlyDeleteUsers(ids: string[]) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    try {
        const result = await prisma.user.deleteMany({
            where: { id: { in: ids } }
        });

        await logAudit({
            action: 'BULK_PERMANENT_DELETE_USERS',
            entity: 'User',
            details: { count: result.count, ids }
        });

        return { success: true, count: result.count };
    } catch (error: any) {
        console.error('Error bulk permanently deleting users:', error);
        if (error.code === 'P2003') {
            return { success: false, message: 'Some users cannot be deleted because they have related records.' };
        }
        throw error;
    }
}


/**
 * Get users count by role
 */
export async function getUserCountByRole() {
    const session = await getserverAuthSession();
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'supervisor')) {
        throw new Error('Unauthorized');
    }

    try {
        const result = await prisma.user.groupBy({
            by: ['role', 'status'],
            _count: {
                _all: true
            }
        });

        const counts = {
            totalParticipants: 0,
            totalSupervisors: 0,
            totalAdmins: 0,
            totalInactive: 0,
        };

        result.forEach((item: any) => {
            if (item.status === 'inactive') {
                counts.totalInactive += item._count._all;
            } else if (item.status === 'active') {
                if (item.role === 'participant') counts.totalParticipants += item._count._all;
                if (item.role === 'supervisor') counts.totalSupervisors += item._count._all;
                if (item.role === 'admin') counts.totalAdmins += item._count._all;
            }
        });

        return counts;
    } catch (error) {
        console.error('Error fetching user count:', error);
        throw error;
    }
}
