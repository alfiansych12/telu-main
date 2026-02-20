'use server';

import prisma from 'lib/prisma';
import { getserverAuthSession } from 'utils/authOptions';
import { logAudit } from 'utils/audit';

/**
 * Bulk create registration submissions from Excel import
 * This creates pending registrations that can be approved later
 */
export async function bulkImportRegistrations(formId: string, unitIds: string[], registrations: {
    name: string,
    email: string,
    personal_email?: string,
    phone?: string,
    institution_name?: string,
    institution_type?: string,
    unit_id?: string | null,
    internship_start?: string | null,
    internship_end?: string | null,
    transcript_external?: string[] | null
}[], formFiles: any = {}) {
    // Removed admin check to allow public/institutional bulk registration

    try {
        if (!registrations || registrations.length === 0) {
            throw new Error('Tidak ada data pendaftaran yang dikirim.');
        }

        // Verify form exists
        const form = await prisma.registrationForm.findUnique({
            where: { id: formId }
        });

        if (!form) {
            throw new Error('Form pendaftaran tidak ditemukan.');
        }

        // Deduplicate registrations within the input array by email (case-insensitive)
        const uniqueRegistrationsMap = new Map();
        registrations.forEach(r => {
            if (r.personal_email) {
                const normalizedEmail = r.personal_email.toLowerCase().trim();
                if (!uniqueRegistrationsMap.has(normalizedEmail)) {
                    uniqueRegistrationsMap.set(normalizedEmail, r);
                }
            }
        });
        const deduplicatedRegistrations = Array.from(uniqueRegistrationsMap.values());

        // Derive target unit IDs from BOTH explicit selection AND registrations data
        const registrationUnitIds = deduplicatedRegistrations.map(r => r.unit_id).filter(Boolean) as string[];
        const allTargetUnitIds = Array.from(new Set([...unitIds, ...registrationUnitIds]));

        if (allTargetUnitIds.length === 0) {
            throw new Error('Tidak ada unit valid yang ditemukan di file Excel maupun di pilihan unit.');
        }

        const units = await prisma.unit.findMany({
            where: { id: { in: allTargetUnitIds } },
            include: {
                _count: {
                    select: {
                        users: {
                            where: { status: 'active', role: 'participant' }
                        }
                    }
                }
            }
        }) as any[];

        if (units.length === 0) throw new Error('Unit yang tertulis di Excel tidak ditemukan di database.');

        // Check for existing submissions with same email
        const existingSubmissions = await prisma.registrationSubmission.findMany({
            where: { form_id: formId },
            select: { responses: true }
        });

        const existingEmails = new Set(
            existingSubmissions.map((s: any) => (s.responses as any)?.personal_email?.toLowerCase()).filter(Boolean)
        );

        // ========================================================================
        // PROCESS TRANSCRIPT EXTERNAL - Create/Update Assessment Templates
        // ========================================================================
        const institutionTemplates = new Map<string, { criteria: string[], type: string }>();

        console.log('📊 Processing transcript_external data from file...');

        for (const r of deduplicatedRegistrations) {
            if (r.institution_name && r.transcript_external && r.transcript_external.length > 0) {
                const institutionKey = r.institution_name.trim().toLowerCase();
                if (!institutionTemplates.has(institutionKey)) {
                    console.log(`✅ Found transcript_external for: ${r.institution_name}`);
                    console.log('   Criteria:', r.transcript_external);
                    institutionTemplates.set(institutionKey, {
                        criteria: r.transcript_external,
                        type: r.institution_type || r.institution_name
                    });
                }
            }
        }

        // Sync Assessment Templates to database
        const templateOperations: any[] = [];
        for (const [institutionName, data] of institutionTemplates.entries()) {
            const { criteria: criteriaArray } = data;

            const originalInstitution = deduplicatedRegistrations.find(
                r => r.institution_name?.trim().toLowerCase() === institutionName
            )?.institution_name || institutionName;

            const templateKey = originalInstitution.substring(0, 50);

            console.log(`🔄 Syncing institution-specific template for: ${templateKey}`);

            const formattedCriteria = {
                internal: [
                    { key: 'soft_skill', label: 'Soft Skill', description: 'Kemampuan interpersonal dan komunikasi', type: 'number' },
                    { key: 'hard_skill', label: 'Hard Skill', description: 'Kemampuan teknis dan profesional', type: 'number' },
                    { key: 'attitude', label: 'Attitude', description: 'Sikap dan etika kerja', type: 'number' }
                ],
                external: criteriaArray.map((criteriaText, index) => ({
                    key: `external_${index + 1}`,
                    label: criteriaText,
                    description: `Kriteria penilaian: ${criteriaText}`,
                    type: 'number'
                }))
            };

            templateOperations.push(
                prisma.assessmentTemplate.upsert({
                    where: { institution_type: templateKey },
                    create: {
                        institution_type: templateKey,
                        criteria: formattedCriteria,
                        description: `Auto-generated from bulk registration for ${templateKey}`
                    },
                    update: {
                        criteria: formattedCriteria,
                        description: `Updated from bulk registration for ${templateKey}`,
                        updated_at: new Date()
                    }
                })
            );
        }

        let templatesCreated = 0;
        if (templateOperations.length > 0) {
            console.log(`💾 Executing ${templateOperations.length} template upsert operations...`);
            const templateResults = await prisma.$transaction(templateOperations);
            templatesCreated = templateResults.length;
            console.log(`✅ Successfully synced ${templatesCreated} Assessment Templates`);
        }

        // Filter out registrations that already exist
        const newRegistrations = deduplicatedRegistrations.filter(
            r => !existingEmails.has(r.personal_email?.toLowerCase() || '')
        );

        if (newRegistrations.length === 0) {
            if (templatesCreated > 0) {
                const templateNames = Array.from(institutionTemplates.keys()).map(k => {
                    const original = deduplicatedRegistrations.find(r => r.institution_name?.trim().toLowerCase() === k)?.institution_name;
                    return original || k;
                }).join(', ');

                return {
                    success: true,
                    count: 0,
                    submissions: [],
                    templatesCreated: templatesCreated,
                    message: `📋 Berhasil memperbarui ${templatesCreated} Assessment Templates:\n${templateNames}\n\n(Tidak ada pendaftaran baru karena semua email sudah terdaftar)`
                };
            }

            return {
                success: false,
                message: `Tidak ada data baru untuk diimport. ${existingEmails.size} email sudah terdaftar sebelumnya.`
            };
        }

        // Create ONE submission for the whole batch
        const batchResponses: any = {
            is_bulk: true,
            students: newRegistrations.map(r => ({
                full_name: r.name,
                email: r.email,
                personal_email: r.personal_email,
                phone: r.phone,
                institution_name: r.institution_name,
                unit_preference: r.unit_id,
                internship_start: r.internship_start,
                internship_end: r.internship_end,
                transcript_external: r.transcript_external
            })),
            student_count: newRegistrations.length
        };

        const firstReg = newRegistrations[0];
        let instName = firstReg.institution_name || 'Sekolah Baru';
        if (instName.includes('.')) instName = instName.split('.').slice(0, -1).join('.');

        const batchSubmission = await prisma.registrationSubmission.create({
            data: {
                form_id: formId,
                institution_name: `${instName} (Batch - ${newRegistrations.length} Siswa)`,
                status: 'pending',
                responses: batchResponses,
                files: formFiles || {}
            }
        });

        const results = [batchSubmission];

        // Return data for tracking
        const submissions = results.map((s: any) => ({
            id: s.id,
            name: s.responses.full_name,
            email: s.responses.personal_email,
            institution: s.institution_name,
            status: s.status
        }));

        await logAudit({
            action: 'BULK_IMPORT_REGISTRATIONS',
            entity: 'RegistrationSubmission',
            details: {
                form_id: formId,
                unit_ids: allTargetUnitIds,
                count: results.length,
                skipped_existing: Array.from(existingEmails),
                submissions: submissions,
                templates_synced: templatesCreated
            }
        });

        const successNames = submissions.map(s => `${s.name} (${s.email})`).join(', ');
        let finalMessage = `✅ Berhasil mengimport ${results.length} pendaftaran baru:\n${successNames}`;

        if (templatesCreated > 0) {
            finalMessage += `\n\n📋 Assessment Templates tersinkronisasi untuk ${templatesCreated} institusi.`;
        }

        finalMessage += `\n\n⚠️ Status: PENDING - Silakan approve untuk membuat akun participant.`;

        return {
            success: true,
            count: results.length,
            submissions,
            message: finalMessage,
            templatesCreated: templatesCreated
        };

    } catch (error: any) {
        console.error('Error in bulkImportRegistrations:', error);
        return {
            success: false,
            message: error.message || 'Gagal memproses import data.'
        };
    }
}

/**
 * Fetch the history of bulk registration imports from audit logs
 */
export async function getRegistrationImportHistory() {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    return await prisma.auditLog.findMany({
        where: { action: 'BULK_IMPORT_REGISTRATIONS' },
        include: {
            user: {
                select: { name: true }
            }
        },
        orderBy: { created_at: 'desc' },
        take: 20
    });
}
