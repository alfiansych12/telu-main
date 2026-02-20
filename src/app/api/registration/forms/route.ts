import { NextRequest, NextResponse } from 'next/server';
import { getserverAuthSession } from 'utils/authOptions';
import prisma from 'lib/prisma';

export const dynamic = 'force-dynamic';

// GET - List all registration forms
export async function GET(request: NextRequest) {
    try {
        const session = await getserverAuthSession();

        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const showDeleted = searchParams.get('deleted') === 'true';

        const forms = await (prisma as any).registrationForm.findMany({
            where: {
                deleted_at: showDeleted ? { not: null } : null
            },
            orderBy: { created_at: 'desc' },
            include: {
                _count: {
                    select: { submissions: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            forms: forms
        });
    } catch (error) {
        console.error('Error fetching forms:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch forms' },
            { status: 500 }
        );
    }
}

// POST - Create new registration form
export async function POST(request: NextRequest) {
    try {
        const session = await getserverAuthSession();

        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, description, fields, slug, is_active } = body;

        // Validate required fields
        if (!title || !fields || !slug) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existingForm = await (prisma as any).registrationForm.findUnique({
            where: { slug }
        });

        if (existingForm) {
            return NextResponse.json(
                { success: false, error: 'Slug already exists' },
                { status: 400 }
            );
        }

        // Create form
        const form = await (prisma as any).registrationForm.create({
            data: {
                title,
                description,
                fields,
                slug,
                is_active: is_active ?? true
            }
        });

        return NextResponse.json({
            success: true,
            form
        });
    } catch (error) {
        console.error('Error creating form:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create form' },
            { status: 500 }
        );
    }
}
// DELETE - Bulk soft delete forms
export async function DELETE(request: NextRequest) {
    try {
        const session = await getserverAuthSession();

        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const ids = searchParams.get('ids');

        if (!ids) {
            return NextResponse.json(
                { success: false, error: 'No IDs provided' },
                { status: 400 }
            );
        }

        const idList = ids.split(',');
        const result = await (prisma as any).registrationForm.updateMany({
            where: {
                id: { in: idList },
                deleted_at: null
            },
            data: {
                deleted_at: new Date(),
                deleted_by: (session.user as any).id
            }
        });

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `${result.count} forms moved to Recycle Bin`
        });
    } catch (error) {
        console.error('Error bulk deleting forms:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete forms' },
            { status: 500 }
        );
    }
}
