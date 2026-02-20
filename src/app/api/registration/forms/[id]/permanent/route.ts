import { NextRequest, NextResponse } from 'next/server';
import { getserverAuthSession } from 'utils/authOptions';
import prisma from 'lib/prisma';

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

        // Permanent delete also deletes submissions (Cascade)
        await (prisma as any).registrationForm.delete({
            where: { id: params.id }
        });

        return NextResponse.json({
            success: true,
            message: 'Form and all submissions permanently deleted'
        });
    } catch (error) {
        console.error('Error permanently deleting form:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to permanently delete form' },
            { status: 500 }
        );
    }
}
