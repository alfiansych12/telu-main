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

        await (prisma as any).registrationSubmission.delete({
            where: { id: params.id }
        });

        return NextResponse.json({
            success: true,
            message: 'Application permanently deleted'
        });
    } catch (error) {
        console.error('Error permanently deleting application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to permanently delete application' },
            { status: 500 }
        );
    }
}
