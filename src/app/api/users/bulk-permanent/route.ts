import { NextResponse } from 'next/server';
import { permanentlyDeleteUsers } from 'utils/api/users';
import { getserverAuthSession } from 'utils/authOptions';

export async function DELETE(request: Request) {
    try {
        const session = await getserverAuthSession();
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { ids } = await request.json();
        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ error: 'IDs array is required' }, { status: 400 });
        }

        const result = await permanentlyDeleteUsers(ids);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[API] DELETE /api/users/bulk-permanent error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
