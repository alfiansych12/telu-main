import { NextResponse } from 'next/server';
import { getDashboardStats } from 'utils/api/dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('[API-ROUTE] /api/dashboard/stats - GET request received');
        const stats = await getDashboardStats();
        console.log('[API-ROUTE] /api/dashboard/stats - Stats fetched successfully');
        return NextResponse.json(stats);
    } catch (error) {
        console.error('[API-ROUTE] /api/dashboard/stats - CRITICAL ERROR:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
}
