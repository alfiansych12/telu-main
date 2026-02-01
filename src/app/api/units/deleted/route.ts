import { NextResponse } from 'next/server';
import { getDeletedUnits } from 'utils/api/units';
import { getserverAuthSession } from 'utils/authOptions';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getserverAuthSession();
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const units = await getDeletedUnits();
        return NextResponse.json(units);
    } catch (error: any) {
        console.error('[API] GET /api/units/deleted error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
