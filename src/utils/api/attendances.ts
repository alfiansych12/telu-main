import { supabase } from 'lib/supabase/client';
import { Database } from 'lib/supabase/database.types';

type Attendance = Database['public']['Tables']['attendances']['Row'];
type AttendanceInsert = Database['public']['Tables']['attendances']['Insert'];
type AttendanceUpdate = Database['public']['Tables']['attendances']['Update'];

export interface GetAttendancesFilters {
    userId?: string;
    unitId?: string;
    status?: 'present' | 'absent' | 'late' | 'excused';
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
}

export interface AttendanceWithUser extends Attendance {
    user?: {
        id: string;
        name: string;
        email: string;
        unit?: {
            name: string;
        } | null;
    };
}

/**
 * Get attendances with optional filters
 */
export async function getAttendances(filters: GetAttendancesFilters = {}) {
    let query = supabase
        .from('attendances')
        .select(`
      *,
      user:users(
        id,
        name,
        email,
        unit:units!users_unit_id_fkey(name)
      )
    `);

    // Apply filters
    if (filters.userId) {
        query = query.eq('user_id', filters.userId);
    }

    if (filters.status) {
        query = query.eq('status', filters.status);
    }

    if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom);
    }

    if (filters.dateTo) {
        query = query.lte('date', filters.dateTo);
    }

    // Filter by unit if specified
    if (filters.unitId) {
        const { data: users } = await supabase
            .from('users')
            .select('id')
            .eq('unit_id', filters.unitId);

        if (users && users.length > 0) {
            const userIds = users.map(u => u.id);
            query = query.in('user_id', userIds);
        }
    }

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to);

    // Order by date desc, check_in_time desc
    query = query.order('date', { ascending: false });
    query = query.order('check_in_time', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching attendances:', error);
        throw error;
    }

    return {
        attendances: data as AttendanceWithUser[],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
    };
}

/**
 * Get attendance by ID
 */
export async function getAttendanceById(id: string) {
    const { data, error } = await supabase
        .from('attendances')
        .select(`
      *,
      user:users(
        id,
        name,
        email,
        unit:units!users_unit_id_fkey(name)
      )
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching attendance:', error);
        throw error;
    }

    return data as AttendanceWithUser;
}

/**
 * Create new attendance
 */
export async function createAttendance(attendanceData: AttendanceInsert) {
    const { data, error } = await supabase
        .from('attendances')
        .insert(attendanceData)
        .select()
        .single();

    if (error) {
        console.error('Error creating attendance:', error);
        throw error;
    }

    return data as Attendance;
}

/**
 * Update attendance
 */
export async function updateAttendance(id: string, attendanceData: AttendanceUpdate) {
    const { data, error } = await supabase
        .from('attendances')
        .update(attendanceData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating attendance:', error);
        throw error;
    }

    return data as Attendance;
}

/**
 * Get attendance statistics
 */
export async function getAttendanceStats(dateFrom?: string, dateTo?: string) {
    let query = supabase
        .from('attendances')
        .select('status, date');

    if (dateFrom) {
        query = query.gte('date', dateFrom);
    }

    if (dateTo) {
        query = query.lte('date', dateTo);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching attendance stats:', error);
        throw error;
    }

    const stats = {
        totalPresent: data.filter(a => a.status === 'present').length,
        totalAbsent: data.filter(a => a.status === 'absent').length,
        totalLate: data.filter(a => a.status === 'late').length,
        totalExcused: data.filter(a => a.status === 'excused').length,
        total: data.length,
    };

    return stats;
}

/**
 * Get today's attendance count
 */
export async function getTodayAttendanceCount() {
    const today = new Date().toISOString().split('T')[0];

    const { count, error } = await supabase
        .from('attendances')
        .select('id', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'present');

    if (error) {
        console.error('Error fetching today attendance count:', error);
        throw error;
    }

    return count || 0;
}
