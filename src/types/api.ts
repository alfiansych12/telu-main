import { UserRole, EntityStatus, AttendanceStatus, RequestStatus, LeaveType } from '@prisma/client';

export interface BaseResponse {
    success: boolean;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// User Types
export interface UserBasicInfo {
    id: string;
    name: string;
    email: string;
}

export interface UserWithRelations {
    id: string;
    email: string;
    name: string;
    role: UserRole | null;
    unit_id: string | null;
    status: EntityStatus | null;
    internship_start: Date | null;
    internship_end: Date | null;
    created_at: Date | null;
    updated_at: Date | null;
    photo?: string | null;
    phone?: string | null;
    institution_name?: string | null;
    institution_type?: string | null;
    personal_email?: string | null;
    telegram_username?: string | null;
    supervisor_id: string | null;
    supervisor_name?: string | null;
    unit?: {
        id: string;
        name: string;
        department: string;
    } | null;
    supervisor?: UserBasicInfo | null;
}

// Unit Types
export interface UnitWithRelations {
    id: string;
    name: string;
    department: string;
    manager_id: string | null;
    manager_name?: string | null;
    status: EntityStatus | null;
    capacity: number | null;
    description: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    manager?: UserBasicInfo | null;
    employee_count?: number;
    unassigned_count?: number;
    supervisors?: (UserBasicInfo & {
        photo?: string | null;
        subordinates?: UserWithRelations[];
    })[];
    _count?: {
        users: number;
    };
}

// Attendance Types
export interface AttendanceWithRelations {
    id: string;
    user_id: string;
    date: Date;
    check_in_time: Date | null;
    check_out_time: Date | null;
    activity_description: string | null;
    status: AttendanceStatus | null;
    created_at: Date | null;
    updated_at: Date | null;
    user?: UserBasicInfo & {
        unit?: {
            name: string;
        } | null;
        institution_name?: string | null;
    };
}

// Leave Request Types
export interface LeaveRequestWithRelations {
    id: string;
    user_id: string;
    type: LeaveType;
    start_date: Date;
    end_date: Date;
    reason: string | null;
    evidence: string | null;
    status: RequestStatus | null;
    notes: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    user?: UserBasicInfo & {
        unit?: {
            name: string;
        } | null;
    };
}

// Monitoring Types
export interface MonitoringWithRelations {
    id: string;
    user_id: string;
    location_name: string;
    latitude: any;
    longitude: any;
    request_date: Date;
    reason: string | null;
    status: RequestStatus | null;
    notes: string | null;
    created_at: Date | null;
    user?: UserWithRelations;
}

// Assessment Types
export interface AssessmentWithRelations {
    id: string;
    user_id: string;
    evaluator_id: string;
    category: string | null;
    soft_skill: any;
    hard_skill: any;
    attitude: any;
    remarks: string | null;
    period: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    user?: UserWithRelations;
    evaluator?: UserBasicInfo;
}
