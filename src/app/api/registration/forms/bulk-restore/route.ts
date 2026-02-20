import { NextRequest, NextResponse } from 'next/server';
import { getserverAuthSession } from 'utils/authOptions';
import prisma from 'lib/prisma';

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
        const { ids } = body;

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json(
                { success: false, error: 'Invalid or missing IDs' },
                { status: 400 }
            );
        }

        const result = await (prisma as any).registrationForm.updateMany({
            where: {
                id: { in: ids }
            },
            data: {
                deleted_at: null,
                deleted_by: null
            }
        });

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `${result.count} forms restored successfully`
        });
    } catch (error) {
        console.error('Error bulk restoring forms:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to restore forms' },
            { status: 500 }
        );
    }
}
