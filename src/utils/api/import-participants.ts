'use server';

import prisma from 'lib/prisma';
import { getserverAuthSession } from 'utils/authOptions';
import { logAudit } from 'utils/audit';

/**
 * Bulk create participants and assign them to supervisors across multiple units
 * Logic: Distributes participants based on available capacity in each selected unit
 */
export async function bulkImportParticipants(unitIds: string[], participants: {
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
}[]) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    try {
        if (!participants || participants.length === 0) {
            throw new Error('Tidak ada data peserta yang dikirim.');
        }

        // Deduplicate participants within the input array by email (case-insensitive)
        const uniqueParticipantsMap = new Map();
        participants.forEach(p => {
            if (p.email) {
                const normalizedEmail = p.email.toLowerCase().trim();
                if (!uniqueParticipantsMap.has(normalizedEmail)) {
                    uniqueParticipantsMap.set(normalizedEmail, p);
                }
            }
        });
        const deduplicatedParticipants = Array.from(uniqueParticipantsMap.values());

        // Derive target unit IDs from BOTH explicit selection AND participants data
        const participantUnitIds = deduplicatedParticipants.map(p => p.unit_id).filter(Boolean) as string[];
        const allTargetUnitIds = Array.from(new Set([...unitIds, ...participantUnitIds]));

        if (allTargetUnitIds.length === 0) {
            throw new Error('Tidak ada unit valid yang ditemukan di file Excel maupun di pilihan unit.');
        }

        const units = await prisma.unit.findMany({
            where: { id: { in: allTargetUnitIds } },
            include: {
                users: {
                    where: { role: 'supervisor', status: 'active' },
                    select: { id: true }
                },
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

        const existingUsers = await prisma.user.findMany({
            where: { email: { in: deduplicatedParticipants.map(p => p.email) } },
            select: { email: true, name: true, deleted_at: true }
        });

        const activeUsers = existingUsers.filter(u => u.deleted_at === null);
        const trashUsers = existingUsers.filter(u => u.deleted_at !== null);

        // ========================================================================
        // PROCESS TRANSCRIPT EXTERNAL - Create/Update Assessment Templates
        // ========================================================================
        const institutionTemplates = new Map<string, { criteria: string[], type: string }>();

        console.log('📊 Processing transcript_external data from file...');

        // Process ALL participants in the file to find template data
        for (const p of deduplicatedParticipants) {
            if (p.institution_name && p.transcript_external && p.transcript_external.length > 0) {
                const institutionKey = p.institution_name.trim().toLowerCase();
                if (!institutionTemplates.has(institutionKey)) {
                    console.log(`✅ Found transcript_external for: ${p.institution_name}`);
                    console.log('   Criteria:', p.transcript_external);
                    institutionTemplates.set(institutionKey, {
                        criteria: p.transcript_external,
                        type: p.institution_type || p.institution_name
                    });
                }
            }
        }

        // Sync Assessment Templates to database
        const templateOperations: any[] = [];
        for (const [institutionName, data] of institutionTemplates.entries()) {
            const { criteria: criteriaArray } = data;

            // Find the original case-sensitive institution name
            const originalInstitution = deduplicatedParticipants.find(
                p => p.institution_name?.trim().toLowerCase() === institutionName
            )?.institution_name || institutionName;

            // ALWAYS use the original institution name as the template key
            // This ensures school-specific templates are created correctly
            const templateKey = originalInstitution.substring(0, 50);

            console.log(`🔄 Syncing institution-specific template for: ${templateKey}`);

            // Convert string array to proper AssessmentCriteria format
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
                        description: `Auto-generated from bulk import for ${templateKey}`
                    },
                    update: {
                        criteria: formattedCriteria,
                        description: `Updated from bulk import for ${templateKey}`,
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

        // Now handle participant creation
        const activeEmails = new Set(activeUsers.map(u => u.email.toLowerCase()));
        const trashEmails = new Set(trashUsers.map(u => u.email.toLowerCase()));

        // Filter out participants that already exist
        const newParticipants = deduplicatedParticipants.filter(p => !activeEmails.has(p.email.toLowerCase()) && !trashEmails.has(p.email.toLowerCase()));

        if (newParticipants.length === 0) {
            if (templatesCreated > 0) {
                const templateNames = Array.from(institutionTemplates.keys()).map(k => {
                    const original = deduplicatedParticipants.find(p => p.institution_name?.trim().toLowerCase() === k)?.institution_name;
                    return original || k;
                }).join(', ');

                return {
                    success: true,
                    count: 0,
                    importedUsers: [],
                    templatesCreated: templatesCreated,
                    message: `📋 Berhasil memperbarui ${templatesCreated} Assessment Templates:\n${templateNames}\n\n(Tidak ada peserta baru yang ditambahkan karena semua email sudah terdaftar)`
                };
            }

            let errorMessage = "Tidak ada data baru untuk diimport.";
            if (trashUsers.length > 0) {
                const trashNames = trashUsers.map(u => `${u.name} (${u.email})`).join(', ');
                errorMessage += `\n\nAkun berikut ada di Recycle Bin: ${trashNames}.`;
            }
            if (activeEmails.size > 0) {
                errorMessage += `\n\n${activeEmails.size} akun lainnya sudah terdaftar aktif di sistem.`;
            }
            return { success: false, message: errorMessage };
        }

        const unitSlotsMap = new Map<string, { supervisor_id: string | null }[]>();

        for (const unit of units) {
            const currentOccupancy = unit._count?.users || 0;
            const capacity = unit.capacity || 0;
            const freeSlotsCount = Math.max(0, capacity - currentOccupancy);
            const supervisors = unit.users || [];
            const slots: { supervisor_id: string | null }[] = [];

            // Boundary check to prevent infinite loops or memory exhaustion
            const safeFreeSlots = Math.min(freeSlotsCount, 1000);

            for (let i = 0; i < safeFreeSlots; i++) {
                const supervisorId = supervisors.length > 0 ? supervisors[i % supervisors.length].id : null;
                slots.push({ supervisor_id: supervisorId });
            }
            unitSlotsMap.set(unit.id, slots);
        }

        const createData: any[] = [];
        const defaultPassword = 'password123'; // Restored default password for participants

        for (const p of newParticipants) {
            let targetUnitId: string | null = null;
            let targetSupervisorId: string | null = null;

            if (p.unit_id && unitSlotsMap.has(p.unit_id)) {
                const slots = unitSlotsMap.get(p.unit_id);
                if (slots && slots.length > 0) {
                    const slot = slots.shift();
                    targetUnitId = p.unit_id;
                    targetSupervisorId = slot?.supervisor_id || null;
                }
            }

            if (!targetUnitId) {
                for (const [unitId, slots] of unitSlotsMap.entries()) {
                    if (slots.length > 0) {
                        const slot = slots.shift();
                        targetUnitId = unitId;
                        targetSupervisorId = slot?.supervisor_id || null;
                        break;
                    }
                }
            }

            if (!targetUnitId) continue;

            // Normalize institution type
            let finalInstitutionType = p.institution_type?.toUpperCase().trim() || 'UNIVERSITAS';
            const validTypes = ['UNIVERSITAS', 'SMK', 'SMA', 'LAINNYA'];
            if (!validTypes.includes(finalInstitutionType)) {
                // If it's not a standard type, but we have an institution name,
                // we'll keep the custom type (it might be use for template matching)
                // but if it's empty, we default to UNIVERSITAS
                if (!p.institution_type && p.institution_name) {
                    // Try to guess from name
                    const name = p.institution_name.toUpperCase();
                    if (name.includes('SMK')) finalInstitutionType = 'SMK';
                    else if (name.includes('SMA')) finalInstitutionType = 'SMA';
                    else finalInstitutionType = 'UNIVERSITAS';
                }
            }

            createData.push({
                name: p.name,
                email: p.email,
                personal_email: p.personal_email || null,
                phone: p.phone || null,
                institution_name: p.institution_name || null,
                institution_type: finalInstitutionType,
                role: 'participant',
                unit_id: targetUnitId,
                supervisor_id: targetSupervisorId,
                status: 'active',
                password: defaultPassword,
                internship_start: p.internship_start ? new Date(p.internship_start) : null,
                internship_end: p.internship_end ? new Date(p.internship_end) : null,
            });
        }

        if (createData.length === 0) {
            throw new Error('Kapasitas unit terpilih sudah penuh atau tidak valid.');
        }

        if (createData.length < newParticipants.length) {
            // We'll proceed with what we have, but inform the user later
            console.warn(`Only able to import ${createData.length} out of ${newParticipants.length} new participants due to capacity.`);
        }

        const results = await prisma.$transaction(
            createData.map(data => prisma.user.create({ data }))
        );

        // Return data for the account distribution file
        const importedUsers = results.map(u => ({
            name: u.name,
            email: u.email,
            password: defaultPassword,
            unit: units.find(unit => unit.id === u.unit_id)?.name || 'N/A'
        }));

        await logAudit({
            action: 'BULK_IMPORT_PARTICIPANTS',
            entity: 'User',
            details: {
                unit_ids: allTargetUnitIds,
                count: results.length,
                skipped_active: Array.from(activeEmails),
                skipped_trash: Array.from(trashEmails),
                accounts: importedUsers,
                templates_synced: templatesCreated
            }
        });

        const successNames = results.map(u => `${u.name} (${u.email})`).join(', ');
        let finalMessage = `✅ Berhasil mengimport ${results.length} peserta baru:\n${successNames}`;

        if (templatesCreated > 0) {
            finalMessage += `\n\n📋 Assessment Templates tersinkronisasi untuk ${templatesCreated} institusi.`;
        }

        return {
            success: true,
            count: results.length,
            importedUsers,
            message: finalMessage,
            skippedTrash: trashUsers.map(u => ({ name: u.name, email: u.email })),
            templatesCreated: templatesCreated
        };

    } catch (error: any) {
        console.error('Error in bulkImportParticipants:', error);
        return {
            success: false,
            message: error.message || 'Gagal memproses import data.'
        };
    }
}

/**
 * Fetch the history of bulk imports from audit logs
 */
export async function getImportHistory() {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }

    return await prisma.auditLog.findMany({
        where: { action: 'BULK_IMPORT_PARTICIPANTS' },
        include: {
            user: {
                select: { name: true }
            }
        },
        orderBy: { created_at: 'desc' },
        take: 20
    });
}
