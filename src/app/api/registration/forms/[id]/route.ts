import { NextRequest, NextResponse } from 'next/server';
import { getserverAuthSession } from 'utils/authOptions';
import prisma from 'lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Get single form by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getserverAuthSession();

        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const form = await (prisma as any).registrationForm.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: { submissions: true }
                }
            }
        });

        if (!form) {
            return NextResponse.json(
                { success: false, error: 'Form not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            form
        });
    } catch (error) {
        console.error('Error fetching form:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch form' },
            { status: 500 }
        );
    }
}

// PUT - Update form
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getserverAuthSession();

        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, description, fields, is_active } = body;

        const form = await (prisma as any).registrationForm.update({
            where: { id: params.id },
            data: {
                title,
                description,
                fields,
                is_active,
                updated_at: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            form
        });
    } catch (error) {
        console.error('Error updating form:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update form' },
            { status: 500 }
        );
    }
}

// DELETE - Delete form (with cascade option)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getserverAuthSession();

        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check for force delete parameter
        const { searchParams } = new URL(request.url);
        const forceDelete = searchParams.get('force') === 'true';

        // Check if form has submissions
        const form = await (prisma as any).registrationForm.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: { submissions: true }
                },
                submissions: {
                    select: {
                        id: true,
                        status: true,
                        institution_name: true,
                        created_at: true
                    },
                    take: 5 // Get first 5 for preview
                }
            }
        });

        if (!form) {
            return NextResponse.json(
                { success: false, error: 'Form not found' },
                { status: 404 }
            );
        }

        // If form has submissions and not force delete
        if (form._count.submissions > 0 && !forceDelete) {
            const submissionStats = {
                total: form._count.submissions,
                pending: form.submissions.filter((s: any) => s.status === 'pending').length,
                approved: form.submissions.filter((s: any) => s.status === 'approved').length,
                rejected: form.submissions.filter((s: any) => s.status === 'rejected').length
            };

            return NextResponse.json(
                {
                    success: false,
                    error: 'Cannot delete form with existing submissions',
                    canForceDelete: true,
                    submissionCount: form._count.submissions,
                    submissionStats,
                    recentSubmissions: form.submissions,
                    suggestion: 'Consider deactivating the form instead of deleting it, or use force delete to remove all submissions.'
                },
                { status: 400 }
            );
        }

        // Force delete - delete all submissions first
        if (forceDelete && form._count.submissions > 0) {
            console.log(`[DELETE] Force deleting form ${params.id} with ${form._count.submissions} submissions`);

            // Delete all submissions
            await (prisma as any).registrationSubmission.deleteMany({
                where: { form_id: params.id }
            });
        }

        // Delete the form
        await (prisma as any).registrationForm.delete({
            where: { id: params.id }
        });

        return NextResponse.json({
            success: true,
            message: forceDelete
                ? `Form and ${form._count.submissions} submission(s) deleted successfully`
                : 'Form deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting form:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete form' },
            { status: 500 }
        );
    }
}
