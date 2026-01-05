import { supabase } from 'lib/supabase/client';

export interface CheckInLocation {
    latitude: number;
    longitude: number;
    address: string;
    radius: number;
}

export const getCheckInLocation = async (): Promise<CheckInLocation> => {
    console.log('🔍 Fetching check-in location from database...');

    const { data, error } = await (supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'checkin_location')
        .single() as any);

    console.log('📦 Database response:', { data, error });

    if (error || !data) {
        console.warn('⚠️ No data found or error occurred, using default fallback');
        console.error('Error details:', error);
        // Default fallback if not set in DB
        return {
            latitude: -6.974580,
            longitude: 107.630910,
            address: 'Jl. Telekomunikasi No.1, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257',
            radius: 100
        };
    }

    console.log('✅ Using location from database:', data.value);
    return data.value as unknown as CheckInLocation;
};

export const updateCheckInLocation = async (location: CheckInLocation) => {
    console.log('💾 Attempting to save location settings:', location);

    const payload = {
        key: 'checkin_location',
        value: location as any,
        updated_at: new Date().toISOString()
    };

    console.log('📤 Payload to database:', payload);

    const { data, error } = await ((supabase
        .from('system_settings' as any) as any)
        .upsert(payload as any, {
            onConflict: 'key'
        })
        .select()
        .single() as any);

    console.log('💾 Save response:', { data, error });

    if (error) {
        console.error('❌ Error saving location:', error);
        throw error;
    }

    console.log('✅ Location saved successfully:', data);
    return data;
};
