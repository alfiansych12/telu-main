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

import { AssessmentCriteria, getDefaultAssessmentCriteria } from './assessment-defaults';
export type { Criterion, AssessmentCriteria } from './assessment-defaults';
// Do not re-export getDefaultAssessmentCriteria from a 'use server' file to avoid it being treated as a Server Action

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

        const data = setting.value as unknown as LeaveSettings;
        return {
            max_permit_duration: data.max_permit_duration || 3,
            max_monthly_quota: data.max_monthly_quota || 5,
            require_evidence_for_sick: data.require_evidence_for_sick !== undefined ? data.require_evidence_for_sick : true
        };
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

// Assessment criteria defaults moved to assessment-defaults.ts

/**
 * Get assessment criteria settings
 */
export async function getAssessmentCriteria(): Promise<AssessmentCriteria> {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'assessment_criteria' }
        });

        if (!setting) {
            return getDefaultAssessmentCriteria();
        }

        return setting.value as unknown as AssessmentCriteria;
    } catch (error) {
        console.error('Error fetching assessment criteria:', error);
        return getDefaultAssessmentCriteria();
    }
}

/**
 * Update assessment criteria settings
 */
export async function updateAssessmentCriteria(criteria: AssessmentCriteria) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Operation not allowed. Admin privilege required.');
    }

    try {
        const setting = await prisma.systemSetting.upsert({
            where: { key: 'assessment_criteria' },
            create: {
                key: 'assessment_criteria',
                value: criteria as any,
                description: 'Custom labels for internship assessment criteria'
            },
            update: {
                value: criteria as any,
                updated_at: new Date()
            }
        });

        await logAudit({
            action: 'UPDATE_ASSESSMENT_CRITERIA',
            entity: 'SystemSetting',
            entityId: setting.id,
            details: criteria
        });

        return setting;
    } catch (error) {
        console.error('Error updating assessment criteria:', error);
        throw error;
    }
}

/**
 * Get all institution-specific assessment templates
 */
export async function getAssessmentTemplates() {
    const session = await getserverAuthSession();
    if (!session) throw new Error('Unauthorized');

    try {
        return await (prisma as any).assessmentTemplate.findMany({
            orderBy: { institution_type: 'asc' }
        });
    } catch (error) {
        console.error('Error fetching assessment templates:', error);
        return [];
    }
}

/**
 * Upsert assessment template for a specific institution type
 */
export async function upsertAssessmentTemplate(institutionType: string, criteria: AssessmentCriteria, description?: string) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Operation not allowed. Admin privilege required.');
    }

    try {
        const template = await (prisma as any).assessmentTemplate.upsert({
            where: { institution_type: institutionType },
            create: {
                institution_type: institutionType,
                criteria: criteria as any,
                description
            },
            update: {
                criteria: criteria as any,
                description,
                updated_at: new Date()
            }
        });

        await logAudit({
            action: 'UPSERT_ASSESSMENT_TEMPLATE',
            entity: 'AssessmentTemplate',
            entityId: template.id,
            details: { institutionType, criteria }
        });

        return template;
    } catch (error) {
        console.error('Error upserting assessment template:', error);
        throw error;
    }
}

/**
 * Delete an assessment template
 */
export async function deleteAssessmentTemplate(id: string) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Operation not allowed. Admin privilege required.');
    }

    try {
        await (prisma as any).assessmentTemplate.delete({
            where: { id }
        });
        return { success: true };
    } catch (error) {
        console.error('Error deleting assessment template:', error);
        throw error;
    }
}

/**
 * Get the most appropriate criteria for a specific user based on their institution
 */
export async function getCriteriaForUser(userId: string): Promise<AssessmentCriteria> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { institution_type: true, institution_name: true }
        });

        // 1. Try to find template by specific Institution Name first
        if (user?.institution_name) {
            const template = await (prisma as any).assessmentTemplate.findUnique({
                where: { institution_type: user.institution_name.substring(0, 50) }
            });

            if (template) {
                return template.criteria as unknown as AssessmentCriteria;
            }
        }

        // 2. Fallback to template by Institution Type (Category)
        if (user?.institution_type) {
            const template = await (prisma as any).assessmentTemplate.findUnique({
                where: { institution_type: user.institution_type }
            });

            if (template) {
                return template.criteria as unknown as AssessmentCriteria;
            }
        }

        // 3. Fallback to global criteria
        return await getAssessmentCriteria();
    } catch (error) {
        console.error('Error fetching criteria for user:', error);
        return await getAssessmentCriteria();
    }
}

/**
 * Get all assessment templates indexed by institution type for quick lookup
 */
export async function getAssessmentTemplatesByInstitution(): Promise<Record<string, AssessmentCriteria>> {
    try {
        const templates = await (prisma as any).assessmentTemplate.findMany();
        const map: Record<string, AssessmentCriteria> = {};
        templates.forEach((t: any) => {
            map[t.institution_type] = t.criteria as unknown as AssessmentCriteria;
        });
        return map;
    } catch (error) {
        console.error('Error mapping templates:', error);
        return {};
    }
}
