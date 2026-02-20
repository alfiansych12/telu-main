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
        const showDeleted = searchParams.get('deleted') === 'true';

        const where: any = {
            deleted_at: showDeleted ? { not: null } : null
        };

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

// DELETE - Bulk delete applications
export async function DELETE(request: NextRequest) {
    try {
        const session = await getserverAuthSession();

        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const ids = searchParams.get('ids'); // comma-separated
        const all = searchParams.get('all') === 'true';
        const status = searchParams.get('status');

        if (all) {
            const where: any = {};
            if (status && status !== 'all') {
                where.status = status;
            }

            const result = await (prisma as any).registrationSubmission.updateMany({
                where: {
                    ...where,
                    deleted_at: null
                },
                data: {
                    deleted_at: new Date(),
                    deleted_by: (session.user as any).id
                }
            });
            return NextResponse.json({
                success: true,
                count: result.count,
                message: `${result.count} applications moved to Recycle Bin`
            });
        }

        if (ids) {
            const idList = ids.split(',');
            const result = await (prisma as any).registrationSubmission.updateMany({
                where: {
                    id: { in: idList },
                    deleted_at: null
                },
                data: {
                    deleted_at: new Date(),
                    deleted_by: (session.user as any).id
                }
            });
            return NextResponse.json({
                success: true,
                count: result.count,
                message: `${result.count} applications moved to Recycle Bin`
            });
        }

        return NextResponse.json(
            { success: false, error: 'No IDs or "all" flag provided' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Error deleting applications:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete applications' },
            { status: 500 }
        );
    }
}
