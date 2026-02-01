'use server';

import { getUserById } from './users';
import { getCheckInLocation } from './settings';
import { getMonitoringRequests } from './monitoring';
import { getAttendances } from './attendances';
import { getCertificateEligibility } from './certificate';
import { getserverAuthSession } from 'utils/authOptions';

/**
 * Batch call for Participant Dashboard to reduce roundtrips
 */
export async function getParticipantDashboardData(userId: string, today: string) {
    const session = await getserverAuthSession();
    if (!session) throw new Error('Unauthorized');

    const { getNotifications } = require('./notifications');

    // Run all fetches in parallel on the server
    const [userProfile, locationSettings, todayRequests, attendanceData, certEligibility, notifications] = await Promise.all([
        getUserById(userId),
        getCheckInLocation(),
        getMonitoringRequests({ userId: userId, date: today }),
        getAttendances({ userId: userId, pageSize: 30 }),
        getCertificateEligibility(userId),
        getNotifications(5) // Get last 5 notifications to check for today's reminder
    ]);

    return {
        userProfile,
        locationSettings,
        todayRequests,
        attendanceData,
        certEligibility,
        notifications
    };
}

/**
 * Batch call for Management Data page
 */
export async function getManagementPageData(filters: any) {
    const { getUsers } = require('./users');
    const { getUnits, getDepartments } = require('./units');

    // Optimization: If we only need reference data (for dialogs)
    if (filters.fetchOnlyReference) {
        const [allUnitsData, allSupervisorsData, departmentsData] = await Promise.all([
            getUnits({ pageSize: 200 }),
            getUsers({ role: 'supervisor', pageSize: 200 }),
            getDepartments()
        ]);
        return { allUnitsData, allSupervisorsData, departmentsData };
    }

    // Default: Fetch paginated lists
    const [usersData, unitsData] = await Promise.all([
        getUsers({
            page: filters.usersPage,
            pageSize: filters.usersPageSize,
            search: filters.usersSearch || undefined,
            role: filters.usersRoleFilter !== 'all' ? filters.usersRoleFilter : undefined,
        }),
        getUnits({
            page: filters.unitsPage,
            pageSize: filters.unitsPageSize,
            search: filters.unitsSearch || undefined,
            status: filters.unitsStatusFilter !== 'all' ? filters.unitsStatusFilter : undefined,
        })
    ]);

    // Only fetch reference data if NOT skipped
    let allUnitsData = null;
    let allSupervisorsData = null;
    let departmentsData = null;

    if (!filters.skipReferenceData) {
        const refs = await Promise.all([
            getUnits({ pageSize: 200 }),
            getUsers({ role: 'supervisor', pageSize: 200 }),
            getDepartments()
        ]);
        allUnitsData = refs[0];
        allSupervisorsData = refs[1];
        departmentsData = refs[2];
    }

    return {
        usersData,
        unitsData,
        allUnitsData,
        allSupervisorsData,
        departmentsData
    };
}
