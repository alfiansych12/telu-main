import { NextRequest, NextResponse } from 'next/server';
import { getserverAuthSession } from 'utils/authOptions';
import { restoreInstitutionArchive } from 'utils/api/arsip';

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

        const archive = await restoreInstitutionArchive(params.id);

        return NextResponse.json({
            success: true,
            archive,
            message: 'Archive restored successfully'
        });
    } catch (error) {
        console.error('Error restoring archive:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to restore archive' },
            { status: 500 }
        );
    }
}
