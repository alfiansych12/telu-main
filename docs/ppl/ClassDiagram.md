# Class Diagram

@startuml
skinparam classAttributeIconSize 0
skinparam monochrome false
skinparam packageStyle rectangle
skinparam roundcorner 10
skinparam Shadowing true

package "Models Layer (Prisma)" {
    
    enum UserRole {
        admin
        supervisor
        participant
    }

    enum EntityStatus {
        active
        inactive
    }

    enum AttendanceStatus {
        present
        absent
        late
        permit
        sick
    }

    enum RequestStatus {
        pending
        approved
        rejected
    }

    enum LeaveType {
        sick
        permit
    }

    class User {
        +id: UUID
        +email: String
        +name: String
        +role: UserRole
        +status: EntityStatus
        +unit_id: UUID?
        +supervisor_id: UUID?
        +internship_start: Date?
        +internship_end: Date?
        +login(): Boolean
        +updateProfile(): void
    }

    class Unit {
        +id: UUID
        +name: String
        +department: String
        +manager_id: UUID?
        +manager_name: String?
        +capacity: Int
        +status: EntityStatus
    }

    class Attendance {
        +id: UUID
        +user_id: UUID
        +date: Date
        +check_in_time: Time?
        +check_out_time: Time?
        +activity_description: Text?
        +status: AttendanceStatus
    }

    class Assessment {
        +id: UUID
        +user_id: UUID
        +evaluator_id: UUID
        +soft_skill: Int
        +hard_skill: Int
        +attitude: Int
        +remarks: String?
        +period: String?
    }

    class LeaveRequest {
        +id: UUID
        +user_id: UUID
        +type: LeaveType
        +start_date: Date
        +end_date: Date
        +reason: String?
        +evidence: String?
        +status: RequestStatus
        +notes: String?
    }

    class MonitoringLocation {
        +id: UUID
        +user_id: UUID
        +location_name: String
        +latitude: Decimal
        +longitude: Decimal
        +request_date: Date
        +reason: String?
        +status: RequestStatus
    }

    class UserNotification {
        +id: UUID
        +user_id: UUID
        +title: String
        +message: String
        +type: String
        +link: String?
        +is_read: Boolean
    }

    class AuditLog {
        +id: UUID
        +user_id: UUID?
        +action: String
        +entity: String
        +details: Json?
        +created_at: DateTime
    }
}

' Relationships
User "0..*" -- "1" Unit : belongs to >
User "1" -- "0..*" Attendance : records >
User "1" -- "0..*" LeaveRequest : submits >
User "1" -- "0..*" MonitoringLocation : requests >
User "1" -- "0..*" UserNotification : receives >
User "1" -- "0..*" AuditLog : performs >

' Hierarchical Relation (Supervisor - Subordinate)
User "1" <-- "0..*" User : supervises <

' Assessment Double Relation
User "1" -- "0..*" Assessment : "subject"
User "1" -- "0..*" Assessment : "evaluator"

' Unit Manager
Unit "0..1" -- "1" User : managed by >

@enduml
