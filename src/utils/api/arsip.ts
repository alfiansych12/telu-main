import prisma from 'lib/prisma';

export async function getInstitutionArchives() {
    return await prisma.institutionArchive.findMany({
        orderBy: {
            created_at: 'desc',
        },
    });
}

export async function createInstitutionArchive(data: any) {
    return await prisma.institutionArchive.create({
        data: {
            institution_name: data.institution_name,
            internship_period_start: new Date(data.internship_period_start),
            internship_period_end: new Date(data.internship_period_end),
            document_name: data.document_name,
            document_url: data.document_url,
        },
    });
}

export async function updateInstitutionArchive(id: string, data: any) {
    return await prisma.institutionArchive.update({
        where: { id },
        data: {
            institution_name: data.institution_name,
            internship_period_start: new Date(data.internship_period_start),
            internship_period_end: new Date(data.internship_period_end),
            document_name: data.document_name,
            document_url: data.document_url,
        },
    });
}

export async function deleteInstitutionArchive(id: string) {
    return await prisma.institutionArchive.delete({
        where: { id },
    });
}
