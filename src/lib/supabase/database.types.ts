export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    password: string | null
                    name: string
                    role: 'participant' | 'supervisor' | 'admin'
                    unit_id: string | null
                    supervisor_id: string | null
                    status: 'active' | 'inactive'
                    internship_start: string | null
                    internship_end: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    password?: string | null
                    name: string
                    role?: 'participant' | 'supervisor' | 'admin'
                    unit_id?: string | null
                    supervisor_id?: string | null
                    status?: 'active' | 'inactive'
                    internship_start?: string | null
                    internship_end?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    password?: string | null
                    name?: string
                    role?: 'participant' | 'supervisor' | 'admin'
                    unit_id?: string | null
                    supervisor_id?: string | null
                    status?: 'active' | 'inactive'
                    internship_start?: string | null
                    internship_end?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            units: {
                Row: {
                    id: string
                    name: string
                    department: string
                    manager_id: string | null
                    status: 'active' | 'inactive'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    department: string
                    manager_id?: string | null
                    status?: 'active' | 'inactive'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    department?: string
                    manager_id?: string | null
                    status?: 'active' | 'inactive'
                    created_at?: string
                    updated_at?: string
                }
            }
            attendances: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    check_in_time: string | null
                    check_out_time: string | null
                    activity_description: string | null
                    status: 'present' | 'absent' | 'late' | 'excused'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    check_in_time?: string | null
                    check_out_time?: string | null
                    activity_description?: string | null
                    status?: 'present' | 'absent' | 'late' | 'excused'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    check_in_time?: string | null
                    check_out_time?: string | null
                    activity_description?: string | null
                    status?: 'present' | 'absent' | 'late' | 'excused'
                    created_at?: string
                    updated_at?: string
                }
            }
            monitoring_locations: {
                Row: {
                    id: string
                    user_id: string
                    location_name: string
                    latitude: number | null
                    longitude: number | null
                    request_date: string
                    status: 'pending' | 'approved' | 'rejected'
                    reason: string | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    location_name: string
                    latitude?: number | null
                    longitude?: number | null
                    request_date: string
                    status?: 'pending' | 'approved' | 'rejected'
                    reason?: string | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    location_name?: string
                    latitude?: number | null
                    longitude?: number | null
                    request_date?: string
                    status?: 'pending' | 'approved' | 'rejected'
                    reason?: string | null
                    notes?: string | null
                    created_at?: string
                }
            }
            system_settings: {
                Row: {
                    id: string
                    key: string
                    value: Json
                    description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    key: string
                    value: Json
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    key?: string
                    value?: Json
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            dashboard_stats: {
                Row: {
                    total_participants: number | null
                    total_supervisors: number | null
                    total_units: number | null
                    today_present: number | null
                }
            }
            unit_employee_counts: {
                Row: {
                    id: string
                    name: string
                    department: string
                    employee_count: number | null
                }
            }
        }
        Functions: {
            check_is_admin: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
            check_is_supervisor: {
                Args: {
                    target_unit_id: string
                }
                Returns: boolean
            }
        }
        Enums: {
            user_role: 'participant' | 'supervisor' | 'admin'
            entity_status: 'active' | 'inactive'
            attendance_status: 'present' | 'absent' | 'late' | 'excused'
            request_status: 'pending' | 'approved' | 'rejected'
        }
    }
}
