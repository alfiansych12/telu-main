import { NextRequest, NextResponse } from 'next/server';
import { permanentlyDeleteUser } from 'utils/api/users';
import { getserverAuthSession } from 'utils/authOptions';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getserverAuthSession();
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await permanentlyDeleteUser(params.id);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
