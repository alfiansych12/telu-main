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

interface BulkRegistrationImportDialogProps {
    open: boolean;
    onClose: () => void;
    units: UnitWithRelations[];
    formId: string;
    formTitle: string;
    onImport: (data: any[], unitIds: string[]) => Promise<any>;
    isLoading: boolean;
}

const BulkRegistrationImportDialog = ({
    open,
    onClose,
    units,
    formId,
    formTitle,
    onImport,
    isLoading
}: BulkRegistrationImportDialogProps) => {
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

        const wsTemplate = workbook.addWorksheet('📋 Registration Data', {
            views: [{ state: 'frozen', xSplit: 0, ySplit: 7, topLeftCell: 'A8' }],
        });

        wsTemplate.columns = [
            { key: 'no', width: 8 },
            { key: 'nama', width: 35 },
            { key: 'email', width: 35 },
            { key: 'phone', width: 18 },
            { key: 'institusi', width: 25 },
            { key: 'units', width: 25 },
            { key: 'transcript_external', width: 60 },
            { key: 'institusi_type', width: 20 },
            { key: 'start_date', width: 18 },
            { key: 'end_date', width: 18 }
        ];

        // 1. Branding (Rows 1-3)
        [1, 2, 3].forEach(r => wsTemplate.getRow(r).height = 25);
        wsTemplate.mergeCells('A1:A3');
        if (logoImageId !== undefined) {
            wsTemplate.addImage(logoImageId, { tl: { col: 0, row: 0 }, ext: { width: 90, height: 60 }, editAs: 'oneCell' });
        }
        wsTemplate.mergeCells('B1:J1');
        wsTemplate.getCell('B1').value = 'TELKOM UNIVERSITY';
        wsTemplate.getCell('B1').font = { bold: true, size: 22, color: { argb: 'FFE31E24' }, name: 'Arial' };
        wsTemplate.mergeCells('B2:J2');
        wsTemplate.getCell('B2').value = '📍 Jl. Telekomunikasi No. 1, Terusan Buah Batu, Bandung 40257';
        wsTemplate.mergeCells('B3:J3');
        wsTemplate.getCell('B3').value = '📞 (022) 7564108 | ✉️ internship@telkomuniversity.ac.id';

        // 2. Banner
        wsTemplate.mergeCells('A4:J4');
        wsTemplate.getRow(4).height = 35;
        const bannerCell = wsTemplate.getCell('A4');
        bannerCell.value = `BULK REGISTRATION TEMPLATE - ${formTitle.toUpperCase()}`;
        bannerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
        bannerCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        bannerCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // 3. Info Bar
        wsTemplate.mergeCells('A5:J5');
        wsTemplate.getRow(5).height = 30;
        const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        const infoBar = wsTemplate.getCell('A5');
        infoBar.value = `🗓️ Date: ${today}  |  👥 Selected Units: ${selectedUnits.length}  |  📊 Capacity: ${totalRemainingCapacity} Slots`;
        infoBar.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECECEC' } };
        infoBar.font = { bold: true, size: 10, color: { argb: 'FF333333' } };
        infoBar.alignment = { horizontal: 'center', vertical: 'middle' };

        // 4. Instructions
        wsTemplate.mergeCells('A6:J6');
        wsTemplate.getRow(6).height = 30;
        const hintBar = wsTemplate.getCell('A6');
        hintBar.value = '⚠️ INSTRUKSI: Isi data Institusi, Type, Start/End & Kriteria cukup di baris PERTAMA saja untuk grup yang sama (Auto-fill).';
        hintBar.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
        hintBar.font = { italic: true, size: 10, color: { argb: 'FF856404' } };
        hintBar.alignment = { horizontal: 'center', vertical: 'middle' };

        // 5. Header
        const headerRow = wsTemplate.getRow(7);
        headerRow.height = 35;
        headerRow.values = [
            'No.',
            'Full Name',
            'Personal Gmail / Email',
            'Phone Number',
            'Origin Institution',
            'Units',
            'Daftar Kriteria Penilaian Eksternal (Text Biasa)',
            'Institution Type',
            'Internship Start',
            'Internship End'
        ];
        headerRow.eachCell(c => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE31E24' } };
            c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
            c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        // 6. Data Rows
        let rowIndex = 1;
        selectedUnits.forEach(u => {
            const count = Math.max(0, (u.capacity || 0) - (u.employee_count || 0));
            for (let i = 0; i < count; i++) {
                const isFirstRowOverall = rowIndex === 1;
                const row = wsTemplate.addRow([
                    rowIndex,
                    '',
                    '',
                    '',
                    '',
                    u.name,
                    '',
                    isFirstRowOverall ? 'UNIVERSITAS' : '',
                    isFirstRowOverall ? '22/01/2026' : '',
                    isFirstRowOverall ? '10/05/2026' : ''
                ]);
                row.height = 28;
                const isEven = rowIndex % 2 === 0;
                row.eachCell({ includeEmpty: true }, (cell, col) => {
                    const isMetadataCol = col >= 7;
                    const isFirstRowOverall = rowIndex === 1;

                    if (!isMetadataCol || isFirstRowOverall) {
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FFAAAAAA' } },
                            left: { style: 'thin', color: { argb: 'FFAAAAAA' } },
                            bottom: { style: 'thin', color: { argb: 'FFAAAAAA' } },
                            right: { style: 'thin', color: { argb: 'FFAAAAAA' } }
                        };
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFF2F2F2' : 'FFFFFFFF' } };
                        cell.font = { size: 10, color: { argb: 'FF333333' } };

                        if (col === 3) cell.font.color = { argb: 'FF0000FF' };
                        if (col === 4) cell.numFmt = '@';
                        if (col === 6) cell.font.bold = true;

                        if (isMetadataCol && isFirstRowOverall) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF5E7' } };
                            cell.font = { size: 9, italic: true, bold: true, color: { argb: 'FF7D6608' } };
                        }
                    }

                    if (col === 8 && isFirstRowOverall) {
                        cell.dataValidation = {
                            type: 'list',
                            allowBlank: true,
                            formulae: ['"UNIVERSITAS,SMK,SMA,LAINNYA"']
                        };
                    }
                });
                rowIndex++;
            }
        });
        wsTemplate.autoFilter = 'A7:J7';

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Registration_Template_${formTitle.replace(/\s+/g, '_')}.xlsx`);
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
            const ws = wb.getWorksheet('📋 Registration Data') || wb.worksheets[0];
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

            const parseTranscriptExternal = (val: any): string[] | null => {
                const str = getCellValue({ value: val });
                if (!str) return null;

                const lines = str.split('\n')
                    .map((line: string) => line.trim())
                    .filter((line: string) => line.length > 0);

                if (lines.length > 0) {
                    return lines;
                }

                try {
                    const parsed = JSON.parse(str);
                    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
                        return parsed;
                    }
                    return null;
                } catch (e) {
                    return null;
                }
            };

            let lastInstitutionName = '';
            let lastInstitutionType = '';
            let lastTranscriptExternal: string[] | null = null;
            let lastStartDate: string | null = null;
            let lastEndDate: string | null = null;

            ws.eachRow((row, n) => {
                if (n <= 7) return;
                const nameText = getCellValue(row.getCell(2));
                const personalEmailText = getCellValue(row.getCell(3));

                if (nameText && personalEmailText) {
                    // Prioritize the email from the Excel file (Personal Email column)
                    const emailToUse = personalEmailText;

                    const currentInstName = getCellValue(row.getCell(5));
                    const currentInstType = getCellValue(row.getCell(8));
                    const currentTranscript = parseTranscriptExternal(row.getCell(7).value);
                    const currentStartDate = parseDate(row.getCell(9).value);
                    const currentEndDate = parseDate(row.getCell(10).value);

                    if (currentInstName) lastInstitutionName = currentInstName;
                    if (currentInstType) lastInstitutionType = currentInstType;
                    if (currentTranscript) lastTranscriptExternal = currentTranscript;
                    if (currentStartDate) lastStartDate = currentStartDate;
                    if (currentEndDate) lastEndDate = currentEndDate;

                    const participantData = {
                        name: nameText,
                        email: emailToUse,
                        personal_email: personalEmailText,
                        phone: getCellValue(row.getCell(4)),
                        institution_name: lastInstitutionName || null,
                        institution_type: lastInstitutionType || null,
                        unit_id: allUnitsList.find(u => u.name.trim().toLowerCase() === getCellValue(row.getCell(6)).toLowerCase())?.id || null,
                        internship_start: lastStartDate,
                        internship_end: lastEndDate,
                        transcript_external: lastTranscriptExternal,
                        form_id: formId
                    };

                    data.push(participantData);
                }
            });
            if (data.length === 0) setError('Incorrect format or empty data.');
            else {
                setPreviewData(data);
            }
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
            // Reset state on success
            setFile(null);
            setPreviewData([]);
            setActiveTab(0);
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
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 0 }}>Bulk Registration Import</Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {formTitle}
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>

            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider', bgcolor: '#f8f9fa', minHeight: 48 }} indicatorColor="primary" textColor="primary">
                <Tab sx={{ fontWeight: 700, py: 1.5, minHeight: 48 }} icon={<Setting2 size={16} />} iconPosition="start" label="1. SELECT UNITS" />
                <Tab sx={{ fontWeight: 700, py: 1.5, minHeight: 48 }} icon={<Flash size={16} />} iconPosition="start" label="2. UPLOAD DATA" />
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
                                            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.4 }}>
                                                Select units and download template. For <b>External Criteria</b>, use <b>Alt+Enter</b> in Excel to add multiple items line by line.
                                            </Typography>
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
                                            <Box><Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{file.name}</Typography><Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>{previewData.length} Registration Data Found</Typography></Box>
                                        </Stack>
                                        <IconButton onClick={() => { setFile(null); setPreviewData([]); setError(null); }}><CloseCircle color={theme.palette.error.main} size={28} /></IconButton>
                                    </Stack>
                                </Paper>
                                <Paper variant="outlined" sx={{ p: 0, borderRadius: 3, overflow: 'hidden' }}>
                                    <Box sx={{ p: 1.5, bgcolor: '#f8f9fa', borderBottom: '1px solid #eee' }}><Typography variant="caption" sx={{ fontWeight: 800 }}>Registration List (Preview):</Typography></Box>
                                    <List disablePadding dense>
                                        {previewData.slice(0, 4).map((d, i) => (
                                            <React.Fragment key={i}>
                                                <ListItem><ListItemText primary={d.name} secondary={d.personal_email} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }} secondaryTypographyProps={{ fontSize: '0.75rem' }} /><Chip label={unitsList.find(u => u.id === d.unit_id)?.name || 'N/A'} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} /></ListItem>
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
                        {isLoading ? 'PROCESSING...' : 'SUBMIT REGISTRATIONS'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default BulkRegistrationImportDialog;
