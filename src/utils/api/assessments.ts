'use server';

import prisma from 'lib/prisma';
import { getserverAuthSession } from 'utils/authOptions';
import { AssessmentWithRelations } from 'types/api';

export interface AssessmentData {
    id?: string;
    user_id: string;
    evaluator_id: string;
    category: string;
    soft_skill: string;
    hard_skill: string;
    attitude: string;
    remarks?: string;
    period?: string;
}

/**
 * Get all assessments for a supervisor's subordinates
 */
export async function getSubordinateAssessments(supervisorId: string) {
    const session = await getserverAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const { role: userRole, id: userId } = session.user as any;

    // Security: supervisors can only see their own assessments
    let effectiveSupervisorId = supervisorId;
    if (userRole === 'supervisor') {
        effectiveSupervisorId = userId;
    } else if (userRole === 'participant') {
        throw new Error('Forbidden');
    }

    try {
        const assessments = await prisma.assessment.findMany({
            where: {
                evaluator_id: effectiveSupervisorId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        institution_type: true,
                        unit: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return assessments as unknown as AssessmentWithRelations[];
    } catch (error) {
        console.error('Error fetching assessments:', error);
        throw error;
    }
}

/**
 * Upsert assessment (create or update)
 */
export async function upsertAssessment(data: AssessmentData) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role === 'participant') {
        throw new Error('Unauthorized');
    }

    const { role: userRole, id: userId } = session.user as any;

    // Security: Only Admin can create assessments FOR others. Supervisors must be the evaluator themselves.
    if (userRole === 'supervisor' && data.evaluator_id !== userId) {
        throw new Error('Forbidden: Supervisors can only evaluate their own team.');
    }

    try {
        if (data.id) {
            return await prisma.assessment.update({
                where: { id: data.id },
                data: {
                    category: data.category,
                    soft_skill: data.soft_skill as any,
                    hard_skill: data.hard_skill as any,
                    attitude: data.attitude as any,
                    scores: (data as any).scores || null,
                    remarks: data.remarks,
                    period: data.period,
                    updated_at: new Date()
                } as any
            });
        } else {
            // Check if an assessment already exists for this user and category to prevent duplicates
            const existing = await prisma.assessment.findFirst({
                where: {
                    user_id: data.user_id,
                    category: data.category
                }
            });

            if (existing) {
                return await prisma.assessment.update({
                    where: { id: existing.id },
                    data: {
                        soft_skill: data.soft_skill as any,
                        hard_skill: data.hard_skill as any,
                        attitude: data.attitude as any,
                        scores: (data as any).scores || null,
                        remarks: data.remarks,
                        period: data.period,
                        updated_at: new Date()
                    } as any
                });
            }

            return await prisma.assessment.create({
                data: {
                    user_id: data.user_id,
                    evaluator_id: data.evaluator_id,
                    category: data.category,
                    soft_skill: data.soft_skill as any,
                    hard_skill: data.hard_skill as any,
                    attitude: data.attitude as any,
                    scores: (data as any).scores || null,
                    remarks: data.remarks,
                    period: data.period
                } as any
            });
        }
    } catch (error) {
        console.error('Error saving assessment:', error);
        throw error;
    }
}

export async function deleteAssessment(id: string) {
    const session = await getserverAuthSession();
    if (!session || (session.user as any).role === 'participant') {
        throw new Error('Unauthorized');
    }

    const { role: userRole, id: userId } = session.user as any;

    try {
        // Ownership check for supervisors
        if (userRole === 'supervisor') {
            const existing = await prisma.assessment.findUnique({
                where: { id },
                select: { evaluator_id: true }
            });
            if (existing && existing.evaluator_id !== userId) {
                throw new Error('Forbidden: Cannot delete assessment created by another evaluator.');
            }
        }

        // Check if exists first to avoid P2025 error
        const existing = await prisma.assessment.findUnique({
            where: { id }
        });

        if (!existing) {
            return { success: true, message: 'Record already deleted' };
        }

        await prisma.assessment.delete({
            where: { id }
        });
        return { success: true };
    } catch (error) {
        console.error('Error deleting assessment:', error);
        throw new Error('Gagal menghapus penilaian dari database.');
    }
}
