import { supabase } from 'lib/supabase/client';
import { Database } from 'lib/supabase/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export interface GetUsersFilters {
    role?: 'participant' | 'supervisor' | 'admin';
    status?: 'active' | 'inactive';
    unitId?: string;
    supervisorId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface UserWithUnit extends User {
    unit?: {
        id: string;
        name: string;
        department: string;
    } | null;
    supervisor?: {
        id: string;
        name: string;
    } | null;
}

/**
 * Get all users with optional filters
 */
export async function getUsers(filters: GetUsersFilters = {}) {
    try {
        let query = (supabase
            .from('users' as any) as any)
            .select(`
          *,
          unit:units!users_unit_id_fkey(id, name, department)
        `, { count: 'exact' });

        // Apply filters
        if (filters.role) {
            query = query.eq('role', filters.role);
        }

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.unitId) {
            query = query.eq('unit_id', filters.unitId);
        }

        if (filters.supervisorId) {
            query = query.eq('supervisor_id', filters.supervisorId);
        }

        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }

        // Pagination
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 10;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        query = query.range(from, to);
        query = query.order('created_at', { ascending: false });

        const { data, error, count } = await query;

        if (error) {
            throw error;
        }

        const users = data as UserWithUnit[];

        // SAFE FETCH FOR SUPERVISORS (Batched)
        // Collect all non-null supervisor IDs
        const supervisorIds = [...new Set(users.map(u => u.supervisor_id).filter(Boolean))];

        if (supervisorIds.length > 0) {
            try {
                const { data: supervisors } = await (supabase
                    .from('users' as any) as any)
                    .select('id, name')
                    .in('id', supervisorIds);

                if (supervisors) {
                    // Create a map for quick lookup
                    const supervisorMap = new Map(supervisors.map((s: any) => [s.id, s]));

                    // Attach supervisor data to users
                    users.forEach(user => {
                        if (user.supervisor_id) {
                            user.supervisor = (supervisorMap.get(user.supervisor_id) as any) || null;
                        }
                    });
                }
            } catch (supErr) {
                console.warn('Could not batch fetch supervisors:', supErr);
            }
        }

        return {
            users,
            total: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize),
        };
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

    // 1. Fetch user and unit information (Using explicit hint to avoid PGRST201)
    const { data: user, error } = await (supabase
        .from('users' as any) as any)
        .select(`
          *,
          unit:units!users_unit_id_fkey(id, name, department)
        `)
        .eq('id' as any, id)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }

    // 2. Fetch supervisor manually if it exists to avoid PGRST200/400 Bad Request Join Error
    if (user && user.supervisor_id) {
        try {
            const { data: supervisorData } = await (supabase
                .from('users' as any) as any)
                .select('id, name')
                .eq('id', user.supervisor_id)
                .single();

            if (supervisorData) {
                user.supervisor = supervisorData;
            }
        } catch (supErr) {
            console.warn('Could not fetch supervisor details separately:', supErr);
        }
    }

    return user as UserWithUnit;
}

/**
 * Create new user
 */
export async function createUser(userData: UserInsert) {
    const { data, error } = await (supabase
        .from('users')
        .insert(userData as any)
        .select()
        .single() as any);

    if (error) {
        console.error('Error creating user:', error);
        throw error;
    }

    return data as User;
}

/**
 * Update user
 */
export async function updateUser(id: string, userData: UserUpdate) {
    const { data, error } = await ((supabase
        .from('users' as any) as any)
        .update(userData as any)
        .eq('id', id)
        .select()
        .single() as any);

    if (error) {
        console.error('Error updating user:', error);
        throw error;
    }

    return data as User;
}

/**
 * Delete user
 */
export async function deleteUser(id: string) {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting user:', error);
        throw error;
    }

    return { success: true };
}

/**
 * Get users count by role
 */
export async function getUserCountByRole() {
    const { data, error } = await (supabase
        .from('users')
        .select('role, status') as any);

    if (error) {
        console.error('Error fetching user count:', error);
        throw error;
    }

    const counts = {
        totalParticipants: (data || []).filter((u: any) => u.role === 'participant' && u.status === 'active').length,
        totalSupervisors: (data || []).filter((u: any) => u.role === 'supervisor' && u.status === 'active').length,
        totalAdmins: (data || []).filter((u: any) => u.role === 'admin' && u.status === 'active').length,
        totalInactive: (data || []).filter((u: any) => u.status === 'inactive').length,
    };

    return counts;
}
