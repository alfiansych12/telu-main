const ExcelJS = require('exceljs');
const path = require('path');

async function generateUAT() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('UAT V2 - Registration System');

    // --- SETUP STYLES ---
    const headerStyle = {
        font: { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F75B5' } }, // Blue Header
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    };

    const subHeaderStyle = {
        font: { name: 'Arial', size: 10, bold: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }, // Light Blue
        alignment: { vertical: 'middle' },
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    };

    const cellStyle = {
        font: { name: 'Arial', size: 10 },
        alignment: { vertical: 'top', wrapText: true },
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    };

    // --- 1. TITLE & INFO ---
    worksheet.mergeCells('A1:H1');
    const title = worksheet.getCell('A1');
    title.value = 'USER ACCEPTANCE TEST (UAT) - PUTI INTERNSHIP V2.0';
    title.font = { name: 'Arial', size: 16, bold: true };
    title.alignment = { horizontal: 'center', vertical: 'middle' };

    // Info Project
    const infoData = [
        { label: 'Project Name:', value: 'Puti Internship Management System (Premium Edition)' },
        { label: 'Document Version:', value: '2.0 (Digital Registration Update)' },
        { label: 'Date:', value: '12 Februari 2026' },
        { label: 'Tester:', value: 'QA Team' },
        { label: 'Environment:', value: 'Production (http://localhost:3001)' }
    ];

    let currentRow = 3;
    infoData.forEach(info => {
        worksheet.getCell(`A${currentRow}`).value = info.label;
        worksheet.getCell(`A${currentRow}`).font = { bold: true };
        worksheet.mergeCells(`B${currentRow}:D${currentRow}`);
        worksheet.getCell(`B${currentRow}`).value = info.value;
        currentRow++;
    });

    // --- 2. TABLE HEADER (Row 9 or 10) ---
    const tableHeaderRowIndex = 9;
    const columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Modul / Menu', key: 'modul', width: 25 },
        { header: 'Test Case', key: 'testcase', width: 30 },
        { header: 'Langkah Testing', key: 'steps', width: 45 },
        { header: 'Expected Result', key: 'expected', width: 40 },
        { header: 'Actual Result', key: 'actual', width: 25 },
        { header: 'Screenshot', key: 'screenshot', width: 20 },
        { header: 'Catatan', key: 'notes', width: 20 }
    ];

    const headerRow = worksheet.getRow(tableHeaderRowIndex);
    headerRow.values = columns.map(c => c.header);

    // Apply Header Style
    headerRow.eachCell((cell) => {
        cell.style = headerStyle;
    });

    // Set Column Widths
    worksheet.columns = columns.map(c => ({ key: c.key, width: c.width }));

    // --- 3. DATA CONTENT ---
    const testCases = [
        // PHASE 13: FORM BUILDER
        { isHeader: true, title: 'PHASE 13: FORM BUILDER & MANAGEMENT (ADMIN)' },
        { no: 1, modul: 'Registration Form', testcase: 'Create New Form', steps: '1. Login Admin > Management Data > Registration\n2. Create New Form\n3. Isi Judul, Deskripsi, Field\n4. Save', expected: 'Form berhasil dibuat, status Active.', actual: 'Done', status: 'PASS' },
        { no: 2, modul: 'Registration Form', testcase: 'Dynamic Slug', steps: '1. Input Judul Form\n2. Cek field Slug', expected: 'Slug otomatis terisi (auto-generate).', actual: 'Done', status: 'PASS' },
        { no: 3, modul: 'Registration Form', testcase: 'Edit Form', steps: '1. Edit form yang ada\n2. Tambah field baru\n3. Save', expected: 'Perubahan tersimpan.', actual: 'Done', status: 'PASS' },

        // PHASE 14: PUBLIC PORTAL
        { isHeader: true, title: 'PHASE 14: PUBLIC PORTAL (NO LOGIN)' },
        { no: 4, modul: 'Public Portal', testcase: 'Access List', steps: '1. Buka /registration tanpa login', expected: 'Tampil daftar lowongan aktif.', actual: 'Done', status: 'PASS' },
        { no: 5, modul: 'Public Portal', testcase: 'View Detail', steps: '1. Klik salah satu lowongan', expected: 'Masuk ke form detail.', actual: 'Done', status: 'PASS' },
        { no: 6, modul: 'Submission', testcase: 'Submit Form', steps: '1. Isi form lengkap\n2. Submit', expected: 'Submit sukses, muncul Success Page.', actual: 'Done', status: 'PASS' },

        // PHASE 15: APPLICANT TRACKING
        { isHeader: true, title: 'PHASE 15: APPLICANT TRACKING (ADMIN)' },
        { no: 7, modul: 'Applications', testcase: 'List Applicants', steps: '1. Buka menu Applications\n2. Cek tabel', expected: 'Data pelamar masuk (Real-time).', actual: 'Done', status: 'PASS' },
        { no: 8, modul: 'Applications', testcase: 'Review & Approve', steps: '1. View detail pelamar\n2. Klik Approve/Reject', expected: 'Status aplikasi berubah.', actual: 'Done', status: 'PASS' },

        // PHASE 16: SYSTEM INTEGRITY
        { isHeader: true, title: 'PHASE 16: SYSTEM INTEGRITY' },
        { no: 9, modul: 'Database', testcase: 'Data Sync', steps: '1. Cek tabel registration_forms & submissions', expected: 'Data tersimpan di DB dengan benar.', actual: 'Done', status: 'PASS' }
    ];

    let rowIdx = tableHeaderRowIndex + 1;

    testCases.forEach(item => {
        const row = worksheet.getRow(rowIdx);

        if (item.isHeader) {
            // Section Header
            worksheet.mergeCells(`A${rowIdx}:H${rowIdx}`);
            const cell = worksheet.getCell(`A${rowIdx}`);
            cell.value = item.title;
            cell.style = subHeaderStyle; // Light Blue bg
        } else {
            // Data Row
            // 8 Columns: No, Modul, TestCase, Steps, Expected, Actual, Screenshot, Notes
            row.values = [item.no, item.modul, item.testcase, item.steps, item.expected, item.actual, '', ''];

            // Apply Cell Style
            row.eachCell((cell, colNumber) => {
                cell.style = cellStyle;
                if (colNumber === 1 || colNumber === 6) { // No & Actual Center
                    cell.alignment = { ...cellStyle.alignment, horizontal: 'center' };
                }
            });
        }
        rowIdx++;
    });

    // --- 4. SIGNATURE SECTION ---
    rowIdx += 2;
    const signRow = worksheet.getRow(rowIdx);
    signRow.values = ['Disetujui Oleh:', '', '', 'Diketahui Oleh:'];
    signRow.font = { bold: true };

    rowIdx += 4;
    const nameRow = worksheet.getRow(rowIdx);
    nameRow.values = ['( _________________ )', '', '', '( _________________ )'];

    rowIdx++;
    const roleRow = worksheet.getRow(rowIdx);
    roleRow.values = ['Project Manager', '', '', 'QA Lead'];
    roleRow.font = { italic: true };


    // Save File
    const outputPath = path.join(__dirname, '../docs/UAT_Puti_System_Premium_V2_Final.xlsx');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Excel generated: ${outputPath}`);
}

generateUAT().catch(err => console.error(err));
