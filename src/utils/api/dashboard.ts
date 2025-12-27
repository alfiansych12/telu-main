import { supabase } from 'lib/supabase/client';

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
    const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }

    return {
        totalParticipants: data.total_participants || 0,
        totalSupervisors: data.total_supervisors || 0,
        totalUnits: data.total_units || 0,
        todayPresent: data.today_present || 0,
    };
}
