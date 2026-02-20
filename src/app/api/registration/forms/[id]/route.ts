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

        // For soft delete, we don't necessarily need to check for submissions
        // because we can restore everything.

        await (prisma as any).registrationForm.update({
            where: { id: params.id },
            data: {
                deleted_at: new Date(),
                deleted_by: (session.user as any).id
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Form moved to Recycle Bin'
        });
    } catch (error) {
        console.error('Error deleting form:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete form' },
            { status: 500 }
        );
    }
}
