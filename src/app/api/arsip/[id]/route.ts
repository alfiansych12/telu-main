import { NextResponse } from 'next/server';
import { updateInstitutionArchive, deleteInstitutionArchive } from 'utils/api/arsip';
import { getserverAuthSession } from 'utils/authOptions';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getserverAuthSession();
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const updated = await updateInstitutionArchive(id, body);
        return NextResponse.json(updated);
    } catch (error: any) {
        console.error(`[API] PUT /api/arsip/${params.id} error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getserverAuthSession();
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        await deleteInstitutionArchive(id, (session.user as any).id);
        return NextResponse.json({ success: true, message: 'Archive moved to Recycle Bin' });
    } catch (error: any) {
        console.error(`[API] DELETE /api/arsip/${params.id} error:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
