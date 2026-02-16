import { jsPDF } from 'jspdf';

interface CertificateData {
    certNo: string;
    uniqueId: string;
    name: string;
    unit: string;
    department?: string;
    period: string;
    score: number;
    grade?: string;
    softSkill?: number;
    hardSkill?: number;
    attitude?: number;
    remarks?: string | null;
    evaluator: string;
    issueDate: string;
    hrOfficerName?: string;
    hrOfficerPosition?: string;
    city?: string;
    criteria?: {
        internal: Array<{ label: string }>;
        external: Array<{ label: string }>;
    };
    category?: string;
    evaluatorIdNumber?: string;
    hrInstitutionName?: string;
    scores?: any;
    internalData?: {
        scores: any;
        criteria: any;
        avgScore: number;
        grade: string;
        evaluator: string;
    };
    externalData?: {
        scores: any;
        criteria: any;
        avgScore: number;
        grade: string;
        evaluator: string;
    };
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
        format: 'a4',
        compress: true
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
    const certNoText = data.certNo || `No: ${data.uniqueId || 'UNKNOWN'}/INTERN-PUTI/Tel-U/2026`;
    doc.text(certNoText, centerX, cursorY, { align: 'center' });

    // --- 5. RECIPIENT ---
    cursorY += 14;
    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.setTextColor(GREY_TEXT);
    doc.text("Diberikan kepada (Awarded to):", centerX, cursorY, { align: 'center' });

    cursorY += 12;
    // NAME: Large, Red, Bold
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.setTextColor(RED_TELKOM);
    const formattedName = (data.name || 'Participant').toUpperCase();
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
    doc.text(`Atas partisipasi dan dedikasinya dalam Program Magang ${data.hrInstitutionName || 'Universitas Telkom'} (PUTI) sebagai:`, centerX, cursorY, { align: 'center' });

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
    doc.text(data.evaluatorIdNumber || "NIP/NIK Supervisor", lX, snY + 6, { align: 'center' });

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
    doc.text(data.hrInstitutionName || "Universitas Telkom", rX, snY + 6, { align: 'center' });

    // Signature section ends here. QR Code removed based on request.

    // =========================================================================
    // --- SECOND PAGE: INTERNAL TRANSCRIPT (With Template) ---
    // =========================================================================
    doc.addPage('a4', 'landscape');

    // --- 0. BACKGROUND ---
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, width, height, 'F');

    // --- 1. CORNER TRIANGLES (Match Page 1) ---
    doc.setFillColor(RED_TELKOM);
    doc.triangle(0, 0, 42, 0, 0, 42, 'F');
    doc.triangle(width, height, width - 42, height, width, height - 42, 'F');

    // --- 2. BORDERS (Match Page 1) ---
    doc.setDrawColor(GOLD_ACCENT);
    doc.setLineWidth(1.1);
    doc.rect(margin, margin, width - (margin * 2), height - (margin * 2));
    doc.setDrawColor(RED_TELKOM);
    doc.setLineWidth(0.4);
    doc.rect(margin + 2.5, margin + 2.5, width - (margin * 2) - 5, height - (margin * 2) - 5);

    // --- 3. TITLE ONLY (No Logo) ---
    let ty = 35; // Start lower since logo is gone

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22); // Increased size
    doc.setTextColor(BLACK_TELKOM);
    doc.text("TRANSKRIP PENILAIAN MAGANG (INTERNAL)", centerX, ty, { align: 'center' });

    ty += 8;
    doc.setFontSize(10);
    doc.setTextColor(GOLD_ACCENT);
    doc.text("INTERNSHIP ASSESSMENT TRANSCRIPT", centerX, ty, { align: 'center' });

    // Personal Info Section REMOVED as per request

    // --- 4. TABLE IMPROVED (INTERNAL ONLY) ---
    ty += 20; // Spacing after title
    const tableW = width - (margin * 6); // Narrower since only one category
    const startX = (width - tableW) / 2;
    const headerHeight = 12;

    // Header Background
    doc.setFillColor(RED_TELKOM); // Use brand red for header background
    doc.rect(startX, ty, tableW, headerHeight, 'F');

    // Header Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255); // White text

    const col1 = startX + 2;                   // No
    const col2 = startX + 12;                  // Internal Label
    // Adjust column widths for single table
    const col2Width = tableW - 40; // Label takes up most space
    const col3 = startX + tableW - 35;         // Value
    const col4 = startX + tableW - 15;         // Grade

    doc.text("No", col1, ty + 8);
    doc.text("Aspek Penilaian (INTERNAL)", col2, ty + 8);
    doc.text("Nilai", col3, ty + 8);
    doc.text("Grade", col4, ty + 8);

    // Data preparation
    const sanitizeLabel = (label: any, fallback: string) => {
        if (!label || typeof label !== 'string' || !isNaN(Number(label))) return fallback;
        return label;
    };

    const getScoreFromData = (scores: any, key: string, index: number): string => {
        if (!scores) return '0';
        const val = scores[key];
        if (val !== undefined && val !== null) return String(val);
        const standardKeys = ['soft_skill', 'hard_skill', 'attitude'];
        const sVal = scores[standardKeys[index]];
        if (sVal !== undefined && sVal !== null) return String(sVal);
        return '0';
    };

    const getCriteriaArray = (criteria: any) => {
        if (Array.isArray(criteria)) return criteria;
        if (criteria && typeof criteria === 'object') return Object.values(criteria);
        return [];
    };

    const extCriteria = getCriteriaArray(data.externalData?.criteria);
    const splitExtItems = extCriteria.map((c: any, i: number) => ({
        label: sanitizeLabel(c.label, `Indicator ${i + 1}`),
        score: getScoreFromData(data.externalData?.scores, c.key, i)
    }));
    const extItems = splitExtItems.length > 0 ? splitExtItems : [];

    const intCriteria = getCriteriaArray(data.internalData?.criteria);
    const splitIntItems = intCriteria.map((c: any, i: number) => ({
        label: sanitizeLabel(c.label, `Indicator ${i + 1}`),
        score: getScoreFromData(data.internalData?.scores, c.key, i)
    }));
    const intItems = splitIntItems.length > 0 ? splitIntItems : [];

    const getDispGrade = (s: any) => {
        const n = parseFloat(s);
        if (isNaN(n)) return '-';
        if (n >= 85) return 'A';
        if (n >= 75) return 'B';
        if (n >= 60) return 'C';
        return 'D';
    };

    ty += headerHeight;
    const rowHeight = 12; // Taller rows

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(BLACK_TELKOM);

    // --- INTERNAL TABLE ROWS ---
    const maxRowsInt = Math.max(intItems.length, 3);
    for (let i = 0; i < maxRowsInt; i++) {
        // Alternating row color
        if (i % 2 === 0) {
            doc.setFillColor(252, 252, 252);
            doc.rect(startX, ty, tableW, rowHeight, 'F');
        }

        // Borders
        doc.setDrawColor(220, 220, 220); // Light grey borders
        doc.rect(startX, ty, tableW, rowHeight);

        // No
        doc.text((i + 1).toString(), col1, ty + 8);

        // Internal Item
        if (intItems[i]) {
            doc.text(intItems[i].label, col2, ty + 8, { maxWidth: col2Width });
            const s = intItems[i].score;
            doc.text(String(s), col3 + 10, ty + 8, { align: 'right' });
            doc.text(getDispGrade(s), col4 + 5, ty + 8, { align: 'center' });
        } else if (i < 3 && !data.internalData) {
            // Placeholder for empty internal
            const placeholder = ["Soft Skill", "Hard Skill", "Attitude"][i];
            doc.text(placeholder, col2, ty + 8);
            doc.text("0", col3 + 10, ty + 8, { align: 'right' });
            doc.text("D", col4 + 5, ty + 8, { align: 'center' });
        }
        ty += rowHeight;
    }

    // Internal Summary Row
    ty += 2; // margin
    doc.setFillColor(245, 245, 245);
    doc.rect(startX, ty, tableW, 14, 'F');
    doc.setDrawColor(GOLD_ACCENT);
    doc.rect(startX, ty, tableW, 14);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(BLACK_TELKOM);
    doc.text("RATA-RATA INTERNAL (AVERAGE)", startX + 5, ty + 9);

    // Internal Avg
    const intAvgVal = parseFloat(data.internalData?.avgScore as any) || 0;
    const intGrade = data.internalData?.grade || getDispGrade(intAvgVal);
    doc.text(intAvgVal.toString(), col3 + 10, ty + 9, { align: 'right' });
    doc.text(intGrade, col4 + 5, ty + 9, { align: 'center' });


    // =========================================================================
    // --- THIRD PAGE: EXTERNAL TRANSCRIPT (Portrait, Raport Style) ---
    // =========================================================================
    doc.addPage('a4', 'portrait');
    const pWidth = 210; // Portrait A4 width
    const pHeight = 297; // Portrait A4 height
    const pCenterX = pWidth / 2;
    const pMargin = 20;

    // --- 0. BACKGROUND: PLAIN (White) ---
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pWidth, pHeight, 'F');
    // NO TRIANGLES, NO BORDERS (Polosan).

    // --- 1. LOGO (Top Right) ---
    try {
        const logoUrl = '/telkom-logo.png';
        const img = await loadImage(logoUrl);
        const imgWidth = 25;
        const imgHeight = (img.height / img.width) * imgWidth;
        doc.addImage(img, 'PNG', pWidth - imgWidth - pMargin, pMargin, imgWidth, imgHeight);
    } catch (e) {
        // Ignore logo error
    }

    // --- 2. HEADER ---
    let yP = pMargin + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(BLACK_TELKOM);
    doc.text("TRANSKRIP NILAI MAGANG (EKSTERNAL)", pCenterX, yP, { align: 'center' });

    yP += 7;
    doc.setFontSize(14);
    doc.text(data.hrInstitutionName?.toUpperCase() || "UNIVERSITAS TELKOM", pCenterX, yP, { align: 'center' });

    yP += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(GREY_TEXT);
    const periodYear = data.period.split(' ').pop() || '2026';
    doc.text(`TAHUN PERIODE ${periodYear}`, pCenterX, yP, { align: 'center' });

    // --- 3. STUDENT INFO BLOCK ---
    yP += 15;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(BLACK_TELKOM);

    const infoL = pMargin + 5;
    const infoColon = infoL + 45;
    const infoVal = infoColon + 3;

    const infoRows = [
        { label: "Nama Peserta", value: data.name.toUpperCase() },
        { label: "Nomor Sertifikat / ID", value: data.uniqueId || data.certNo || '-' },
        { label: "Unit Penempatan", value: data.unit },
        { label: "Periode Magang", value: data.period }
    ];

    infoRows.forEach(row => {
        doc.setFont("helvetica", "bold");
        doc.text(row.label, infoL, yP);
        doc.text(":", infoColon, yP);
        doc.setFont("helvetica", "normal");
        doc.text(row.value, infoVal, yP);
        yP += 6;
    });

    // --- 4. TABLE (Raport Style) ---
    yP += 8;
    const tW = pWidth - (pMargin * 2);
    const tX = pMargin;
    const tH = 10;

    // Header
    doc.setFillColor(240, 240, 240); // Light grey header
    doc.rect(tX, yP, tW, tH, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(tX, yP, tW, tH);

    doc.setFont("helvetica", "bold");
    doc.text("No.", tX + 2, yP + 6.5);
    doc.text("Aspek Penilaian (Kompetensi)", tX + 12, yP + 6.5);
    doc.text("Nilai", tX + tW - 25, yP + 6.5);
    doc.text("Grade", tX + tW - 10, yP + 6.5);

    yP += tH;

    // Data Rows
    doc.setFont("helvetica", "normal");
    const displayItems = extItems.length > 0 ? extItems : [
        { label: "Kualitas Pekerjaan (Work Quality)", score: "0" },
        { label: "Profesionalisme (Professionalism)", score: "0" },
        { label: "Integritas (Integrity)", score: "0" }
    ];

    displayItems.forEach((item, i) => {
        doc.rect(tX, yP, tW, tH);
        doc.text((i + 1).toString(), tX + 2, yP + 6.5);
        doc.text(item.label, tX + 12, yP + 6.5, { maxWidth: tW - 45 });
        doc.text(String(item.score), tX + tW - 20, yP + 6.5, { align: 'right' });
        doc.text(getDispGrade(item.score), tX + tW - 5, yP + 6.5, { align: 'right' });
        yP += tH;
    });

    // Summary Row
    doc.setFillColor(250, 250, 250);
    doc.rect(tX, yP, tW, tH, 'F');
    doc.rect(tX, yP, tW, tH);
    doc.setFont("helvetica", "bold");
    doc.text("NILAI RATA-RATA EKSTERNAL (AVERAGE)", tX + 12, yP + 6.5);

    const eAvg = parseFloat(data.externalData?.avgScore as any) || 0;
    doc.text(eAvg.toString(), tX + tW - 20, yP + 6.5, { align: 'right' });
    doc.text(getDispGrade(eAvg), tX + tW - 5, yP + 6.5, { align: 'right' });

    yP += tH + 15;

    // Total Combined Score Footer
    const count = (eAvg > 0 && intAvgVal > 0) ? 2 : 1;
    const totalAvg = Math.round((Number(eAvg) + Number(intAvgVal)) / count);
    doc.setFontSize(12);
    doc.setTextColor(RED_TELKOM);
    doc.text(`TOTAL COMBINED SCORE: ${totalAvg} / 100`, pCenterX, yP, { align: 'center' });

    // Signatures blocked deleted as per request

    // --- 9. SAVE ---
    try {
        const cleanN = (data.name || 'Participant').replace(/[^a-zA-Z0-9]/g, '_');
        const fname = `Sertifikat_${cleanN}.pdf`;
        doc.save(fname);
    } catch (e: any) {
        console.error("PDF Save failed:", e);
        throw new Error(`Critical failure saving PDF: ${e.message}`);
    }
};
