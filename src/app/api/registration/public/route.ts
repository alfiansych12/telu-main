import { NextRequest, NextResponse } from 'next/server';
import prisma from 'lib/prisma';

export const dynamic = 'force-dynamic';

// GET - List all active public forms
export async function GET(request: NextRequest) {
    try {
        const forms = await (prisma as any).registrationForm.findMany({
            where: {
                is_active: true
            },
            select: {
                id: true,
                title: true,
                description: true,
                slug: true,
                created_at: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            forms
        });
    } catch (error) {
        console.error('Error fetching public forms:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch forms' },
            { status: 500 }
        );
    }
}
