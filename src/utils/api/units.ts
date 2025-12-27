import { supabase } from 'lib/supabase/client';
import { Database } from 'lib/supabase/database.types';

type Unit = Database['public']['Tables']['units']['Row'];
type UnitInsert = Database['public']['Tables']['units']['Insert'];
type UnitUpdate = Database['public']['Tables']['units']['Update'];

export interface GetUnitsFilters {
    status?: 'active' | 'inactive';
    department?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface UnitWithManager extends Unit {
    manager?: {
        id: string;
        name: string;
        email: string;
    } | null;
    employee_count?: number;
}

/**
 * Get all units with optional filters
 */
export async function getUnits(filters: GetUnitsFilters = {}) {
    let query = supabase
        .from('units')
        .select(`
      *,
      manager:users!units_manager_id_fkey(id, name, email)
    `);

    // Apply filters
    if (filters.status) {
        query = query.eq('status', filters.status);
    }

    if (filters.department) {
        query = query.eq('department', filters.department);
    }

    if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,department.ilike.%${filters.search}%`);
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
        console.error('Error fetching units:', error);
        throw error;
    }

    // Get employee count for each unit
    const unitsWithCount = await Promise.all(
        (data || []).map(async (unit) => {
            const { count: employeeCount } = await supabase
                .from('users')
                .select('id', { count: 'exact', head: true })
                .eq('unit_id', unit.id)
                .eq('status', 'active');

            return {
                ...unit,
                employee_count: employeeCount || 0,
            };
        })
    );

    return {
        units: unitsWithCount as UnitWithManager[],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
    };
}

/**
 * Get unit by ID
 */
export async function getUnitById(id: string) {
    const { data, error } = await supabase
        .from('units')
        .select(`
      *,
      manager:users!units_manager_id_fkey(id, name, email)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching unit:', error);
        throw error;
    }

    // Get employee count
    const { count: employeeCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('unit_id', id)
        .eq('status', 'active');

    return {
        ...data,
        employee_count: employeeCount || 0,
    } as UnitWithManager;
}

/**
 * Create new unit
 */
export async function createUnit(unitData: UnitInsert) {
    const { data, error } = await supabase
        .from('units')
        .insert(unitData)
        .select()
        .single();

    if (error) {
        console.error('Error creating unit:', error);
        throw error;
    }

    return data as Unit;
}

/**
 * Update unit
 */
export async function updateUnit(id: string, unitData: UnitUpdate) {
    const { data, error } = await supabase
        .from('units')
        .update(unitData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating unit:', error);
        throw error;
    }

    return data as Unit;
}

/**
 * Delete unit
 */
export async function deleteUnit(id: string) {
    const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting unit:', error);
        throw error;
    }

    return { success: true };
}

/**
 * Get total units count
 */
export async function getUnitsCount() {
    const { count, error } = await supabase
        .from('units')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

    if (error) {
        console.error('Error fetching units count:', error);
        throw error;
    }

    return count || 0;
}

/**
 * Get all departments (unique)
 */
export async function getDepartments() {
    const { data, error } = await supabase
        .from('units')
        .select('department')
        .eq('status', 'active');

    if (error) {
        console.error('Error fetching departments:', error);
        throw error;
    }

    const uniqueDepartments = [...new Set(data.map(u => u.department))];
    return uniqueDepartments;
}
