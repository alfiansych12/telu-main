const ExcelJS = require('exceljs');
const path = require('path');

async function inspectExcel() {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, '../docs/UAT_Puti_System_Premium.xlsx');

    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1); // Assume first sheet

        console.log('Sheet Name:', worksheet.name);

        // Inspect Rows 1-10 to understand header structure
        for (let i = 1; i <= 10; i++) {
            const row = worksheet.getRow(i);
            const values = row.values;
            if (values && values.length > 0) {
                console.log(`Row ${i}:`, JSON.stringify(values.slice(1))); // Slice to remove empty 0-index
            }
        }

        // Check merge cells
        // console.log('Merges:', worksheet.model.merges);

    } catch (err) {
        console.error('Error reading file:', err);
    }
}

inspectExcel();
