'use server';

import prisma from 'lib/prisma';
import { getserverAuthSession } from 'utils/authOptions';
import { logAudit } from 'utils/audit';

export interface CheckInLocation {
    latitude: number;
    longitude: number;
    address: string;
    radius: number;
    late_threshold_time?: string; // Format "HH:mm" e.g. "08:15"
    earliest_checkout_time?: string; // Format "HH:mm" e.g. "17:00"
    absent_threshold_time?: string; // Format "HH:mm" e.g. "12:00"
}

export interface CertificateSettings {
    hr_officer_name: string;
    hr_officer_position: string;
    city: string;
}

/**
 * Get check-in location from settings or return default
 */
export async function getCheckInLocation(): Promise<CheckInLocation> {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'checkin_location' }
        });

        if (!setting) {
            console.log('No setting found, returning default');
            return {
                latitude: -6.974580,
                longitude: 107.630910,
                address: 'Jl. Telekomunikasi No.1, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257',
                radius: 100,
                late_threshold_time: '08:15',
                earliest_checkout_time: '17:00',
                absent_threshold_time: '12:00'
            };
        }

        console.log('Setting found:', setting.key);
        const data = setting.value as unknown as CheckInLocation;
        // Ensure defaults if fields are missing in legacy data
        return {
            ...data,
            late_threshold_time: data.late_threshold_time || '08:15',
            earliest_checkout_time: data.earliest_checkout_time || '17:00',
            absent_threshold_time: data.absent_threshold_time || '12:00'
        };
    } catch (error) {
        console.error('Error fetching check-in location:', error);
        return {
            latitude: -6.974580,
            longitude: 107.630910,
            address: 'Jl. Telekomunikasi No.1, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257',
            radius: 100,
            late_threshold_time: '08:15',
            earliest_checkout_time: '17:00',
            absent_threshold_time: '12:00'
        };
    }
}

/**
 * Update check-in location settings
 */
export async function updateCheckInLocation(location: CheckInLocation) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Operation not allowed. Admin privilege required.');
    }

    try {
        const setting = await prisma.systemSetting.upsert({
            where: { key: 'checkin_location' },
            create: {
                key: 'checkin_location',
                value: location as any,
            },
            update: {
                value: location as any,
                updated_at: new Date()
            }
        });

        await logAudit({
            action: 'UPDATE_CHECKIN_SETTINGS',
            entity: 'SystemSetting',
            entityId: setting.id,
            details: location
        });

        return setting;
    } catch (error) {
        console.error('Error updating check-in location:', error);
        throw error;
    }
}

/**
 * Get certificate settings
 */
export async function getCertificateSettings(): Promise<CertificateSettings> {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'certificate_settings' }
        });

        if (!setting) {
            return {
                hr_officer_name: '[Nama Pejabat SDM]',
                hr_officer_position: 'Kepala Bagian Pengembangan SDM',
                city: 'Bandung'
            };
        }

        return setting.value as unknown as CertificateSettings;
    } catch (error) {
        console.error('Error fetching certificate settings:', error);
        return {
            hr_officer_name: '[Nama Pejabat SDM]',
            hr_officer_position: 'Kepala Bagian Pengembangan SDM',
            city: 'Bandung'
        };
    }
}

/**
 * Update certificate settings
 */
export async function updateCertificateSettings(settings: CertificateSettings) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Operation not allowed. Admin privilege required.');
    }

    try {
        const setting = await prisma.systemSetting.upsert({
            where: { key: 'certificate_settings' },
            create: {
                key: 'certificate_settings',
                value: settings as any,
                description: 'Settings for HR officer on certificates'
            },
            update: {
                value: settings as any,
                updated_at: new Date()
            }
        });

        await logAudit({
            action: 'UPDATE_CERTIFICATE_SETTINGS',
            entity: 'SystemSetting',
            entityId: setting.id,
            details: settings
        });

        return setting;
    } catch (error) {
        console.error('Error updating certificate settings:', error);
        throw error;
    }
}

export interface LeaveSettings {
    max_permit_duration: number;
    max_monthly_quota: number;
    require_evidence_for_sick: boolean;
}

/**
 * Get leave settings
 */
export async function getLeaveSettings(): Promise<LeaveSettings> {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'leave_settings' }
        });

        if (!setting) {
            return {
                max_permit_duration: 3,
                max_monthly_quota: 5,
                require_evidence_for_sick: true
            };
        }

        return setting.value as unknown as LeaveSettings;
    } catch (error) {
        console.error('Error fetching leave settings:', error);
        return {
            max_permit_duration: 3,
            max_monthly_quota: 5,
            require_evidence_for_sick: true
        };
    }
}

/**
 * Update leave settings
 */
export async function updateLeaveSettings(settings: LeaveSettings) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Operation not allowed. Admin privilege required.');
    }

    try {
        const setting = await prisma.systemSetting.upsert({
            where: { key: 'leave_settings' },
            create: {
                key: 'leave_settings',
                value: settings as any,
                description: 'Configuration for leave and permit restrictions'
            },
            update: {
                value: settings as any,
                updated_at: new Date()
            }
        });

        await logAudit({
            action: 'UPDATE_LEAVE_SETTINGS',
            entity: 'SystemSetting',
            entityId: setting.id,
            details: settings
        });

        return setting;
    } catch (error) {
        console.error('Error updating leave settings:', error);
        throw error;
    }
}
