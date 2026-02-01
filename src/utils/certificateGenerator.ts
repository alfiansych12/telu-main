
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

interface CertificateData {
    certNo: string;
    uniqueId: string;
    name: string;
    unit: string;
    department?: string;
    period: string;
    score: number;
    grade?: string;
    evaluator: string;
    issueDate: string;
    hrOfficerName?: string;
    hrOfficerPosition?: string;
    city?: string;
}

// Helper: Load Image
const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => {
            console.warn(`Failed to load image: ${url}`);
            // Return a blank transparent 1x1 pixel as fallback
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            resolve(canvas as any);
        };
    });
};

export const generateCertificatePDF = async (data: CertificateData) => {
    // 1. Setup Document - Landscape A4
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    }) as any;

    const width = doc.internal.pageSize.getWidth(); // 297mm
    const height = doc.internal.pageSize.getHeight(); // 210mm
    const centerX = width / 2;

    // --- BRAND COLORS ---
    const RED_TELKOM = '#BE1E2D';
    const BLACK_TELKOM = '#231F20';
    const GREY_TEXT = '#58595B';
    const GOLD_ACCENT = '#C5A059';

    // --- 0. BACKGROUND ---
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, width, height, 'F');

    // --- 1. CORNER TRIANGLES (Photo Style) ---
    doc.setFillColor(RED_TELKOM);
    // Top Left Large Triangle (exactly from the edge)
    doc.triangle(0, 0, 42, 0, 0, 42, 'F');
    // Bottom Right Large Triangle
    doc.triangle(width, height, width - 42, height, width, height - 42, 'F');

    // --- 2. BORDERS ---
    const margin = 12;
    // Outer Gold Border
    doc.setDrawColor(GOLD_ACCENT);
    doc.setLineWidth(1.1);
    doc.rect(margin, margin, width - (margin * 2), height - (margin * 2));

    // Inner Red Border
    doc.setDrawColor(RED_TELKOM);
    doc.setLineWidth(0.4);
    doc.rect(margin + 2.5, margin + 2.5, width - (margin * 2) - 5, height - (margin * 2) - 5);

    // --- 3. LOGO (Top Center) ---
    let cursorY = 22;
    try {
        const logoUrl = '/telkom-logo.png';
        const img = await loadImage(logoUrl);
        const imgWidth = 28;
        const imgHeight = (img.height / img.width) * imgWidth;
        doc.addImage(img, 'PNG', (width - imgWidth) / 2, cursorY, imgWidth, imgHeight);
        cursorY += imgHeight + 8;
    } catch (e) {
        cursorY += 15;
    }

    // --- 4. TITLES ---
    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.setTextColor(BLACK_TELKOM);
    doc.text("SERTIFIKAT APRESIASI", centerX, cursorY, { align: 'center' });

    cursorY += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(GOLD_ACCENT);
    doc.text("CERTIFICATE OF APPRECIATION", centerX, cursorY, { align: 'center' });

    // Certificate Number
    cursorY += 9;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(GREY_TEXT);
    const certNoText = data.certNo || `No: ${data.uniqueId}/INTERN-PUTI/Tel-U/2026`;
    doc.text(certNoText, centerX, cursorY, { align: 'center' });

    // --- 5. RECIPIENT ---
    cursorY += 14;
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.setTextColor(GREY_TEXT);
    doc.text("Diberikan kepada / This certificate is presented to:", centerX, cursorY, { align: 'center' });

    cursorY += 12;
    // NAME: Large, Red, Bold
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.setTextColor(RED_TELKOM);
    const formattedName = data.name.toUpperCase();
    doc.text(formattedName, centerX, cursorY, { align: 'center' });

    // Thick Red Underline
    doc.setDrawColor(RED_TELKOM);
    doc.setLineWidth(1);
    const nameWidth = doc.getTextWidth(formattedName);
    doc.line(centerX - (nameWidth / 2) - 8, cursorY + 2, centerX + (nameWidth / 2) + 8, cursorY + 2);

    // --- 6. BODY TEXT ---
    cursorY += 16;
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(BLACK_TELKOM);
    doc.text("Atas partisipasi dan dedikasinya dalam Program Magang Universitas Telkom (PUTI) sebagai:", centerX, cursorY, { align: 'center' });

    cursorY += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PESERTA MAGANG (INTERNSHIP)", centerX, cursorY, { align: 'center' });

    cursorY += 7;
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text(`di Unit ${data.unit}`, centerX, cursorY, { align: 'center' });

    cursorY += 6;
    doc.text(`Periode: ${data.period}`, centerX, cursorY, { align: 'center' });

    if (data.score) {
        cursorY += 6;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`Final Assessment Score: ${data.score}/100`, centerX, cursorY, { align: 'center' });
    }

    // --- 7. SIGNATURES ---
    const sigY = height - 55;
    const lX = 72;
    const rX = width - 72;

    // Left: Supervisor
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(BLACK_TELKOM);
    doc.text("Mengetahui,", lX, sigY, { align: 'center' });
    doc.text("Supervisor Unit,", lX, sigY + 5, { align: 'center' });

    const snY = sigY + 28;
    doc.setFont("helvetica", "bold");
    doc.text(data.evaluator || "D.r S. Agaian", lX, snY, { align: 'center' });
    doc.setLineWidth(0.3);
    doc.line(lX - 25, snY + 1, lX + 25, snY + 1);
    doc.setFont("times", "normal");
    doc.text("NIP/NIK Supervisor", lX, snY + 6, { align: 'center' });

    // Right: HR
    doc.setFont("times", "normal");
    const city = data.city || "Bandung";
    doc.text(`${city}, ${data.issueDate}`, rX, sigY - 5, { align: 'center' });
    doc.text("Menyetujui,", rX, sigY, { align: 'center' });
    const position = data.hrOfficerPosition || "Kepala Bagian Pengembangan SDM";
    doc.text(position, rX, sigY + 5, { align: 'center' });

    doc.setFont("helvetica", "bold");
    const officerName = data.hrOfficerName || "[Nama Pejabat SDM]";
    doc.text(officerName, rX, snY, { align: 'center' });
    doc.line(rX - 25, snY + 1, rX + 25, snY + 1);
    doc.setFont("times", "normal");
    doc.text("Universitas Telkom", rX, snY + 6, { align: 'center' });

    // Signature section ends here. QR Code removed based on request.

    // --- 9. SAVE ---
    try {
        const cleanN = (data.name || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
        const fname = `Sertifikat_${cleanN}.pdf`;
        const blob = doc.output('blob');
        saveAs(blob, fname);
    } catch (e) {
        doc.save(`Sertifikat_${data.uniqueId || 'PUTI'}.pdf`);
    }
};
