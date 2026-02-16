import { NextRequest, NextResponse } from 'next/server';
import { getserverAuthSession } from 'utils/authOptions';
import prisma from 'lib/prisma';

export const dynamic = 'force-dynamic';

// GET - List all applications with filters
export async function GET(request: NextRequest) {
    try {
        const session = await getserverAuthSession();

        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');
        const page = parseInt(searchParams.get('page') || '1');

        const where: any = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { institution_name: { contains: search, mode: 'insensitive' } },
                // Note: Searching inside JSON is DB-specific. This is a basic implementation.
                // For PostgreSQL, you might need raw queries for deep JSON search or use proper extensions.
                // For now, we search institution name which is a standard column.
            ];
        }

        // Get total count for pagination
        const total = await (prisma as any).registrationSubmission.count({ where });

        const applications = await (prisma as any).registrationSubmission.findMany({
            where,
            include: {
                form: {
                    select: {
                        title: true,
                        slug: true
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: pageSize,
            skip: (page - 1) * pageSize
        });

        return NextResponse.json({
            success: true,
            applications,
            pagination: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch applications' },
            { status: 500 }
        );
    }
}
