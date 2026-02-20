import { NextRequest, NextResponse } from 'next/server';
import { getserverAuthSession } from 'utils/authOptions';
import { permanentDeleteInstitutionArchives } from 'utils/api/arsip';

export async function DELETE(request: NextRequest) {
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

        const result = await permanentDeleteInstitutionArchives(ids);

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `${result.count} archives permanently deleted`
        });
    } catch (error) {
        console.error('Error bulk permanently deleting archives:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to permanently delete archives' },
            { status: 500 }
        );
    }
}
