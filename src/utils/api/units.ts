'use server';

import prisma from 'lib/prisma';
import { EntityStatus, Prisma } from '@prisma/client';
import { getserverAuthSession } from 'utils/authOptions';
import { UnitWithRelations, PaginatedResponse } from 'types/api';
import { logAudit } from 'utils/audit';

export interface GetUnitsFilters {
    status?: 'active' | 'inactive';
    department?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

/**
 * Get all units with optional filters
 */
export async function getUnits(filters: GetUnitsFilters = {}) {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const { role: userRole } = session.user as any;

    // Basic protection: only Admin and Supervisor should list units or participants in their units
    if (userRole === 'participant') {
        // Participants can usually see units for lookup, but maybe restrict if needed
    }

    try {
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 10;
        const skip = (page - 1) * pageSize;

        const where: Prisma.UnitWhereInput = {
            deleted_at: null
        };

        if (filters.status) {
            where.status = filters.status as EntityStatus;
        }

        if (filters.department) {
            where.department = filters.department;
        }

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { department: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        const [units, total] = await Promise.all([
            prisma.unit.findMany({
                where,
                include: {
                    manager: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    _count: {
                        select: {
                            users: {
                                where: {
                                    status: 'active',
                                    role: 'participant'
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
            prisma.unit.count({ where })
        ]);

        const unitsWithCount = units.map((unit: any) => ({
            ...unit,
            employee_count: unit._count?.users || 0,
            manager_name: unit.manager?.name || unit.manager_name
        }));

        return {
            data: unitsWithCount as unknown as UnitWithRelations[],
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        } as PaginatedResponse<UnitWithRelations>;
    } catch (error) {
        console.error('Error fetching units:', error);
        throw error;
    }
}

/**
 * Get unit by ID
 */
export async function getUnitById(id: string) {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    try {
        const unit = await prisma.unit.findUnique({
            where: { id },
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                users: {
                    where: {
                        role: 'supervisor'
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        photo: true,
                        subordinates: {
                            where: {
                                status: 'active',
                                unit_id: id // Only subordinates in this unit
                            },
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                status: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        users: {
                            where: {
                                status: 'active',
                                role: 'participant'
                            }
                        }
                    }
                }
            }
        });

        if (!unit) return null;

        // Count unassigned participants (in this unit but no supervisor)
        const unassignedParticipants = await prisma.user.count({
            where: {
                unit_id: id,
                role: 'participant',
                status: 'active',
                supervisor_id: null
            }
        });

        return {
            ...unit,
            supervisors: unit.users, // unit.users here filters for 'supervisor' via our query above
            employee_count: unit._count.users,
            unassigned_count: unassignedParticipants,
            manager_name: unit.manager?.name || unit.manager_name
        } as any;
    } catch (error) {
        console.error('Error fetching unit:', error);
        throw error;
    }
}

/**
 * Create new unit
 */
export async function createUnit(unitData: Prisma.UnitCreateInput) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Operation not allowed. Admin privilege required.');
    }

    try {
        const unit = await prisma.unit.create({
            data: unitData
        });

        await logAudit({
            action: 'CREATE_UNIT',
            entity: 'Unit',
            entityId: unit.id,
            details: { name: unit.name, department: unit.department }
        });

        return unit;
    } catch (error) {
        console.error('Error creating unit:', error);
        throw error;
    }
}

/**
 * Update unit
 */
export async function updateUnit(id: string, unitData: Prisma.UnitUpdateInput) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Operation not allowed. Admin privilege required.');
    }

    try {
        const unit = await prisma.unit.update({
            where: { id },
            data: unitData
        });

        await logAudit({
            action: 'UPDATE_UNIT',
            entity: 'Unit',
            entityId: unit.id,
            details: unitData
        });

        return unit;
    } catch (error) {
        console.error('Error updating unit:', error);
        throw error;
    }
}

/**
 * Delete unit
 */
export async function deleteUnit(id: string) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Operation not allowed. Admin privilege required.');
    }

    try {
        // Check if unit exists
        const unit = await prisma.unit.findUnique({
            where: { id },
            include: { _count: { select: { users: true } } }
        });

        if (!unit) {
            return { success: false, message: 'Unit not found' };
        }

        // Optional: prevent deletion if unit has users
        if (unit._count.users > 0) {
            return { success: false, message: `Cannot delete unit "${unit.name}" because it still has ${unit._count.users} users assigned to it. Please reassign them first.` };
        }

        await prisma.unit.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                deleted_by: (session.user as any).id,
                status: 'inactive'
            }
        });

        await logAudit({
            action: 'SOFT_DELETE_UNIT',
            entity: 'Unit',
            entityId: id,
            details: { name: unit.name, department: unit.department }
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error deleting unit:', error);
        if (error.code === 'P2025') {
            return { success: false, message: 'Unit already deleted or not found' };
        }
        if (error.code === 'P2003') {
            return { success: false, message: 'Cannot delete this unit because it is referenced by other records.' };
        }
        throw error;
    }
}

/**
 * Delete multiple units
 */
export async function deleteUnits(ids: string[]) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Operation not allowed. Admin privilege required.');
    }

    try {
        // Find units with active users
        const unitsWithUsers = await prisma.unit.findMany({
            where: {
                id: { in: ids },
                users: { some: { status: 'active' } }
            },
            select: { id: true, name: true }
        });

        if (unitsWithUsers.length > 0) {
            const names = unitsWithUsers.map(u => u.name).join(', ');
            return {
                success: false,
                message: `Cannot delete units (${names}) because they still have active users. Please reassign them first.`
            };
        }

        const deleteResult = await prisma.unit.updateMany({
            where: {
                id: { in: ids }
            },
            data: {
                deleted_at: new Date(),
                deleted_by: (session.user as any).id,
                status: 'inactive'
            }
        });

        await logAudit({
            action: 'BULK_SOFT_DELETE_UNITS',
            entity: 'Unit',
            details: { count: deleteResult.count, ids }
        });

        return { success: true, count: deleteResult.count };
    } catch (error: any) {
        console.error('Error bulk soft deleting units:', error);
        throw error;
    }
}

/**
 * Get all soft-deleted units
 */
export async function getDeletedUnits() {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    try {
        const units = await prisma.unit.findMany({
            where: {
                deleted_at: { not: null }
            },
            orderBy: {
                deleted_at: 'desc'
            }
        });

        // Get admin names for deleted_by
        const adminIds = units.filter((u: any) => u.deleted_by).map((u: any) => u.deleted_by);
        const admins = await prisma.user.findMany({
            where: { id: { in: adminIds } },
            select: { id: true, name: true }
        });
        const adminMap = new Map(admins.map(a => [a.id, a.name]));

        return units.map((u: any) => ({
            ...u,
            deleted_by_name: adminMap.get(u.deleted_by) || 'System'
        }));
    } catch (error) {
        console.error('Error fetching deleted units:', error);
        throw error;
    }
}

/**
 * Restore a soft-deleted unit
 */
export async function restoreUnit(id: string) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.unit.update({
            where: { id },
            data: {
                deleted_at: null,
                deleted_by: null,
                status: 'active'
            }
        });

        await logAudit({
            action: 'RESTORE_UNIT',
            entity: 'Unit',
            entityId: id
        });

        return { success: true };
    } catch (error) {
        console.error('Error restoring unit:', error);
        throw error;
    }
}

/**
 * Permanently delete a unit
 */
export async function permanentlyDeleteUnit(id: string) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.unit.delete({
            where: { id }
        });

        await logAudit({
            action: 'PERMANENT_DELETE_UNIT',
            entity: 'Unit',
            entityId: id
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error permanently deleting unit:', error);
        if (error.code === 'P2003') {
            return { success: false, message: 'Cannot delete because unit has related records.' };
        }
        throw error;
    }
}

/**
 * Restore multiple soft-deleted units
 */
export async function restoreUnits(ids: string[]) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    try {
        const result = await prisma.unit.updateMany({
            where: { id: { in: ids } },
            data: {
                deleted_at: null,
                deleted_by: null,
                status: 'active'
            }
        });

        await logAudit({
            action: 'BULK_RESTORE_UNITS',
            entity: 'Unit',
            details: { count: result.count, ids }
        });

        return { success: true, count: result.count };
    } catch (error) {
        console.error('Error bulk restoring units:', error);
        throw error;
    }
}

/**
 * Permanently delete multiple units
 */
export async function permanentlyDeleteUnits(ids: string[]) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    try {
        const result = await prisma.unit.deleteMany({
            where: { id: { in: ids } }
        });

        await logAudit({
            action: 'BULK_PERMANENT_DELETE_UNITS',
            entity: 'Unit',
            details: { count: result.count, ids }
        });

        return { success: true, count: result.count };
    } catch (error: any) {
        console.error('Error bulk permanently deleting units:', error);
        if (error.code === 'P2003') {
            return { success: false, message: 'Some units cannot be deleted because they have related records.' };
        }
        throw error;
    }
}


/**
 * Get total units count
 */
export async function getUnitsCount() {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    try {
        const count = await prisma.unit.count({
            where: {
                status: 'active'
            }
        });
        return count;
    } catch (error) {
        console.error('Error fetching units count:', error);
        throw error;
    }
}

/**
 * Get all departments (unique)
 */
export async function getDepartments() {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    try {
        const departments = await prisma.unit.findMany({
            where: {
                status: 'active'
            },
            select: {
                department: true
            },
            distinct: ['department']
        });

        return departments.map(u => u.department);
    } catch (error) {
        console.error('Error fetching departments:', error);
        throw error;
    }
}
