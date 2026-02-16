import { NextRequest, NextResponse } from 'next/server';
import prisma from 'lib/prisma';

// POST - Submit registration application
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { form_id, institution_name, responses, files } = body;

        // Validate required fields
        if (!form_id || !institution_name || !responses) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify form exists and is active
        const form = await (prisma as any).registrationForm.findUnique({
            where: { id: form_id, is_active: true }
        });

        if (!form) {
            return NextResponse.json(
                { success: false, error: 'Form not found or inactive' },
                { status: 404 }
            );
        }

        // Create submission
        const submission = await (prisma as any).registrationSubmission.create({
            data: {
                form_id,
                institution_name,
                responses,
                files: files || {},
                status: 'pending'
            }
        });

        return NextResponse.json({
            success: true,
            submission: {
                id: submission.id,
                application_id: `REG-${submission.id.substring(0, 8).toUpperCase()}`
            }
        });
    } catch (error) {
        console.error('Error submitting application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit application' },
            { status: 500 }
        );
    }
}
