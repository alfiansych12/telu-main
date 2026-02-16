import { NextRequest, NextResponse } from 'next/server';
import prisma from 'lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Get form by slug (public access)
export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const form = await (prisma as any).registrationForm.findUnique({
            where: {
                slug: params.slug,
                is_active: true // Only return active forms
            },
            select: {
                id: true,
                title: true,
                description: true,
                fields: true,
                slug: true
            }
        });

        if (!form) {
            return NextResponse.json(
                { success: false, error: 'Form not found or inactive' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            form
        });
    } catch (error) {
        console.error('Error fetching public form:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch form' },
            { status: 500 }
        );
    }
}
