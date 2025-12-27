import { supabase } from 'lib/supabase/client';
import { Database } from 'lib/supabase/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export interface GetUsersFilters {
    role?: 'participant' | 'supervisor' | 'admin';
    status?: 'active' | 'inactive';
    unitId?: string;
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
}

/**
 * Get all users with optional filters
 */
export async function getUsers(filters: GetUsersFilters = {}) {
    let query = supabase
        .from('users')
        .select(`
      *,
      unit:units!users_unit_id_fkey(id, name, department)
    `);

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

    if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to);

    // Order by created_at desc
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching users:', error);
        throw error;
    }

    return {
        users: data as UserWithUnit[],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
    };
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
    const { data, error } = await supabase
        .from('users')
        .select(`
      *,
      unit:units!users_unit_id_fkey(id, name, department)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
        throw error;
    }

    return data as UserWithUnit;
}

/**
 * Create new user
 */
export async function createUser(userData: UserInsert) {
    const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

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
    const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

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
    const { data, error } = await supabase
        .from('users')
        .select('role, status');

    if (error) {
        console.error('Error fetching user count:', error);
        throw error;
    }

    const counts = {
        totalParticipants: data.filter(u => u.role === 'participant' && u.status === 'active').length,
        totalSupervisors: data.filter(u => u.role === 'supervisor' && u.status === 'active').length,
        totalAdmins: data.filter(u => u.role === 'admin' && u.status === 'active').length,
        totalInactive: data.filter(u => u.status === 'inactive').length,
    };

    return counts;
}
