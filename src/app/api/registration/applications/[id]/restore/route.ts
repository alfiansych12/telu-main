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

        const application = await (prisma as any).registrationSubmission.update({
            where: { id: params.id },
            data: {
                deleted_at: null,
                deleted_by: null
            }
        });

        return NextResponse.json({
            success: true,
            application,
            message: 'Application restored successfully'
        });
    } catch (error) {
        console.error('Error restoring application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to restore application' },
            { status: 500 }
        );
    }
}
