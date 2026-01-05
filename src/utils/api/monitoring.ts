import { supabase } from 'lib/supabase/client';
import { Database } from 'lib/supabase/database.types';

type MonitoringLocation = Database['public']['Tables']['monitoring_locations']['Row'];
type MonitoringLocationInsert = Database['public']['Tables']['monitoring_locations']['Insert'];

export interface MonitoringLocationWithUser extends MonitoringLocation {
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
 * Get monitoring location requests with optional filters
 */
export async function getMonitoringRequests(filters?: {
    status?: 'pending' | 'approved' | 'rejected';
    userId?: string;
    supervisorId?: string;
    unitId?: string;
}) {
    let query = (supabase
        .from('monitoring_locations' as any) as any)
        .select(`
            *,
            user:users!inner(
                id,
                name,
                email,
                supervisor_id,
                unit_id,
                unit:units!users_unit_id_fkey(name)
            )
        `)
        .order('created_at', { ascending: false });

    if (filters?.status) {
        query = query.eq('status', filters.status);
    }

    if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
    }

    if (filters?.supervisorId) {
        query = query.filter('user.supervisor_id', 'eq', filters.supervisorId);
    }

    if (filters?.unitId) {
        query = query.filter('user.unit_id', 'eq', filters.unitId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching monitoring requests:', error);
        throw error;
    }

    return data as MonitoringLocationWithUser[];
}

/**
 * Create new monitoring location request
 */
export async function createMonitoringRequest(requestData: MonitoringLocationInsert) {
    const { data, error } = await supabase
        .from('monitoring_locations')
        .insert(requestData as any)
        .select()
        .single();

    if (error) {
        console.error('Error creating monitoring request:', error);
        throw error;
    }

    return data as MonitoringLocation;
}

/**
 * Update monitoring location request (approve/reject)
 */
export async function updateMonitoringRequest(
    id: string,
    status: 'approved' | 'rejected',
    notes?: string
) {
    const { data, error } = await (supabase
        .from('monitoring_locations' as any) as any)
        .update({ status, notes })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating monitoring request:', error);
        throw error;
    }

    return data;
}

/**
 * Get pending monitoring requests count
 */
export async function getPendingRequestsCount() {
    const { count, error } = await supabase
        .from('monitoring_locations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

    if (error) {
        console.error('Error fetching pending requests count:', error);
        throw error;
    }

    return count || 0;
}
