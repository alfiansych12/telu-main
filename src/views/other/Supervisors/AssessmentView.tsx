'use client';

import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Grid,
    Stack,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    DialogContentText,
    useMediaQuery
} from '@mui/material';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Award, DocumentText } from 'iconsax-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell as DocxTableCell, TableRow as DocxTableRow, WidthType, AlignmentType, TextRun } from 'docx';

// PROJECT IMPORTS
import { getSubordinateAssessments, upsertAssessment, deleteAssessment } from 'utils/api/assessments';
import { getUsers } from 'utils/api/users';
import { getAssessmentCriteria, getAssessmentTemplatesByInstitution } from 'utils/api/settings';
import { openAlert } from 'api/alert';

// LOCAL COMPONENTS
import AssessmentTable from './components/AssessmentTable';
import AssessmentDialog from './components/AssessmentDialog';

const AssessmentView = () => {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const supervisorId = (session?.user as any)?.id;
    const downLG = useMediaQuery(theme.breakpoints.down('lg'));

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
    const [formData, setFormData] = useState({
        user_id: '',
        soft_skill: '0',
        hard_skill: '0',
        attitude: '0',
        category: 'internal',
        remarks: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd')
    });

    // Confirmation dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null);

    // Fetch subordinates for selection - Only participants supervised by this supervisor
    const { data: subordinatesData } = useQuery({
        queryKey: ['subordinates', supervisorId],
        queryFn: () => getUsers({
            supervisorId: supervisorId, // Filter by supervisor_id
            role: 'participant',
            status: 'active',
            pageSize: 100
        }),
        enabled: !!supervisorId
    });

    const { data: assessments, isLoading } = useQuery({
        queryKey: ['assessments', supervisorId],
        queryFn: () => getSubordinateAssessments(supervisorId),
        enabled: !!supervisorId
    });

    // Fetch assessment criteria settings (flexible labels)
    const { data: criteria } = useQuery({
        queryKey: ['assessment-criteria'],
        queryFn: () => getAssessmentCriteria()
    });

    // Fetch all templates for row-specific labeling
    const { data: templates } = useQuery({
        queryKey: ['assessment-templates-map'],
        queryFn: () => getAssessmentTemplatesByInstitution()
    });

    // Filter out participants who already have an assessment
    const unassessedParticipants = useMemo(() => {
        const interns = Array.isArray(subordinatesData) ? subordinatesData : (subordinatesData?.data || []);
        if (!interns.length) return [];

        return interns.filter((user: any) => {
            // If editing, always include the currently assessed user
            if (selectedAssessment && user.id === selectedAssessment.user_id) return true;

            // Only show users who don't have BOTH assessments yet
            const userAssessments = assessments?.filter((a: any) => a.user_id === user.id);
            const hasInternal = userAssessments?.some((a: any) => (a.category || 'internal') === 'internal');
            const hasExternal = userAssessments?.some((a: any) => a.category === 'external');

            return !hasInternal || !hasExternal;
        });
    }, [subordinatesData, assessments, selectedAssessment]);

    const mutation = useMutation({
        mutationFn: upsertAssessment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            setDialogOpen(false);
            openAlert({ title: 'Success!', message: 'Assessment record has been saved.', variant: 'success' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAssessment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            setConfirmOpen(false);
            setAssessmentToDelete(null);
            openAlert({ title: 'Deleted!', message: 'Assessment has been removed.', variant: 'success' });
        },
        onError: (error: any) => {
            console.error('Delete error:', error);
            openAlert({
                title: 'Failed!',
                message: error.message || 'Failed to delete assessment. Record might no longer exist.',
                variant: 'error'
            });
        }
    });

    const handleDeleteClick = (id: string) => {
        setAssessmentToDelete(id);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (assessmentToDelete) {
            deleteMutation.mutate(assessmentToDelete);
        }
    };

    const handleOpenDialog = (assessment: any = null) => {
        if (assessment) {
            setSelectedAssessment(assessment);
            let start = format(new Date(), 'yyyy-MM-dd');
            let end = format(new Date(), 'yyyy-MM-dd');

            if (assessment.period && assessment.period.includes(' - ')) {
                const parts = assessment.period.split(' - ');
                try {
                    start = parts[0];
                    end = parts[1];
                } catch (e) { }
            }

            setFormData({
                user_id: assessment.user_id,
                soft_skill: assessment.soft_skill || '0',
                hard_skill: assessment.hard_skill || '0',
                attitude: assessment.attitude || '0',
                category: assessment.category || 'internal',
                remarks: assessment.remarks || '',
                start_date: start,
                end_date: end
            });
        } else {
            setSelectedAssessment(null);
            setFormData({
                user_id: '',
                soft_skill: '0',
                hard_skill: '0',
                attitude: '0',
                category: 'internal',
                remarks: '',
                start_date: format(new Date(), 'yyyy-MM-dd'),
                end_date: format(new Date(), 'yyyy-MM-dd')
            });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async (submissionData?: any) => {
        const dataToSubmit = submissionData || formData;

        if (!dataToSubmit) return;

        // Handle array of assessments (e.g. both internal and external)
        if (Array.isArray(dataToSubmit)) {
            try {
                for (const item of dataToSubmit) {
                    const { start_date, end_date, ...rest } = item;
                    await mutation.mutateAsync({
                        ...rest,
                        period: item.period || `${start_date} - ${end_date}`,
                        evaluator_id: supervisorId
                    });
                }
                setDialogOpen(false);
                openAlert({ title: 'Success!', message: 'All assessment records have been saved.', variant: 'success' });
            } catch (error: any) {
                console.error('Batch save failed:', error);
                openAlert({ title: 'Error', message: error.message || 'Failed to save some assessments.', variant: 'error' });
            }
            return;
        }

        if (!dataToSubmit.user_id) {
            openAlert({ title: 'Error', message: 'Please select an intern.', variant: 'error' });
            return;
        }

        const { start_date, end_date, ...rest } = dataToSubmit;

        mutation.mutate({
            ...rest,
            period: dataToSubmit.period || `${start_date} - ${end_date}`,
            id: selectedAssessment?.id,
            evaluator_id: supervisorId
        });
    };

    const getScoreLabel = (score: number | string) => {
        const numScore = typeof score === 'string' ? parseFloat(score) : score;
        if (numScore >= 85) return { label: 'Excellent', color: 'success' };
        if (numScore >= 75) return { label: 'Good', color: 'info' };
        if (numScore >= 60) return { label: 'Average', color: 'warning' };
        return { label: 'Poor', color: 'error' };
    };

    // Export to PDF
    const handleExportPDF = async () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        try {
            const response = await fetch('/telkom-logo.png');
            const blob = await response.blob();
            const reader = new FileReader();

            await new Promise((resolve, reject) => {
                reader.onloadend = () => {
                    try {
                        const base64data = reader.result as string;
                        doc.addImage(base64data, 'PNG', 25, 14, 20, 20);
                        resolve(true);
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.log('Logo not found');
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(183, 28, 28);
        doc.text('TELKOM UNIVERSITY', pageWidth / 2, 22, { align: 'center' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('Jl. Telekomunikasi No. 1, Terusan Buahbatu - Bojongsoang', pageWidth / 2, 27, { align: 'center' });
        doc.text('Dayeuhkolot, Bandung, West Java 40257', pageWidth / 2, 31, { align: 'center' });

        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('REF: ASS-' + format(new Date(), 'yyyyMMdd-HHmmss'), pageWidth / 2, 36, { align: 'center' });

        doc.setDrawColor(183, 28, 28);
        doc.setLineWidth(0.8);
        doc.line(15, 42, pageWidth - 15, 42);

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('INTERNSHIP ASSESSMENT REPORT', pageWidth / 2, 52, { align: 'center' });

        const totalAssessments = assessments?.length || 0;
        let totalSoftSkill = 0, totalHardSkill = 0, totalAttitude = 0;
        (assessments || []).forEach((row: any) => {
            totalSoftSkill += parseFloat(row.soft_skill || '0');
            totalHardSkill += parseFloat(row.hard_skill || '0');
            totalAttitude += parseFloat(row.attitude || '0');
        });
        const overallAvg = totalAssessments > 0 ? ((totalSoftSkill + totalHardSkill + totalAttitude) / (totalAssessments * 3)).toFixed(1) : '0';

        const summaryY = 60;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.rect(15, summaryY, pageWidth - 30, 20);

        const midX = pageWidth / 2;
        doc.line(midX, summaryY, midX, summaryY + 20);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Total Interns:', 20, summaryY + 8);
        doc.setFont('helvetica', 'normal');
        doc.text(String(totalAssessments), 20, summaryY + 14);

        doc.setFont('helvetica', 'bold');
        doc.text('Overall Average:', midX + 5, summaryY + 8);
        doc.setFont('helvetica', 'normal');
        doc.text(overallAvg + ' / 100', midX + 5, summaryY + 14);

        const tableData = (assessments || []).map((row: any, index: number) => {
            const avg = (parseFloat(row.soft_skill || '0') + parseFloat(row.hard_skill || '0') + parseFloat(row.attitude || '0')) / 3;
            const status = getScoreLabel(avg);
            return [
                (index + 1).toString(),
                row.user?.name || '-',
                `${row.category?.toUpperCase() || 'INTERNAL'}`,
                row.period || '-',
                (row.soft_skill || '0').toString(),
                (row.hard_skill || '0').toString(),
                (row.attitude || '0').toString(),
                avg.toFixed(1),
                status.label.toUpperCase()
            ];
        });

        autoTable(doc, {
            startY: summaryY + 28,
            head: [['NO', 'INTERN NAME', 'TYPE', 'PERIOD', 'SOFT', 'HARD', 'ATTITUDE', 'AVG', 'CATEGORY']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [245, 245, 245],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                halign: 'center',
                lineWidth: 0.1,
                lineColor: [0, 0, 0]
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [0, 0, 0],
                lineWidth: 0.1,
                lineColor: [0, 0, 0]
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                1: { cellWidth: 45 },
                2: { halign: 'center', cellWidth: 35 },
                3: { halign: 'center' },
                4: { halign: 'center' },
                5: { halign: 'center' },
                6: { halign: 'center', fontStyle: 'bold' },
                7: { halign: 'center', fontStyle: 'bold' }
            },
            margin: { left: 15, right: 15 }
        });

        const tableEndY = (doc as any).lastAutoTable.finalY || 0;
        let footerY = pageHeight - 80;
        if (tableEndY > footerY - 10) {
            doc.addPage();
            footerY = pageHeight - 80;
        }

        const signatureX = pageWidth - 75;
        doc.setFontSize(9);
        doc.text('Bandung, ' + format(new Date(), 'dd MMMM yyyy'), signatureX, footerY);
        doc.text('Acknowledged by,', signatureX, footerY + 8);

        const supervisorName = session?.user?.name || 'SUPERVISOR';
        doc.setFont('helvetica', 'bold');
        doc.text(supervisorName, signatureX, footerY + 38);
        doc.line(signatureX, footerY + 39, signatureX + 50, footerY + 39);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Field Supervisor', signatureX, footerY + 44);

        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Page ' + i + ' of ' + pageCount, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        doc.save(`Assessment_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
    };

    // Export to Excel
    const handleExportExcel = () => {
        const excelData = (assessments || []).map((row: any, index: number) => {
            const avg = (parseFloat(row.soft_skill || '0') + parseFloat(row.hard_skill || '0') + parseFloat(row.attitude || '0')) / 3;
            const status = getScoreLabel(avg);
            return {
                'NO': index + 1,
                'INTERN NAME': row.user?.name || '-',
                'TYPE': row.category?.toUpperCase() || 'INTERNAL',
                'PERIOD': row.period || '-',
                'SOFT SKILL': row.soft_skill,
                'HARD SKILL': row.hard_skill,
                'ATTITUDE': row.attitude,
                'AVERAGE': avg.toFixed(1),
                'CATEGORY': status.label,
                'REMARKS': row.remarks || '-'
            };
        });

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Assessment Report');

        ws['!cols'] = [
            { wch: 5 }, { wch: 30 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 40 }
        ];

        XLSX.writeFile(wb, `Assessment_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    };

    // Export to Word
    const handleExportWord = async () => {
        const headerRow = new DocxTableRow({
            children: [
                new DocxTableCell({ children: [new Paragraph({ text: 'NO', alignment: AlignmentType.CENTER, style: 'strong' })] }),
                new DocxTableCell({ children: [new Paragraph({ text: 'INTERN NAME', alignment: AlignmentType.CENTER, style: 'strong' })] }),
                new DocxTableCell({ children: [new Paragraph({ text: 'PERIOD', alignment: AlignmentType.CENTER, style: 'strong' })] }),
                new DocxTableCell({ children: [new Paragraph({ text: 'SOFT SKILL', alignment: AlignmentType.CENTER, style: 'strong' })] }),
                new DocxTableCell({ children: [new Paragraph({ text: 'HARD SKILL', alignment: AlignmentType.CENTER, style: 'strong' })] }),
                new DocxTableCell({ children: [new Paragraph({ text: 'ATTITUDE', alignment: AlignmentType.CENTER, style: 'strong' })] }),
                new DocxTableCell({ children: [new Paragraph({ text: 'AVERAGE', alignment: AlignmentType.CENTER, style: 'strong' })] }),
                new DocxTableCell({ children: [new Paragraph({ text: 'REMARKS', alignment: AlignmentType.CENTER, style: 'strong' })] }),
            ],
        });

        const dataRows = (assessments || []).map((row: any, index: number) => {
            const avg = (parseFloat(row.soft_skill || '0') + parseFloat(row.hard_skill || '0') + parseFloat(row.attitude || '0')) / 3;
            return new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph({ text: (index + 1).toString(), alignment: AlignmentType.CENTER })] }),
                    new DocxTableCell({ children: [new Paragraph({ text: row.user?.name || '-' })] }),
                    new DocxTableCell({ children: [new Paragraph({ text: row.period || '-', alignment: AlignmentType.CENTER })] }),
                    new DocxTableCell({ children: [new Paragraph({ text: (row.soft_skill || '0').toString(), alignment: AlignmentType.CENTER })] }),
                    new DocxTableCell({ children: [new Paragraph({ text: (row.hard_skill || '0').toString(), alignment: AlignmentType.CENTER })] }),
                    new DocxTableCell({ children: [new Paragraph({ text: (row.attitude || '0').toString(), alignment: AlignmentType.CENTER })] }),
                    new DocxTableCell({ children: [new Paragraph({ text: avg.toFixed(1), alignment: AlignmentType.CENTER })] }),
                    new DocxTableCell({ children: [new Paragraph({ text: row.remarks || '-' })] }),
                ],
            });
        });

        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: 'TELKOM UNIVERSITY', alignment: AlignmentType.CENTER, spacing: { after: 100 }, style: 'Heading1' }),
                    new Paragraph({ text: 'INTERNSHIP ASSESSMENT REPORT', alignment: AlignmentType.CENTER, spacing: { after: 200 }, style: 'Heading2' }),
                    new DocxTable({
                        rows: [headerRow, ...dataRows],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                    }),
                    new Paragraph({ text: '', spacing: { after: 400 } }),
                    new Paragraph({ text: `Bandung, ${format(new Date(), 'dd MMMM yyyy')}`, alignment: AlignmentType.RIGHT, spacing: { after: 100 } }),
                    new Paragraph({ text: 'Acknowledged by,', alignment: AlignmentType.RIGHT, spacing: { after: 400 } }),
                    new Paragraph({ children: [new TextRun({ text: session?.user?.name || '', bold: true, underline: {} })], alignment: AlignmentType.RIGHT, spacing: { after: 50 } }),
                    new Paragraph({ text: 'FIELD SUPERVISOR', alignment: AlignmentType.RIGHT }),
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Assessment_Report_${format(new Date(), 'yyyyMMdd')}.docx`);
    };

    return (
        <Box sx={{ px: 1 }}>
            <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>Internship Assessments</Typography>
                    <Typography variant="body1" color="textSecondary">Evaluate Performance Indicators of Participants</Typography>
                </Box>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    sx={{ width: { xs: '100%', md: 'auto' }, flexWrap: 'wrap' }}
                >
                    <Button
                        variant="contained" color="error" startIcon={<DocumentText size={18} />} onClick={handleExportPDF}
                        fullWidth={downLG} sx={{ borderRadius: 2, px: 2, minWidth: { sm: 130 } }}
                    >
                        Export PDF
                    </Button>
                    <Button
                        variant="contained" color="success" startIcon={<DocumentText size={18} />} onClick={handleExportExcel}
                        fullWidth={downLG} sx={{ borderRadius: 2, px: 2, minWidth: { sm: 130 } }}
                    >
                        Export Excel
                    </Button>
                    <Button
                        variant="contained" color="info" startIcon={<DocumentText size={18} />} onClick={handleExportWord}
                        fullWidth={downLG} sx={{ borderRadius: 2, px: 2, minWidth: { sm: 130 } }}
                    >
                        Export Word
                    </Button>
                    <Button
                        variant="contained" startIcon={<Award size={18} />} onClick={() => handleOpenDialog()}
                        fullWidth={downLG} sx={{ borderRadius: 2, px: 3, bgcolor: theme.palette.primary.main, color: '#fff' }}
                    >
                        New Assessment
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <AssessmentTable
                        assessments={assessments || []}
                        isLoading={isLoading}
                        onEdit={handleOpenDialog}
                        onDelete={handleDeleteClick}
                        deleteMutation={deleteMutation}
                        assessmentToDelete={assessmentToDelete}
                        getScoreLabel={getScoreLabel}
                        criteria={criteria}
                        templates={templates || {}}
                    />
                </Grid>
            </Grid>

            <AssessmentDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                selectedAssessment={selectedAssessment}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                mutation={mutation}
                unassessedParticipants={unassessedParticipants}
                criteria={criteria}
                allAssessments={assessments || []}
            />

            <Dialog open={confirmOpen} onClose={() => !deleteMutation.isPending && setConfirmOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this assessment record? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setConfirmOpen(false)} disabled={deleteMutation.isPending}>Cancel</Button>
                    <Button
                        onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending}
                        startIcon={deleteMutation.isPending && <CircularProgress size={16} color="inherit" />}
                    >
                        {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AssessmentView;
