'use client';

import React, { useState, useRef } from 'react';

// MATERIAL - UI
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Stack,
    Button,
    IconButton,
    Alert,
    TextField,
    Paper,
    Autocomplete,
    Chip,
    Tabs,
    Tab,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Grid
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

// ICONS
import {
    DocumentUpload,
    DocumentDownload,
    CloseCircle,
    TickCircle,
    Flash,
    Setting2,
    InfoCircle,
    Building4,
    Ticket
} from 'iconsax-react';

// THIRD PARTY
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// PROJECT IMPORTS
import { UnitWithRelations } from 'types/api';

interface BulkImportDialogProps {
    open: boolean;
    onClose: () => void;
    units: UnitWithRelations[];
    onImport: (data: any[], unitIds: string[]) => Promise<any>;
    isLoading: boolean;
}

const BulkImportDialog = ({ open, onClose, units, onImport, isLoading }: BulkImportDialogProps) => {
    const theme = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const allUnitsList = Array.isArray(units) ? units : [];
    const unitsList = allUnitsList.filter(u => (u.capacity || 0) - (u.employee_count || 0) > 0);
    const selectedUnits = allUnitsList.filter(u => selectedUnitIds.includes(u.id));
    const totalRemainingCapacity = selectedUnits.reduce((acc, unit) => acc + (Math.max(0, (unit.capacity || 0) - (unit.employee_count || 0))), 0);

    const handleDownloadTemplate = async () => {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Telkom University';

        let logoImageId: number | undefined;
        try {
            const logoResponse = await fetch('/telkom-logo.png');
            if (logoResponse.ok) {
                const logoBuffer = await (await logoResponse.blob()).arrayBuffer();
                logoImageId = workbook.addImage({ buffer: logoBuffer, extension: 'png' });
            }
        } catch (e) { }

        const wsTemplate = workbook.addWorksheet('📋 Participant Data', {
            views: [{ state: 'frozen', xSplit: 0, ySplit: 7, topLeftCell: 'A8' }],
        });

        wsTemplate.columns = [
            { key: 'no', width: 8 },
            { key: 'nama', width: 35 },
            { key: 'email', width: 35 }, // Widened for 'Personal Gmail / Email'
            { key: 'phone', width: 18 },
            { key: 'institusi', width: 25 },
            { key: 'units', width: 25 },
            { key: 'start_date', width: 18 },
            { key: 'end_date', width: 18 }
        ];

        // 1. Branding (Rows 1-3)
        [1, 2, 3].forEach(r => wsTemplate.getRow(r).height = 25);
        wsTemplate.mergeCells('A1:A3');
        if (logoImageId !== undefined) {
            wsTemplate.addImage(logoImageId, { tl: { col: 0, row: 0 }, ext: { width: 90, height: 60 }, editAs: 'oneCell' });
        }
        wsTemplate.mergeCells('B1:H1');
        wsTemplate.getCell('B1').value = 'TELKOM UNIVERSITY';
        wsTemplate.getCell('B1').font = { bold: true, size: 22, color: { argb: 'FFE31E24' }, name: 'Arial' };
        wsTemplate.mergeCells('B2:H2');
        wsTemplate.getCell('B2').value = '📍 Jl. Telekomunikasi No. 1, Terusan Buah Batu, Bandung 40257';
        wsTemplate.mergeCells('B3:H3');
        wsTemplate.getCell('B3').value = '📞 (022) 7564108 | ✉️ internship@telkomuniversity.ac.id';

        // 2. Banner
        wsTemplate.mergeCells('A4:H4');
        wsTemplate.getRow(4).height = 35;
        const bannerCell = wsTemplate.getCell('A4');
        bannerCell.value = 'INTERNSHIP PARTICIPANT DATA IMPORT TEMPLATE';
        bannerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
        bannerCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        bannerCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // 3. Info Bar
        wsTemplate.mergeCells('A5:H5');
        wsTemplate.getRow(5).height = 30;
        const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        const infoBar = wsTemplate.getCell('A5');
        infoBar.value = `🗓️ Date: ${today}  |  👥 Selected Units: ${selectedUnits.length}  |  📊 Capacity: ${totalRemainingCapacity} Slots`;
        infoBar.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECECEC' } };
        infoBar.font = { bold: true, size: 10, color: { argb: 'FF333333' } };
        infoBar.alignment = { horizontal: 'center', vertical: 'middle' };

        // 4. Instructions
        wsTemplate.mergeCells('A6:H6');
        wsTemplate.getRow(6).height = 30;
        const hintBar = wsTemplate.getCell('A6');
        hintBar.value = '⚠️ INSTRUCTIONS: Enter dates in DD/MM/YYYY format. Do not change column headers.';
        hintBar.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
        hintBar.font = { italic: true, size: 10, color: { argb: 'FF856404' } };
        hintBar.alignment = { horizontal: 'center', vertical: 'middle' };

        // 5. Header
        const headerRow = wsTemplate.getRow(7);
        headerRow.height = 35;
        headerRow.values = ['No.', 'Full Name', 'Personal Gmail / Email', 'Phone Number', 'Origin Institution', 'Units', 'Internship Start', 'Internship End'];
        headerRow.eachCell(c => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE31E24' } };
            c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
            c.alignment = { horizontal: 'center', vertical: 'middle' };
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        // 6. Data Rows
        let rowIndex = 1;
        selectedUnits.forEach(u => {
            const count = Math.max(0, (u.capacity || 0) - (u.employee_count || 0));
            for (let i = 0; i < count; i++) {
                const row = wsTemplate.addRow([rowIndex, '', '', '', '', u.name, '22/01/2026', '10/05/2026']);
                row.height = 28;
                const isEven = rowIndex % 2 === 0;
                row.eachCell({ includeEmpty: true }, (cell, col) => {
                    cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'center' : 'left', indent: col === 1 ? 0 : 1 };
                    cell.border = { top: { style: 'thin', color: { argb: 'FFAAAAAA' } }, left: { style: 'thin', color: { argb: 'FFAAAAAA' } }, bottom: { style: 'thin', color: { argb: 'FFAAAAAA' } }, right: { style: 'thin', color: { argb: 'FFAAAAAA' } } };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFF2F2F2' : 'FFFFFFFF' } };
                    cell.font = { size: 10, color: { argb: 'FF333333' } };
                    if (col === 3) cell.font.color = { argb: 'FF0000FF' };
                    if (col === 4) cell.numFmt = '@'; // Force text format for phone numbers
                    if (col === 6) cell.font.bold = true;
                });
                rowIndex++;
            }
        });
        wsTemplate.autoFilter = 'A7:H7';

        // =========================================================================================
        // SHEET 2: 📊 Info Unit (RESTORED PREMIUM STYLING)
        // =========================================================================================
        const wsUnit = workbook.addWorksheet('📊 Unit Info');
        wsUnit.columns = [
            { key: 'no', width: 8 },
            { key: 'name', width: 40 },
            { key: 'dept', width: 30 },
            { key: 'slot', width: 15 },
            { key: 'desc', width: 60 }
        ];

        // 1. Branding
        [1, 2, 3].forEach(r => wsUnit.getRow(r).height = 25);
        wsUnit.mergeCells('A1:A3');
        if (logoImageId !== undefined) {
            wsUnit.addImage(logoImageId, { tl: { col: 0, row: 0 }, ext: { width: 90, height: 60 }, editAs: 'oneCell' });
        }
        wsUnit.mergeCells('B1:E1');
        wsUnit.getCell('B1').value = 'TELKOM UNIVERSITY';
        wsUnit.getCell('B1').font = { bold: true, size: 22, color: { argb: 'FFE31E24' } };
        wsUnit.getCell('B1').alignment = { horizontal: 'center' };

        wsUnit.mergeCells('B2:E2');
        wsUnit.getCell('B2').value = '📍 Jl. Telekomunikasi No. 1, Terusan Buah Batu, Bandung 40257';
        wsUnit.getCell('B2').alignment = { horizontal: 'center' };

        wsUnit.mergeCells('B3:E3');
        wsUnit.getCell('B3').value = '📞 (022) 7564108 | ✉️ internship@telkomuniversity.ac.id';
        wsUnit.getCell('B3').alignment = { horizontal: 'center' };

        // 2. Banner
        wsUnit.mergeCells('A4:E4');
        wsUnit.getRow(4).height = 35;
        const uBanner = wsUnit.getCell('A4');
        uBanner.value = 'INTERNSHIP PLACEMENT UNIT INFORMATION';
        uBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
        uBanner.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        uBanner.alignment = { horizontal: 'center', vertical: 'middle' };

        // 3. Info Cards (Blue, Green, Orange)
        wsUnit.getRow(5).height = 40;

        wsUnit.mergeCells('A5:B5');
        const card1 = wsUnit.getCell('A5');
        card1.value = `📌 Total Units: ${selectedUnits.length}`;
        card1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3498DB' } };
        card1.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        card1.alignment = { horizontal: 'center', vertical: 'middle' };

        wsUnit.mergeCells('C5:D5');
        const card2 = wsUnit.getCell('C5');
        card2.value = `🎯 Total Capacity: ${totalRemainingCapacity} Slots`;
        card2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF27AE60' } };
        card2.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        card2.alignment = { horizontal: 'center', vertical: 'middle' };

        const card3 = wsUnit.getCell('E5');
        card3.value = `📅 ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        card3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD35400' } };
        card3.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        card3.alignment = { horizontal: 'center', vertical: 'middle' };

        // Space Row
        wsUnit.getRow(6).height = 15;

        // 4. Table Header (Red)
        const uHeader = wsUnit.getRow(7);
        uHeader.height = 35;
        uHeader.values = ['No.', 'Unit Name', 'Department', 'Remaining Slots', 'Description / Job Description'];
        uHeader.eachCell(c => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE31E24' } };
            c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            c.alignment = { horizontal: 'center', vertical: 'middle' };
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        // 5. Data Rows
        selectedUnits.forEach((u, i) => {
            const row = wsUnit.addRow([
                i + 1,
                u.name,
                u.department,
                `${(u.capacity || 0) - (u.employee_count || 0)} Slots`,
                u.description || '-'
            ]);
            row.height = 30;
            row.eachCell({ includeEmpty: true }, (cell, col) => {
                cell.alignment = { vertical: 'middle', horizontal: col <= 4 ? 'center' : 'left', indent: col === 5 ? 1 : 0 };
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                if (col === 4) cell.font = { bold: true, color: { argb: 'FFD35400' } };
            });
        });

        // 6. Footer Tip
        const footerRowIdx = wsUnit.rowCount + 1;
        wsUnit.mergeCells(`A${footerRowIdx}:E${footerRowIdx}`);
        wsUnit.getRow(footerRowIdx).height = 35;
        const tipCell = wsUnit.getCell(`A${footerRowIdx}`);
        tipCell.value = '💡 TIP: Use filters to find units by department. Green = many slots, orange = limited, red = full.';
        tipCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9F7EF' } };
        tipCell.font = { size: 10, italic: true, color: { argb: 'FF1E8449' } };
        tipCell.alignment = { horizontal: 'center', vertical: 'middle' };
        tipCell.border = { top: { style: 'thin', color: { argb: 'FF1E8449' } } };

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Template_Import_${selectedUnits.length}_Units.xlsx`);
        setActiveTab(1);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setError(null);
        try {
            const wb = new ExcelJS.Workbook();
            await wb.xlsx.load(await f.arrayBuffer());
            const ws = wb.getWorksheet('📋 Participant Data') || wb.worksheets[0];
            const data: any[] = [];

            const getCellValue = (cell: any) => {
                const val = cell.value;
                if (!val) return '';
                if (typeof val === 'object' && 'text' in val) return val.text?.toString()?.trim() || '';
                if (typeof val === 'object' && 'result' in val) return val.result?.toString()?.trim() || '';
                return val.toString().trim();
            };

            const parseDate = (val: any) => {
                if (!val) return null;
                if (val instanceof Date) return val.toISOString();
                const str = getCellValue({ value: val });
                const parts = str.split('/');
                if (parts.length === 3) {
                    const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                    return isNaN(d.getTime()) ? null : d.toISOString();
                }
                return null;
            };

            ws.eachRow((row, n) => {
                if (n <= 7) return;
                const nameText = getCellValue(row.getCell(2));
                const personalEmailText = getCellValue(row.getCell(3)); // Email Column = Personal Gmail
                if (nameText && personalEmailText) {
                    // Generate email Telkom dari nama (lowercase, replace spaces with dots)
                    const telkomEmail = nameText.toLowerCase().replace(/\s+/g, '.') + '@telkomuniversity.ac.id';

                    data.push({
                        name: nameText,
                        email: telkomEmail, // Email Telkom (auto-generated)
                        personal_email: personalEmailText, // Email personal dari Excel
                        phone: getCellValue(row.getCell(4)),
                        institution_name: getCellValue(row.getCell(5)), // Origin Institution
                        unit_id: allUnitsList.find(u => u.name === getCellValue(row.getCell(6)))?.id || null,
                        internship_start: parseDate(row.getCell(7).value),
                        internship_end: parseDate(row.getCell(8).value)
                    });
                }
            });
            if (data.length === 0) setError('Incorrect format or empty data.');
            else setPreviewData(data);
        } catch (err) {
            setError('Failed to read file.');
        }
    };

    const handleImportSubmit = async () => {
        if (!file || previewData.length === 0) {
            setError('Please upload a file first.');
            return;
        }
        try {
            await onImport(previewData, selectedUnitIds);
        } catch (err: any) {
            setError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1, bgcolor: theme.palette.primary.main, borderRadius: 2.5, color: 'white', display: 'flex' }}>
                        <DocumentUpload size={28} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 0 }}>Bulk Import System</Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Telkom University Internal Management
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>

            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider', bgcolor: '#f8f9fa', minHeight: 48 }} indicatorColor="primary" textColor="primary">
                <Tab sx={{ fontWeight: 700, py: 1.5, minHeight: 48 }} icon={<Setting2 size={16} />} iconPosition="start" label="1. SELECT DATA" />
                <Tab sx={{ fontWeight: 700, py: 1.5, minHeight: 48 }} icon={<Flash size={16} />} iconPosition="start" label="2. IMPORT" />
            </Tabs>

            <DialogContent sx={{ p: 0, minHeight: 420, bgcolor: '#fff', overflowX: 'hidden' }}>
                {activeTab === 0 ? (
                    <Box sx={{ p: 2.5 }}>
                        <Autocomplete
                            multiple
                            options={unitsList}
                            getOptionLabel={(o) => o.name}
                            value={selectedUnits}
                            onChange={(_, v) => { setSelectedUnitIds(v.map(u => u.id)); setError(null); }}
                            renderInput={(params) => <TextField {...params} variant="outlined" label="Search & Select Units" placeholder="Type unit name..." size="small" />}
                            renderTags={(v, p) => v.map((o, i) => <Chip label={o.name} {...p({ index: i })} color="primary" size="small" key={o.id} />)}
                            sx={{ mb: 2.5 }}
                        />

                        {selectedUnits.length > 0 ? (
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4.5}>
                                    <Stack spacing={2}>
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.04), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`, borderRadius: 3 }}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar sx={{ bgcolor: theme.palette.success.main, width: 40, height: 40 }}><Ticket size={20} variant="Bold" /></Avatar>
                                                <Box><Typography variant="h3" sx={{ fontWeight: 900, color: theme.palette.success.main, lineHeight: 1 }}>{totalRemainingCapacity}</Typography><Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mt: 0.5 }}>TOTAL AVAILABLE QUOTA</Typography></Box>
                                            </Stack>
                                        </Paper>
                                        <Alert severity="info" sx={{ borderRadius: 2 }} icon={<InfoCircle variant="Bold" />}>
                                            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.4 }}>Select units, download the template, and fill in the data along with the internship dates.</Typography>
                                        </Alert>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={7.5}>
                                    <Box sx={{ maxHeight: 320, overflow: 'auto', pr: 1, '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#ddd', borderRadius: 10 } }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.secondary', px: 0.5 }}>Selected Units ({selectedUnits.length}):</Typography>
                                        <Stack spacing={1.5}>
                                            {selectedUnits.map((u) => (
                                                <Card key={u.id} variant="outlined" sx={{ borderRadius: 2.5, bgcolor: '#fff' }}>
                                                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                        <Grid container spacing={1} alignItems="flex-start">
                                                            <Grid item xs={9}><Typography variant="subtitle2" sx={{ fontWeight: 900, lineHeight: 1.2 }}>{u.name}</Typography><Typography variant="caption" color="primary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>{u.department || 'General Department'}</Typography><Typography variant="caption" color="textSecondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.75rem', lineHeight: 1.3 }}>{u.description || 'No description available.'}</Typography></Grid>
                                                            <Grid item xs={3} sx={{ textAlign: 'right' }}><Chip label={`${(u.capacity || 0) - (u.employee_count || 0)} Slot`} size="small" color="primary" variant="light" sx={{ fontWeight: 800, borderRadius: 1, height: 24, fontSize: '0.7rem' }} /></Grid>
                                                        </Grid>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Grid>
                            </Grid>
                        ) : (
                            <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#fcfcfc', borderRadius: 4, border: '1px dashed #ddd' }}>
                                <Building4 size={64} color="#ddd" variant="Outline" />
                                <Typography variant="h6" color="textSecondary" sx={{ mt: 2, fontWeight: 700 }}>Please select a unit first</Typography>
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ p: 3 }}>
                        {/* Remove blocking warning, allow independent import */}
                        {!file ? (
                            <Box onClick={() => fileInputRef.current?.click()} sx={{ border: `2px dashed ${theme.palette.divider}`, borderRadius: 4, p: 6, textAlign: 'center', cursor: 'pointer', transition: '0.3s', bgcolor: '#fafafa', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: theme.palette.primary.main } }}>
                                <input type="file" hidden ref={fileInputRef} accept=".xlsx" onChange={handleFileChange} />
                                <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: '50%', display: 'inline-flex', boxShadow: 1, mb: 2 }}><DocumentUpload size={40} color={theme.palette.primary.main} /></Box>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>Click or Drag file here</Typography>
                                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>Use the filled Excel file (.xlsx)</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={2}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.02), borderColor: theme.palette.success.main, borderRadius: 3 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ bgcolor: theme.palette.success.main, width: 48, height: 48 }}><TickCircle size={28} color="white" variant="Bold" /></Avatar>
                                            <Box><Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{file.name}</Typography><Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>{previewData.length} Participant Data Found</Typography></Box>
                                        </Stack>
                                        <IconButton onClick={() => { setFile(null); setPreviewData([]); setError(null); }}><CloseCircle color={theme.palette.error.main} size={28} /></IconButton>
                                    </Stack>
                                </Paper>
                                <Paper variant="outlined" sx={{ p: 0, borderRadius: 3, overflow: 'hidden' }}>
                                    <Box sx={{ p: 1.5, bgcolor: '#f8f9fa', borderBottom: '1px solid #eee' }}><Typography variant="caption" sx={{ fontWeight: 800 }}>Participant List (Preview):</Typography></Box>
                                    <List disablePadding dense>
                                        {previewData.slice(0, 4).map((d, i) => (
                                            <React.Fragment key={i}>
                                                <ListItem><ListItemText primary={d.name} secondary={d.email} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }} secondaryTypographyProps={{ fontSize: '0.75rem' }} /><Chip label={unitsList.find(u => u.id === d.unit_id)?.name || 'N/A'} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} /></ListItem>
                                                {i < 3 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </Paper>
                            </Stack>
                        )}
                    </Box>
                )}
                {error && <Box sx={{ px: 2.5, pb: 2.5 }}><Alert severity="error" sx={{ borderRadius: 2, py: 0 }}>{error}</Alert></Box>}
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa', borderTop: '1px solid #eee' }}>
                <Button onClick={onClose} variant="text" color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
                <Box sx={{ flexGrow: 1 }} />
                {activeTab === 0 ? (
                    <Button variant="contained" color="success" startIcon={<DocumentDownload size={20} variant="Bold" />} onClick={handleDownloadTemplate} disabled={selectedUnitIds.length === 0} sx={{ fontWeight: 900, px: 3, py: 1, borderRadius: 2, boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)' }}>
                        DOWNLOAD TEMPLATE & CONTINUE
                    </Button>
                ) : (
                    <Button variant="contained" color="primary" startIcon={<Flash size={20} variant="Bold" />} onClick={handleImportSubmit} disabled={previewData.length === 0 || isLoading} sx={{ fontWeight: 900, px: 4, py: 1, borderRadius: 2 }}>
                        {isLoading ? 'PROCESSING...' : 'START IMPORT'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default BulkImportDialog;
