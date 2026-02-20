import { NextRequest, NextResponse } from 'next/server';
import { getserverAuthSession } from 'utils/authOptions';
import { restoreInstitutionArchives } from 'utils/api/arsip';

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

        const result = await restoreInstitutionArchives(ids);

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `${result.count} archives restored successfully`
        });
    } catch (error) {
        console.error('Error bulk restoring archives:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to restore archives' },
            { status: 500 }
        );
    }
}
