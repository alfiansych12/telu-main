import { NextResponse } from 'next/server';
import { getDeletedUsers } from 'utils/api/users';
import { getserverAuthSession } from 'utils/authOptions';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getserverAuthSession();
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await getDeletedUsers();
        return NextResponse.json(users);
    } catch (error: any) {
        console.error('[API] GET /api/users/deleted error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
