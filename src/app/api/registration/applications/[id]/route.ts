import { NextRequest, NextResponse } from 'next/server';
import { getserverAuthSession } from 'utils/authOptions';
import prisma from 'lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Get application by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getserverAuthSession();

        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const application = await (prisma as any).registrationSubmission.findUnique({
            where: { id: params.id },
            include: {
                form: true
            }
        });

        if (!application) {
            return NextResponse.json(
                { success: false, error: 'Application not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            application
        });
    } catch (error) {
        console.error('Error fetching application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch application' },
            { status: 500 }
        );
    }
}

// PUT - Update application status
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getserverAuthSession();

        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { status } = body;

        // Valid transitions only
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Invalid status' },
                { status: 400 }
            );
        }

        const application = await (prisma as any).registrationSubmission.update({
            where: { id: params.id },
            data: {
                status,
                updated_at: new Date()
            },
            include: {
                form: true
            }
        });

        let createdUser = null;
        let message = 'Application updated successfully';
        let generatedPassword = null;

        // If approved, automatically create an entry in the Institutional Archive AND Create User Account
        if (status === 'approved') {
            try {
                const responses = application.responses as any;
                const fields = application.form?.fields as any[] || [];

                // 1. Identify key fields from form definition with better mapping
                let name = '';
                let email = '';
                let phone = '';
                let idNumber = '';
                let startDate = new Date();
                let endDate = new Date(new Date().setMonth(new Date().getMonth() + 3));

                // Helper to find value by label keywords (case-insensitive)
                const findValueByLabel = (keywords: string[]) => {
                    const field = fields.find(f =>
                        keywords.some(k => f.label.toLowerCase().includes(k.toLowerCase()))
                    );
                    if (field && responses[field.id]) return responses[field.id];
                    return null;
                };

                // Extract data with better fallbacks
                name = findValueByLabel(['name', 'nama', 'full name', 'nama lengkap']) || responses['1'] || 'Intern Participant';
                email = findValueByLabel(['email', 'e-mail', 'surel']) || '';
                phone = findValueByLabel(['phone', 'mobile', 'wa', 'whatsapp', 'hp', 'telepon', 'no hp']) || '';
                idNumber = findValueByLabel(['nim', 'nisn', 'student id', 'nomor induk', 'id number']) || responses['2'] || '';

                // Try to find dates
                const startDateVal = findValueByLabel(['start date', 'mulai', 'tanggal mulai', 'internship start']);
                const endDateVal = findValueByLabel(['end date', 'selesai', 'tanggal selesai', 'internship end']);

                if (startDateVal) startDate = new Date(startDateVal);
                if (endDateVal) endDate = new Date(endDateVal);

                // If email not found in fields, try to find any value that looks like an email
                if (!email) {
                    Object.values(responses).forEach((val: any) => {
                        if (typeof val === 'string' && val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                            email = val;
                        }
                    });
                }

                // Fallback email if absolutely none found
                if (!email) {
                    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                    const sanitizedInstitution = application.institution_name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                    email = `${sanitizedName}.${sanitizedInstitution}@temp-intern.local`;
                }

                // 2. Create User Account if not exists
                const existingUser = await (prisma as any).user.findUnique({ where: { email } });

                if (!existingUser) {
                    // Generate secure random password
                    const generatePassword = () => {
                        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
                        let password = '';
                        for (let i = 0; i < 12; i++) {
                            password += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        return password;
                    };

                    generatedPassword = generatePassword();

                    createdUser = await (prisma as any).user.create({
                        data: {
                            name,
                            email,
                            password: generatedPassword,
                            role: 'participant',
                            status: 'active',
                            institution_name: application.institution_name,
                            phone: String(phone),
                            id_number: String(idNumber),
                            internship_start: startDate,
                            internship_end: endDate,
                            created_at: new Date()
                        }
                    });

                    message = `✅ Application approved successfully!\n\n` +
                        `📧 User Account Created:\n` +
                        `- Email: ${email}\n` +
                        `- Password: ${generatedPassword}\n` +
                        `- Name: ${name}\n` +
                        `- ID Number: ${idNumber}\n\n` +
                        `⚠️ Please inform the participant of their login credentials.`;

                    // TODO: Send notification email/telegram to participant
                    // await sendWelcomeNotification(email, name, generatedPassword);

                } else {
                    message = `⚠️ Application approved, but user with email ${email} already exists in the system.`;
                    createdUser = existingUser;
                }

                // 3. Create Archive Entry with proper metadata
                const docName = `Registration_${application.institution_name.replace(/[^a-zA-Z0-9]/g, '_')}_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.pdf`;

                // Create a metadata object to store in document_url (since we don't have actual file yet)
                const archiveMetadata = {
                    source: 'registration_form',
                    form_id: application.form_id,
                    submission_id: application.id,
                    participant_name: name,
                    participant_email: email,
                    participant_id_number: idNumber,
                    approved_at: new Date().toISOString(),
                    note: 'Auto-generated from registration form approval'
                };

                await (prisma as any).institutionArchive.create({
                    data: {
                        institution_name: application.institution_name,
                        internship_period_start: startDate,
                        internship_period_end: endDate,
                        document_name: docName,
                        document_url: JSON.stringify(archiveMetadata) // Store metadata as JSON string
                    }
                });

                console.log(`[APPROVAL] Application ${params.id} approved. User created: ${email}`);

            } catch (error) {
                console.error('Failed to perform post-approval actions:', error);
                message = '⚠️ Application status updated to approved, but failed to create user account or archive entry. Please create the user manually.';
            }
        } else if (status === 'rejected') {
            message = '❌ Application has been rejected.';
            console.log(`[REJECTION] Application ${params.id} rejected.`);
        }

        return NextResponse.json({
            success: true,
            application,
            message,
            createdUser
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update application' },
            { status: 500 }
        );
    }
}
