
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate, formatTime } from 'utils/format';

interface ReportData {
    user: {
        id: string;
        name: string;
        email: string;
        unit: string;
        supervisor: string;
        institution_name?: string;
    };
    stats: {
        present: number;
        late: number;
        absent: number;
        sick: number;
        permit: number;
        total_days: number;
    };
    attendances: any[];
    insight: string;
}

const RED_TELKOM: [number, number, number] = [183, 28, 28]; // Primary Red

const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined') {
            resolve('');
            return;
        }
        const img = new Image();
        img.src = url;
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } else {
                resolve('');
            }
        };
        img.onerror = () => resolve('');
    });
};

export const generateMonthlyReportPDF = async (data: ReportData[], period: string, type: 'individual' | 'institution' | 'overall' = 'individual') => {
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    const titleMap = {
        individual: 'Individual Attendance Report',
        institution: 'Institutional Attendance Report',
        overall: 'Overall Attendance Summary'
    };

    // Load Logo for header
    const logoBase64 = await loadImage('/telkom-logo.png');

    const drawHeader = (doc: any, pageTitle: string) => {
        // -- HEADER --
        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', 14, 10, 16, 16);
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(RED_TELKOM[0], RED_TELKOM[1], RED_TELKOM[2]);
        doc.text('TELKOM UNIVERSITY', 34, 16);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Jl. Telekomunikasi No. 1, Terusan Buahbatu - Bojongsoang, Bandung 40257', 34, 21);

        // Right side info
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 44, 52);
        doc.text(pageTitle, pageWidth - 14, 16, { align: 'right' });

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Period: ${period}`, pageWidth - 14, 21, { align: 'right' });

        doc.setLineWidth(0.5);
        doc.setDrawColor(RED_TELKOM[0], RED_TELKOM[1], RED_TELKOM[2]);
        doc.line(14, 28, pageWidth - 14, 28);
    };

    if (type === 'overall') {
        drawHeader(doc, titleMap[type]);

        const tableData = data.map(intern => [
            intern.user.name,
            intern.user.institution_name || '-',
            intern.user.unit,
            intern.stats.present,
            intern.stats.total_days,
            ((intern.stats.present / (intern.stats.total_days || 1)) * 100).toFixed(1) + '%',
            intern.insight
        ]);

        autoTable(doc, {
            startY: 35,
            head: [['Participant', 'Institution', 'Unit', 'Present', 'Total', '%', 'Insight']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: RED_TELKOM, textColor: 255 },
            styles: { fontSize: 8 }
        });
    } else {
        // Group data if institution type
        let processedData = data;
        if (type === 'institution') {
            // Sort by institution
            processedData = [...data].sort((a, b) =>
                (a.user.institution_name || '').localeCompare(b.user.institution_name || '')
            );
        }

        processedData.forEach((intern, index) => {
            // Add new page for each intern if not the first
            if (index > 0) {
                doc.addPage();
            }

            drawHeader(doc, titleMap[type]);

            let finalY = 38;

            // -- INTERN DETAILS --
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0);
            doc.text(`Participant: ${intern.user.name}`, 14, finalY);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            doc.text(`Institution: ${intern.user.institution_name || '-'}`, 14, finalY + 6);
            doc.text(`Unit: ${intern.user.unit} | Supervisor: ${intern.user.supervisor}`, 14, finalY + 11);
            doc.text(`Performance Insight: ${intern.insight}`, 14, finalY + 16);

            // -- SUMMARY STATS CARD --
            const attendancePercentage = ((intern.stats.present / (intern.stats.total_days || 1)) * 100).toFixed(1) + '%';

            autoTable(doc, {
                startY: finalY + 22,
                head: [['Present', 'Late', 'Sick', 'Permit', 'Absent', 'Total Days', 'Attendance %']],
                body: [[
                    intern.stats.present,
                    intern.stats.late,
                    intern.stats.sick,
                    intern.stats.permit,
                    intern.stats.absent,
                    intern.stats.total_days,
                    attendancePercentage
                ]],
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
                styles: { halign: 'center', fontSize: 9 }
            });

            // -- ATTENDANCE LOG --
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(40);
            doc.text('Detailed Attendance Log', 14, (doc as any).lastAutoTable.finalY + 10);

            const logData = intern.attendances.map(att => {
                let activity = '-';
                if (att.activity_description) {
                    try {
                        const parsed = JSON.parse(att.activity_description);
                        if (parsed.via === 'leave-request') {
                            activity = `LEAVE: ${parsed.type?.toUpperCase()} - ${parsed.reason || '(No reason provided)'}`;
                        } else {
                            activity = parsed.plan || parsed.activity || (typeof att.activity_description === 'string' && !att.activity_description.startsWith('{') ? att.activity_description : '-');
                        }
                    } catch (e) {
                        activity = att.activity_description;
                    }
                }

                return [
                    formatDate(att.date),
                    formatTime(att.check_in_time),
                    formatTime(att.check_out_time),
                    (att.status || 'ABSENT').toUpperCase(),
                    activity
                ];
            });

            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 14,
                head: [['Date', 'In', 'Out', 'Status', 'Activity Summary']],
                body: logData,
                theme: 'striped',
                headStyles: { fillColor: [52, 73, 94], fontStyle: 'bold' },
                styles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 28 },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 20 },
                    3: { cellWidth: 20 },
                    4: { cellWidth: 'auto' }
                }
            });
        });
    }

    // Save
    doc.save(`${titleMap[type] || 'Report'}_${period.replace(/\s/g, '_')}.pdf`);
};
