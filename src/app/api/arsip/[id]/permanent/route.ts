import { NextRequest, NextResponse } from 'next/server';
import { getserverAuthSession } from 'utils/authOptions';
import { permanentDeleteInstitutionArchive } from 'utils/api/arsip';

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

        await permanentDeleteInstitutionArchive(params.id);

        return NextResponse.json({
            success: true,
            message: 'Archive permanently deleted'
        });
    } catch (error) {
        console.error('Error permanently deleting archive:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to permanently delete archive' },
            { status: 500 }
        );
    }
}
