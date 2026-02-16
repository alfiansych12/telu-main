import { NextRequest, NextResponse } from 'next/server';
import prisma from 'lib/prisma';
import { getserverAuthSession } from 'utils/authOptions';

/**
 * GET - Get single template by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getserverAuthSession();
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const template = await (prisma as any).notificationTemplate.findUnique({
            where: { id: params.id }
        });

        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            template
        });
    } catch (error) {
        console.error('Error fetching template:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PUT - Update template
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getserverAuthSession();
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            template_name,
            title,
            message_template,
            description,
            variables,
            is_active
        } = body;

        const template = await (prisma as any).notificationTemplate.update({
            where: { id: params.id },
            data: {
                template_name,
                title,
                message_template,
                description,
                variables,
                is_active,
                updated_by: (session.user as any).id,
                updated_at: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            template
        });
    } catch (error: any) {
        console.error('Error updating template:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE - Delete template
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getserverAuthSession();
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await (prisma as any).notificationTemplate.delete({
            where: { id: params.id }
        });

        return NextResponse.json({
            success: true,
            message: 'Template deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting template:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
