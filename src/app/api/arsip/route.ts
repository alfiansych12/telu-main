import { NextResponse } from 'next/server';
import { getInstitutionArchives, createInstitutionArchive } from 'utils/api/arsip';
import { getserverAuthSession } from 'utils/authOptions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getserverAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const showDeleted = searchParams.get('deleted') === 'true';

        const archives = await getInstitutionArchives(showDeleted);
        return NextResponse.json(archives);
    } catch (error: any) {
        console.error('[API] GET /api/arsip error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getserverAuthSession();
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const newArchive = await createInstitutionArchive(body);
        return NextResponse.json(newArchive);
    } catch (error: any) {
        console.error('[API] POST /api/arsip error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
