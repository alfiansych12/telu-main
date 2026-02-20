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

        let createdUser: any = null;
        let message = 'Application updated successfully';

        // If approved, automatically create an entry in the Institutional Archive AND Create User Account
        if (status === 'approved') {
            try {
                const responses = application.responses as any;
                const fields = application.form?.fields as any[] || [];

                // Helper to find value by label keywords (case-insensitive)
                const findValueByLabel = (keywords: string[], resObj: any) => {
                    const field = fields.find(f =>
                        keywords.some(k => f.label.toLowerCase().includes(k.toLowerCase()))
                    );
                    if (field && resObj[field.id]) return resObj[field.id];
                    return null;
                };

                const createAccount = async (studentResponses: any, fallbackUnitId?: string) => {
                    let sName = studentResponses.full_name || findValueByLabel(['name', 'nama', 'full name', 'nama lengkap'], studentResponses) || studentResponses['1'] || 'Intern Participant';
                    let sEmail = studentResponses.email || studentResponses.personal_email || findValueByLabel(['email', 'e-mail', 'surel'], studentResponses) || '';
                    let sPhone = studentResponses.phone || findValueByLabel(['phone', 'mobile', 'wa', 'whatsapp', 'hp', 'telepon', 'no hp'], studentResponses) || '';
                    let sIdNumber = studentResponses.id_number || findValueByLabel(['nim', 'nisn', 'student id', 'nomor induk', 'id number'], studentResponses) || studentResponses['2'] || '';

                    // Get unit from student data OR fallback to the form's attached unit
                    const targetUnitId = studentResponses.unit_preference || studentResponses.unit_id || fallbackUnitId;

                    const sStartVal = studentResponses.internship_start || findValueByLabel(['start date', 'mulai', 'tanggal mulai', 'internship start'], studentResponses);
                    const sEndVal = studentResponses.internship_end || findValueByLabel(['end date', 'selesai', 'tanggal selesai', 'internship end'], studentResponses);

                    let sStart = sStartVal ? new Date(sStartVal) : new Date();
                    let sEnd = sEndVal ? new Date(sEndVal) : new Date(new Date().setMonth(new Date().getMonth() + 3));

                    if (!sEmail) {
                        Object.values(studentResponses).forEach((val: any) => {
                            if (typeof val === 'string' && val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                                if (val.length < 100 && !val.includes('fakepath')) sEmail = val;
                            }
                        });
                    }

                    if (!sEmail) {
                        // Clean name for email part
                        let namePart = String(sName || 'user').toLowerCase();
                        if (namePart.includes('fakepath')) {
                            namePart = 'student';
                        }
                        const sanName = namePart.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
                        const sanInst = String(application.institution_name).replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 15);
                        sEmail = `${sanName}.${sanInst}@temp-intern.local`;
                    }

                    if (sName && String(sName).includes('fakepath')) {
                        // If it's a batch/bulk, we might just have the school name in the 'full_name' field
                        sName = application.institution_name + ' Student';
                    }

                    const existing = await (prisma as any).user.findUnique({ where: { email: sEmail } });
                    if (!existing) {
                        const userData: any = {
                            name: sName,
                            email: sEmail,
                            password: 'password123',
                            role: 'participant',
                            status: 'active',
                            institution_name: application.institution_name,
                            phone: String(sPhone),
                            id_number: String(sIdNumber),
                            internship_start: sStart,
                            internship_end: sEnd,
                            created_at: new Date()
                        };

                        if (targetUnitId) {
                            userData.unit_id = targetUnitId;
                        }

                        return await (prisma as any).user.create({
                            data: userData
                        });
                    }
                    return existing;
                };

                // Logic for Bulk vs Single
                if (responses.is_bulk && Array.isArray(responses.students)) {
                    const studentCount = responses.students.length;
                    const emails = responses.students.map((s: any) => s.personal_email || s.email).filter(Boolean);
                    console.log(`[APPROVAL] Processing batch of ${studentCount} students`);
                    for (const student of responses.students) {
                        await createAccount(student);
                    }
                    message = `✅ Batch application approved successfully!\n\nTotal: ${studentCount} student accounts created.\nPassword: password123`;
                    createdUser = {
                        name: `${studentCount} Students (Batch)`,
                        email: emails.join(', '),
                        id_number: '-'
                    };
                } else {
                    const singleUnitId = findValueByLabel(['unit', 'departemen', 'divisi', 'pilihan unit'], responses);
                    createdUser = await createAccount(responses, singleUnitId);
                    message = `✅ Application approved successfully!\n\nEmail: ${createdUser.email}\nPassword: password123`;
                }

                // 3. Create Archive Entry with proper metadata
                const files = (application.files as any) || {};
                const fileList = Object.values(files) as any[];

                const primaryName = createdUser?.name || application.institution_name;
                const primaryEmail = createdUser?.email || 'batch@system';
                const primaryId = createdUser?.id_number || '-';
                const archiveStartDate = createdUser?.internship_start || new Date();
                const archiveEndDate = createdUser?.internship_end || new Date(new Date().setMonth(new Date().getMonth() + 3));

                const archiveMetadata = {
                    source: 'registration_form',
                    form_id: application.form_id,
                    submission_id: application.id,
                    participant_name: primaryName,
                    participant_email: primaryEmail,
                    participant_id_number: primaryId,
                    approved_at: new Date().toISOString(),
                    note: responses.is_bulk ? `Mass Registration - ${responses.student_count} students` : 'Individual Registration',
                    files: files,
                    responses: responses // Include responses for fallback
                };

                let finalDocName = `Registration_${String(application.institution_name).replace(/[^a-zA-Z0-9]/g, '_')}_${String(primaryName).replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.pdf`;
                if (fileList.length > 0) {
                    finalDocName = fileList[0].name || finalDocName;
                }

                await (prisma as any).institutionArchive.create({
                    data: {
                        institution_name: application.institution_name,
                        internship_period_start: archiveStartDate,
                        internship_period_end: archiveEndDate,
                        document_name: finalDocName,
                        document_url: JSON.stringify(archiveMetadata)
                    }
                });

                console.log(`[APPROVAL] Application ${params.id} approved. Result: ${message}`);

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

// DELETE - Delete application
export async function DELETE(
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

        await (prisma as any).registrationSubmission.update({
            where: { id: params.id },
            data: {
                deleted_at: new Date(),
                deleted_by: (session.user as any).id
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Application moved to Recycle Bin'
        });
    } catch (error) {
        console.error('Error deleting application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete application' },
            { status: 500 }
        );
    }
}
