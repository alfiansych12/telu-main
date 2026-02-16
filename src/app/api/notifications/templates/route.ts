import { NextRequest, NextResponse } from 'next/server';
import prisma from 'lib/prisma';
import { getserverAuthSession } from 'utils/authOptions';

/**
 * GET - Get all notification templates
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getserverAuthSession();
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const templates = await (prisma as any).notificationTemplate.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            templates
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST - Create new notification template
 */
export async function POST(request: NextRequest) {
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
            template_key,
            template_name,
            title,
            message_template,
            description,
            variables,
            is_active
        } = body;

        // Validation
        if (!template_key || !template_name || !title || !message_template) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const template = await (prisma as any).notificationTemplate.create({
            data: {
                template_key,
                template_name,
                title,
                message_template,
                description,
                variables,
                is_active: is_active ?? true,
                created_by: (session.user as any).id,
                updated_by: (session.user as any).id
            }
        });

        return NextResponse.json({
            success: true,
            template
        });
    } catch (error: any) {
        console.error('Error creating template:', error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Template key already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
