
'use server';

import prisma from 'lib/prisma';
import { getCertificateSettings, getCriteriaForUser, getAssessmentTemplates } from './settings';
import { getserverAuthSession } from 'utils/authOptions';

export async function getCertificateEligibility(userId: string) {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const { role: userRole, id: sessionUserId } = session.user as any;

    // Security check: participants can only check their own eligibility
    if (userRole === 'participant' && userId !== sessionUserId) {
        throw new Error('Forbidden: Access denied to other user\'s certificate data');
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                assessments: {
                    include: {
                        evaluator: true
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                },
                unit: true
            }
        });

        if (!user) {
            return { eligible: false, message: 'User tidak ditemukan' };
        }

        // Check if assessment exists
        // Check if assessment exists - prioritize 'internal' category
        let assessment = user.assessments.find((a: any) => (a.category || 'internal') === 'internal');

        // If no internal assessment, take the latest one (which might be external)
        if (!assessment) {
            assessment = user.assessments[0];
        }

        if (!assessment) {
            return {
                eligible: false,
                message: 'Penilaian belum diberikan oleh supervisor. Silakan hubungi supervisor Anda.',
                reason: 'AWAITING_ASSESSMENT'
            };
        }



        // Generate a persistent unique 9-digit number from assessment ID
        // Simple hash function to get a numeric value from UUID
        const idString = assessment.id.replace(/-/g, '');
        let hash = 0;
        for (let i = 0; i < idString.length; i++) {
            const char = idString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        const uniqueNumber = Math.abs(hash % 1000000000).toString().padStart(9, '0');
        const certNo = `No: ${uniqueNumber}/INTERN-PUTI/Tel-U/${new Date().getFullYear()}`;

        // Get certificate settings for HR officer info
        const [certSettings, criteria] = await Promise.all([
            getCertificateSettings(),
            getCriteriaForUser(userId)
        ]);

        const internalData = (() => {
            const internal = user.assessments.find(a => (a as any).category === 'internal');
            if (!internal) return null;
            const rawScores = (internal as any).scores || {};
            const scores = {
                soft_skill: rawScores.soft_skill || internal.soft_skill || '0',
                hard_skill: rawScores.hard_skill || internal.hard_skill || '0',
                attitude: rawScores.attitude || internal.attitude || '0',
                ...rawScores
            };
            const vals = Object.values(scores).map(v => parseFloat(v as string)).filter(v => !isNaN(v));
            const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
            return {
                scores,
                criteria: criteria.internal,
                avgScore: avg,
                grade: avg >= 85 ? 'A' : avg >= 75 ? 'B' : avg >= 60 ? 'C' : 'D',
                evaluator: internal.evaluator?.name || 'Supervisor'
            };
        })();

        const externalData = (() => {
            const external = user.assessments.find(a => (a as any).category === 'external');
            if (!external) return null;
            const rawScores = (external as any).scores || {};
            const scores = {
                soft_skill: rawScores.soft_skill || external.soft_skill || '0',
                hard_skill: rawScores.hard_skill || external.hard_skill || '0',
                attitude: rawScores.attitude || external.attitude || '0',
                ...rawScores
            };
            const vals = Object.values(scores).map(v => parseFloat(v as string)).filter(v => !isNaN(v));
            const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
            return {
                scores,
                criteria: criteria.external,
                avgScore: avg,
                grade: avg >= 85 ? 'A' : avg >= 75 ? 'B' : avg >= 60 ? 'C' : 'D',
                evaluator: external.evaluator?.name || 'Supervisor'
            };
        })();

        const intAvgVal = internalData?.avgScore || 0;
        const extAvgVal = externalData?.avgScore || 0;
        const activeCount = (intAvgVal > 0 && extAvgVal > 0) ? 2 : 1;
        const averageScore = Math.round((intAvgVal + extAvgVal) / activeCount);

        let grade = 'C';
        if (averageScore >= 85) grade = 'A';
        else if (averageScore >= 75) grade = 'B';
        else if (averageScore >= 60) grade = 'C';
        else grade = 'D';

        return {
            eligible: true,
            data: {
                certNo: certNo,
                uniqueId: uniqueNumber,
                name: user.name,
                unit: user.unit?.name || 'General Unit',
                department: user.unit?.department || 'Universitas Telkom',
                period: `${user.internship_start ? new Date(user.internship_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} - ${user.internship_end ? new Date(user.internship_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}`,
                score: averageScore,
                grade: grade,
                softSkill: assessment.soft_skill,
                hardSkill: assessment.hard_skill,
                attitude: assessment.attitude,
                remarks: assessment.remarks,
                evaluator: assessment.evaluator?.name || 'Supervisor',
                issueDate: assessment.created_at ? new Date(assessment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                hrOfficerName: certSettings.hr_officer_name,
                hrOfficerPosition: certSettings.hr_officer_position,
                city: certSettings.city,
                photo: (user as any).photo,
                phone: (user as any).phone,
                institutionName: (user as any).institution_name,
                institutionType: (user as any).institution_type,
                personalEmail: (user as any).personal_email,
                criteria: criteria,
                category: (assessment as any).category || 'internal',
                scores: (assessment as any).scores || null,
                evaluatorIdNumber: (assessment.evaluator as any)?.id_number || '',
                hrInstitutionName: 'Universitas Telkom',
                allAssessments: user.assessments.map(a => ({
                    id: a.id,
                    category: a.category || 'internal',
                    soft_skill: a.soft_skill,
                    hard_skill: a.hard_skill,
                    attitude: a.attitude,
                    scores: (a as any).scores,
                    remarks: a.remarks,
                    period: a.period,
                    evaluator: a.evaluator?.name,
                    created_at: a.created_at
                })),
                templates: await getAssessmentTemplates(),
                internalData,
                externalData
            }
        };

    } catch (error) {
        console.error('Error fetching certificate eligibility:', error);
        return { eligible: false, message: 'Terjadi kesalahan sistem.' };
    }
}

export async function validateCertificateByNumber(certNumber: string) {
    try {
        // Clean the input to get just the numeric part
        const numericPart = certNumber.replace(/[^0-9]/g, '');

        if (numericPart.length < 5) {
            return { success: false, message: 'Nomor sertifikat tidak valid' };
        }

        // We need to find which assessment corresponds to this number
        // For performance, we'll fetch all assessments and check their hash-derived number
        // In a real production app with many records, you'd store this number in the database
        const assessments = await prisma.assessment.findMany({
            include: {
                user: {
                    include: {
                        unit: true
                    }
                },
                evaluator: true
            }
        });

        const certSettings = await getCertificateSettings();

        for (const assessment of assessments) {
            const idString = assessment.id.replace(/-/g, '');
            let hash = 0;
            for (let i = 0; i < idString.length; i++) {
                const char = idString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            const uniqueNumber = Math.abs(hash % 1000000000).toString().padStart(9, '0');

            if (uniqueNumber === numericPart || certNumber.includes(uniqueNumber)) {
                const soft = parseFloat((assessment as any).soft_skill?.toString() || '0');
                const hard = parseFloat((assessment as any).hard_skill?.toString() || '0');
                const attitude = parseFloat((assessment as any).attitude?.toString() || '0');
                const averageScore = Math.round((soft + hard + attitude) / 3);

                let grade = 'C';
                if (averageScore >= 85) grade = 'A';
                else if (averageScore >= 75) grade = 'B';
                else if (averageScore >= 60) grade = 'C';
                else grade = 'D';

                return {
                    success: true,
                    data: {
                        certNo: `No: ${uniqueNumber}/INTERN-PUTI/Tel-U/${assessment.created_at?.getFullYear() || 2026}`,
                        uniqueId: uniqueNumber,
                        name: assessment.user.name,
                        unit: assessment.user.unit?.name || 'General Unit',
                        department: assessment.user.unit?.department || 'Universitas Telkom',
                        period: `${assessment.user.internship_start ? new Date(assessment.user.internship_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} - ${assessment.user.internship_end ? new Date(assessment.user.internship_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}`,
                        score: averageScore,
                        grade: grade,
                        evaluator: assessment.evaluator?.name || 'Supervisor',
                        issueDate: assessment.created_at ? new Date(assessment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-',
                        hrOfficerName: certSettings.hr_officer_name,
                        hrOfficerPosition: certSettings.hr_officer_position,
                        city: certSettings.city,
                        photo: (assessment.user as any).photo,
                        phone: (assessment.user as any).phone,
                        institutionName: (assessment.user as any).institution_name,
                        institutionType: (assessment.user as any).institution_type,
                        personalEmail: (assessment.user as any).personal_email,
                        evaluatorIdNumber: (assessment.evaluator as any)?.id_number || ''
                    }
                };
            }
        }

        return { success: false, message: 'Sertifikat tidak ditemukan' };
    } catch (error) {
        console.error('Error validating certificate:', error);
        return { success: false, message: 'Terjadi kesalahan sistem' };
    }
}

