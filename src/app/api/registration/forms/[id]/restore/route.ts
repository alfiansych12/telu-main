import { NextRequest, NextResponse } from 'next/server';
import { getserverAuthSession } from 'utils/authOptions';
import prisma from 'lib/prisma';

export async function POST(
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

        const form = await (prisma as any).registrationForm.update({
            where: { id: params.id },
            data: {
                deleted_at: null,
                deleted_by: null
            }
        });

        return NextResponse.json({
            success: true,
            form,
            message: 'Form restored successfully'
        });
    } catch (error) {
        console.error('Error restoring form:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to restore form' },
            { status: 500 }
        );
    }
}
