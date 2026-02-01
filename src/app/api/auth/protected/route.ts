// NEXT
import { NextResponse } from 'next/server';

// PROJECT IMPORTS
import { getserverAuthSession } from 'utils/authOptions';

export const dynamic = 'force-dynamic';

// ==============================|| NEXT AUTH - ROUTES  ||============================== //

export async function GET(request: Request) {
  const session = await getserverAuthSession();
  if (session) {
    return NextResponse.json({ protected: true });
  } else {
    return NextResponse.json({ protected: false });
  }
}
