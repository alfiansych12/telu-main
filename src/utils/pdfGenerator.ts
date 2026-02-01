
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// import { formatDate } from 'utils/format';

interface ReportData {
    user: {
        name: string;
        email: string;
        unit: string;
        supervisor: string;
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

export const generateMonthlyReportPDF = (data: ReportData[], period: string) => {
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // -- HEADER --
    doc.setFontSize(18);
    doc.setTextColor(40, 44, 52);
    doc.text('Internship Monthly Report', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Period: ${period}`, pageWidth / 2, 22, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(14, 25, pageWidth - 14, 25);

    let finalY = 30;

    data.forEach((intern, index) => {
        // Add new page for each intern if not the first
        if (index > 0) {
            doc.addPage();
            finalY = 20;
        }

        // -- INTERN DETAILS --
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(`Participant: ${intern.user.name}`, 14, finalY);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Unit: ${intern.user.unit} | Supervisor: ${intern.user.supervisor}`, 14, finalY + 6);
        doc.text(`Performance Insight: ${intern.insight}`, 14, finalY + 11);

        // -- SUMMARY STATS CARD --
        autoTable(doc, {
            startY: finalY + 15,
            head: [['Present', 'Late', 'Sick', 'Permit', 'Absent', 'Total Days']],
            body: [[
                intern.stats.present,
                intern.stats.late,
                intern.stats.sick,
                intern.stats.permit,
                intern.stats.absent,
                intern.stats.total_days
            ]],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            styles: { halign: 'center' }
        });

        // -- ATTENDANCE LOG --
        doc.text('Detailed Attendance Log', 14, (doc as any).lastAutoTable.finalY + 10);

        const logData = intern.attendances.map(att => {
            let activity = '-';
            if (att.activity_description) {
                try {
                    const parsed = JSON.parse(att.activity_description);
                    activity = parsed.plan || parsed.activity || att.activity_description;
                } catch (e) {
                    activity = att.activity_description;
                }
            }

            return [
                new Date(att.date).toLocaleDateString(),
                att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                att.check_out_time ? new Date(att.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                att.status.toUpperCase(),
                activity
            ];
        });

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 14,
            head: [['Date', 'In', 'Out', 'Status', 'Activity Summary']],
            body: logData,
            theme: 'striped',
            headStyles: { fillColor: [52, 73, 94] },
            styles: { fontSize: 8 },
            columnStyles: {
                4: { cellWidth: 80 } // Wider column for activity
            }
        });

        finalY = (doc as any).lastAutoTable.finalY + 20;
    });

    // Save
    doc.save(`Monthly_Report_${period.replace(/\s/g, '_')}.pdf`);
};
