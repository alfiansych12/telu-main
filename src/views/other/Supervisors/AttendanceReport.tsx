'use client';

import React, { useState } from 'react';

// MATERIAL - UI
// MATERIAL - UI
import {
    Box,
    useMediaQuery,
    Stack,
    IconButton,
    Typography
} from '@mui/material';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useTheme, alpha } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell as DocxTableCell, TableRow as DocxTableRow, WidthType, AlignmentType, TextRun } from 'docx';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import { getAttendances } from 'utils/api/attendances';
import { getUnits } from 'utils/api/units';
import { formatDate, formatTime } from 'utils/format';

// ICONS

// LOCAL COMPONENTS
import AttendanceReportHeader from './components/AttendanceReportHeader';
import AttendanceFilter from './components/AttendanceFilter';
import AttendanceSummaryCards from './components/AttendanceSummaryCards';
import AttendanceReportTable from './components/AttendanceReportTable';

const AttendanceReportView = () => {
    const theme = useTheme();
    const { data: session } = useSession();
    const userId = (session?.user as any)?.id;
    const downLG = useMediaQuery(theme.breakpoints.down('lg'));

    // States
    const [startDate, setStartDate] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState<string>(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [unitFilter, setUnitFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    // Pagination State
    const [page, setPage] = useState(0);
    const pageSize = 5;

    // Fetch units for dropdown
    const { data: unitsData } = useQuery({
        queryKey: ['units', 'all-for-selector'],
        queryFn: () => getUnits({ pageSize: 100 }),
    });

    // Fetch attendances for current supervisor
    const { data: attendancesData, isLoading } = useQuery({
        queryKey: ['attendance-report', userId, startDate, endDate, unitFilter],
        queryFn: () => getAttendances({
            dateFrom: startDate,
            dateTo: endDate,
            supervisorId: userId,
            unitId: unitFilter !== 'all' ? unitFilter : undefined,
            pageSize: 1000, // Large page size for reports
        }),
        enabled: !!userId,
    });

    const attendances = (attendancesData as any)?.data || (attendancesData as any)?.attendances || [];

    // Calculate stats
    const stats = {
        total: attendances.length,
        present: attendances.filter((a: any) => a.status === 'present' || a.status === 'late').length,
        late: attendances.filter((a: any) => a.status === 'late').length,
        absent: attendances.filter((a: any) => a.status === 'absent').length,
        permit: attendances.filter((a: any) => a.status === 'permit' || a.status === 'sick').length,
        rejected: attendances.filter((a: any) => (a.status as any) === 'rejected').length,
    };

    const filteredAttendances = React.useMemo(() => {
        if (!statusFilter) return attendances;
        if (statusFilter === 'present') return attendances.filter((a: any) => a.status === 'present' || a.status === 'late');
        if (statusFilter === 'excused') return attendances.filter((a: any) => a.status === 'permit' || a.status === 'sick');
        return attendances.filter((a: any) => a.status === statusFilter);
    }, [attendances, statusFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredAttendances.length / pageSize);
    const paginatedAttendances = filteredAttendances.slice(page * pageSize, (page + 1) * pageSize);

    // Reset page when filters change
    React.useEffect(() => {
        setPage(0);
    }, [startDate, endDate, unitFilter, statusFilter]);

    const handleNextPage = () => {
        if (page < totalPages - 1) setPage(page + 1);
    };

    const handlePrevPage = () => {
        if (page > 0) setPage(page - 1);
    };

    // Export to PDF with Simple & Professional Design
    const handleExportPDF = async () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 1. Add Logo
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

        // 2. Official Header Section (Centered)
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(183, 28, 28);
        doc.text('TELKOM UNIVERSITY', pageWidth / 2, 22, { align: 'center' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('Jl. Telekomunikasi No. 1, Terusan Buahbatu - Bojongsoang', pageWidth / 2, 27, { align: 'center' });
        doc.text('Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257', pageWidth / 2, 31, { align: 'center' });

        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('REF: ATT-' + format(new Date(), 'yyyyMMdd-HHmmss'), pageWidth / 2, 36, { align: 'center' });

        // Professional Thin Line
        doc.setDrawColor(183, 28, 28);
        doc.setLineWidth(0.8);
        doc.line(15, 42, pageWidth - 15, 42);

        // 3. Document Title (Centered)
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('INTERNSHIP ATTENDANCE RECAPITULATION', pageWidth / 2, 52, { align: 'center' });

        doc.setFontSize(9);
        doc.text(`Period: ${formatDate(startDate)} - ${formatDate(endDate)}`, pageWidth / 2, 58, { align: 'center' });

        // 4. Simple Summary Table
        autoTable(doc, {
            startY: 65,
            head: [['PRESENT', 'LATE', 'EXCUSED/SICK', 'ABSENT', 'PERCENTAGE']],
            body: [[
                stats.present.toString(),
                stats.late.toString(),
                stats.permit.toString(),
                stats.absent.toString(),
                `${stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0}%`
            ]],
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
                halign: 'center',
                fontStyle: 'bold',
                fontSize: 10,
                lineWidth: 0.1,
                lineColor: [0, 0, 0]
            },
            margin: { left: 15, right: 15 }
        });

        // 5. Detailed Attendance Table
        const tableData = filteredAttendances.map((row: any, index: number) => {
            const status = (row.status || "").toUpperCase();
            let activity = '-';
            try {
                const act = JSON.parse(row.activity_description || '{}');
                activity = act.plan || (row.activity_description?.startsWith('{') ? '-' : row.activity_description) || '-';
            } catch (e) { activity = row.activity_description || '-'; }

            return [
                (index + 1).toString(),
                row.user?.name || '-',
                formatDate(row.date),
                formatTime(row.check_in_time),
                formatTime(row.check_out_time),
                status,
                activity
            ];
        });

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [['NO', 'INTERN NAME', 'DATE', 'CHECK IN', 'CHECK OUT', 'STATUS', 'REMARKS/ACTIVITY']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [245, 245, 245],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineWidth: 0.1,
                lineColor: [0, 0, 0]
            },
            bodyStyles: {
                fontSize: 8,
                lineWidth: 0.1,
                lineColor: [0, 0, 0]
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                1: { cellWidth: 45 },
                2: { halign: 'center', cellWidth: 25 },
                3: { halign: 'center', cellWidth: 18 },
                4: { halign: 'center', cellWidth: 18 },
                5: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
                6: { fontSize: 7 }
            },
            margin: { left: 15, right: 15 }
        });

        // 6. Signature Section (Pinned to bottom)
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

        // 7. Footer Page Numbers
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Page ' + i + ' of ' + pageCount, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        doc.save(`Attendance_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
    };

    // Export to Excel
    const handleExportExcel = () => {
        // Summary data
        const summaryData = [
            ['INTERNSHIP ATTENDANCE RECAPITULATION'],
            [`PERIOD: ${formatDate(startDate).toUpperCase()} TO ${formatDate(endDate).toUpperCase()}`],
            [],
            ['PRESENT', 'LATE', 'EXCUSED/SICK', 'ABSENT', 'PERCENTAGE'],
            [
                stats.present,
                stats.late,
                stats.permit,
                stats.absent,
                `${stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0}%`
            ],
            [],
            ['NO', 'INTERN NAME', 'DATE', 'IN', 'OUT', 'STATUS', 'REMARKS / ACTIVITY']
        ];

        // Attendance data
        const attendanceData = filteredAttendances.map((row: any, index: number) => [
            index + 1,
            row.user?.name || '-',
            formatDate(row.date),
            formatTime(row.check_in_time),
            formatTime(row.check_out_time),
            (row.status || "").toUpperCase(),
            (() => {
                try {
                    const act = JSON.parse(row.activity_description || '{}');
                    return act.plan || (row.activity_description?.startsWith('{') ? '-' : row.activity_description) || '-';
                } catch (e) { return row.activity_description || '-'; }
            })()
        ]);

        const fullData = [...summaryData, ...attendanceData];

        const ws = XLSX.utils.aoa_to_sheet(fullData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');

        // Set column widths
        ws['!cols'] = [
            { wch: 5 },  // NO
            { wch: 30 }, // NAMA
            { wch: 12 }, // TANGGAL
            { wch: 10 }, // MASUK
            { wch: 10 }, // PULANG
            { wch: 15 }, // STATUS
            { wch: 40 }  // KETERANGAN
        ];

        XLSX.writeFile(wb, `Attendance_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    };

    // Export to Word
    const handleExportWord = async () => {
        // Create header rows for summary table
        const summaryHeaderRow = new DocxTableRow({
            children: [
                new DocxTableCell({ children: [new Paragraph({ text: 'PRESENT', alignment: AlignmentType.CENTER, style: 'strong' })], width: { size: 20, type: WidthType.PERCENTAGE } }),
                new DocxTableCell({ children: [new Paragraph({ text: 'LATE', alignment: AlignmentType.CENTER, style: 'strong' })], width: { size: 20, type: WidthType.PERCENTAGE } }),
                new DocxTableCell({ children: [new Paragraph({ text: 'EXCUSED / SICK', alignment: AlignmentType.CENTER, style: 'strong' })], width: { size: 20, type: WidthType.PERCENTAGE } }),
                new DocxTableCell({ children: [new Paragraph({ text: 'ABSENT', alignment: AlignmentType.CENTER, style: 'strong' })], width: { size: 20, type: WidthType.PERCENTAGE } }),
                new DocxTableCell({ children: [new Paragraph({ text: 'PERCENTAGE', alignment: AlignmentType.CENTER, style: 'strong' })], width: { size: 20, type: WidthType.PERCENTAGE } }),
            ],
        });

        const summaryDataRow = new DocxTableRow({
            children: [
                new DocxTableCell({ children: [new Paragraph({ text: stats.present.toString(), alignment: AlignmentType.CENTER })], width: { size: 20, type: WidthType.PERCENTAGE } }),
                new DocxTableCell({ children: [new Paragraph({ text: stats.late.toString(), alignment: AlignmentType.CENTER })], width: { size: 20, type: WidthType.PERCENTAGE } }),
                new DocxTableCell({ children: [new Paragraph({ text: stats.permit.toString(), alignment: AlignmentType.CENTER })], width: { size: 20, type: WidthType.PERCENTAGE } }),
                new DocxTableCell({ children: [new Paragraph({ text: stats.absent.toString(), alignment: AlignmentType.CENTER })], width: { size: 20, type: WidthType.PERCENTAGE } }),
                new DocxTableCell({ children: [new Paragraph({ text: `${stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0}%`, alignment: AlignmentType.CENTER })], width: { size: 20, type: WidthType.PERCENTAGE } }),
            ],
        });

        // Create attendance table header
        const attendanceHeaderRow = new DocxTableRow({
            children: [
                new DocxTableCell({ children: [new Paragraph({ text: 'NO', alignment: AlignmentType.CENTER, style: 'strong' })], width: { size: 5, type: WidthType.PERCENTAGE } }),
                new DocxTableCell({ children: [new Paragraph({ text: 'INTERN NAME', alignment: AlignmentType.CENTER, style: 'strong' })], width: { size: 25, type: WidthType.PERCENTAGE } }),
                new DocxTableCell({ children: [new Paragraph({ text: 'DATE', alignment: AlignmentType.CENTER, style: 'strong' })], width: { size: 12, type: WidthType.PERCENTAGE } }),
                new DocxTableCell({ children: [new Paragraph({ text: 'CHECK IN', alignment: AlignmentType.CENTER, style: 'strong' })], width: { size: 10, type: WidthType.PERCENTAGE } }),
                new DocxTableCell({ children: [new Paragraph({ text: 'CHECK OUT', alignment: AlignmentType.CENTER, style: 'strong' })], width: { size: 10, type: WidthType.PERCENTAGE } }),
                new DocxTableCell({ children: [new Paragraph({ text: 'STATUS', alignment: AlignmentType.CENTER, style: 'strong' })], width: { size: 13, type: WidthType.PERCENTAGE } }),
                new DocxTableCell({ children: [new Paragraph({ text: 'REMARKS / ACTIVITY', alignment: AlignmentType.CENTER, style: 'strong' })], width: { size: 25, type: WidthType.PERCENTAGE } }),
            ],
        });

        // Create attendance data rows
        const attendanceDataRows = filteredAttendances.map((row: any, index: number) => {
            const activity = (() => {
                try {
                    const act = JSON.parse(row.activity_description || '{}');
                    return act.plan || (row.activity_description?.startsWith('{') ? '-' : row.activity_description) || '-';
                } catch (e) { return row.activity_description || '-'; }
            })();

            return new DocxTableRow({
                children: [
                    new DocxTableCell({ children: [new Paragraph({ text: (index + 1).toString(), alignment: AlignmentType.CENTER })] }),
                    new DocxTableCell({ children: [new Paragraph({ text: row.user?.name || '-' })] }),
                    new DocxTableCell({ children: [new Paragraph({ text: formatDate(row.date), alignment: AlignmentType.CENTER })] }),
                    new DocxTableCell({ children: [new Paragraph({ text: formatTime(row.check_in_time), alignment: AlignmentType.CENTER })] }),
                    new DocxTableCell({ children: [new Paragraph({ text: formatTime(row.check_out_time), alignment: AlignmentType.CENTER })] }),
                    new DocxTableCell({ children: [new Paragraph({ text: (row.status || "").toUpperCase(), alignment: AlignmentType.CENTER })] }),
                    new DocxTableCell({ children: [new Paragraph({ text: activity })] }),
                ],
            });
        });

        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        text: 'TELKOM UNIVERSITY',
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 100 },
                        style: 'Heading1'
                    }),
                    new Paragraph({
                        text: 'Jl. Telekomunikasi No. 1, Terusan Buahbatu - Bojongsoang, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257',
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        text: 'INTERNSHIP ATTENDANCE RECAPITULATION',
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 100 },
                        style: 'Heading2'
                    }),
                    new Paragraph({
                        text: `PERIOD: ${formatDate(startDate).toUpperCase()} TO ${formatDate(endDate).toUpperCase()}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 }
                    }),
                    new DocxTable({
                        rows: [summaryHeaderRow, summaryDataRow],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                    }),
                    new Paragraph({ text: '', spacing: { after: 200 } }),
                    new DocxTable({
                        rows: [attendanceHeaderRow, ...attendanceDataRows],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                    }),
                    new Paragraph({ text: '', spacing: { after: 400 } }),
                    new Paragraph({
                        text: '* This document was automatically generated by the PUTI Internship System.',
                        spacing: { after: 100 }
                    }),
                    new Paragraph({
                        text: `* Print Time: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        text: `Bandung, ${format(new Date(), 'dd MMMM yyyy')}`,
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 100 }
                    }),
                    new Paragraph({
                        text: 'Acknowledged by,',
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 400 }
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: session?.user?.name || '', bold: true, underline: {} })],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 50 }
                    }),
                    new Paragraph({
                        text: 'FIELD SUPERVISOR',
                        alignment: AlignmentType.RIGHT,
                    }),
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Attendance_Report_${format(new Date(), 'yyyyMMdd')}.docx`);
    };

    return (
        <Box sx={{ px: 1 }}>
            <AttendanceReportHeader
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                onExportWord={handleExportWord}
                downLG={downLG}
            />

            <AttendanceFilter
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                unitFilter={unitFilter}
                setUnitFilter={setUnitFilter}
                unitsData={unitsData}
                filteredCount={filteredAttendances.length}
                totalCount={attendances.length}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
            />

            <Box>
                <AttendanceSummaryCards
                    stats={stats}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                <MainCard
                    border={false}
                    shadow={theme.customShadows.z1}
                    title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 28, color: theme.palette.primary.main }}>table_chart</span>
                            <Typography variant="h5">Attendance Summary</Typography>
                        </Box>
                    }
                    secondary={
                        totalPages > 1 && (
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', bgcolor: alpha(theme.palette.primary.main, 0.05), px: 1.5, py: 0.5, borderRadius: 1 }}>
                                    {page * pageSize + 1} - {Math.min((page + 1) * pageSize, filteredAttendances.length)} of {filteredAttendances.length}
                                </Typography>
                                <Stack direction="row" spacing={0.5}>
                                    <IconButton
                                        size="small"
                                        onClick={handlePrevPage}
                                        disabled={page === 0}
                                        sx={{
                                            bgcolor: page === 0 ? 'transparent' : alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            '&.Mui-disabled': { opacity: 0.3 }
                                        }}
                                    >
                                        <ArrowLeft2 size={16} variant="Bold" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={handleNextPage}
                                        disabled={page >= totalPages - 1}
                                        sx={{
                                            bgcolor: page >= totalPages - 1 ? 'transparent' : alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            '&.Mui-disabled': { opacity: 0.3 }
                                        }}
                                    >
                                        <ArrowRight2 size={16} variant="Bold" />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        )
                    }
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${startDate}-${endDate}-${unitFilter}-${statusFilter}-${page}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                            <AttendanceReportTable
                                filteredAttendances={paginatedAttendances}
                                isLoading={isLoading}
                                startNumber={page * pageSize + 1}
                            />
                        </motion.div>
                    </AnimatePresence>
                </MainCard>
            </Box>
        </Box>
    );
};

export default AttendanceReportView;
