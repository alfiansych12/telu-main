
'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Typography,
    Box,
    Paper,
    CircularProgress,
    Stack,
    IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTheme, alpha } from '@mui/material/styles';
import { CloseCircle, DocumentDownload, MagicStar } from 'iconsax-react';
import { getMonthlyReportData } from 'utils/api/reports'; // Server Action
import { generateMonthlyReportPDF } from 'utils/pdfGenerator'; // Client Util

interface ReportDialogProps {
    open: boolean;
    onClose: () => void;
    supervisorId: string;
}

const ReportGenerationDialog: React.FC<ReportDialogProps> = ({ open, onClose, supervisorId }) => {
    const theme = useTheme();
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState<any[] | null>(null);

    const handleGeneratePreview = async () => {
        if (!selectedDate) return;
        setLoading(true);
        try {
            const data = await getMonthlyReportData({
                month: selectedDate.getMonth() + 1,
                year: selectedDate.getFullYear(),
                supervisorId
            });
            setPreviewData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!previewData || !selectedDate) return;
        const period = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        generateMonthlyReportPDF(previewData, period);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, display: 'flex' }}>
                        <DocumentDownload variant="Bold" color={theme.palette.primary.main} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Monthly Report Generator</Typography>
                        <Typography variant="caption" color="textSecondary">Export attendance & performance insights</Typography>
                    </Box>
                </Stack>
                <IconButton onClick={onClose} size="small">
                    <CloseCircle />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3}>
                    {/* Control Panel */}
                    <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.grey[50] }}>
                            <Stack spacing={3}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>1. Select Period</Typography>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        views={['year', 'month']}
                                        label="Month & Year"
                                        value={selectedDate}
                                        onChange={setSelectedDate}
                                        slotProps={{ textField: { fullWidth: true, size: 'small', sx: { bgcolor: 'white' } } }}
                                    />
                                </LocalizationProvider>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleGeneratePreview}
                                    disabled={loading || !selectedDate}
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MagicStar variant="Bold" />}
                                >
                                    {loading ? 'Analyzing...' : 'Analyze Data'}
                                </Button>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Preview Panel */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>2. Report Preview</Typography>

                        {!previewData && !loading && (
                            <Box sx={{
                                height: 200,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `2px dashed ${theme.palette.divider}`,
                                borderRadius: 2,
                                color: theme.palette.text.secondary
                            }}>
                                <Typography variant="body2">Select a period and click "Analyze Data"</Typography>
                            </Box>
                        )}

                        {loading && (
                            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CircularProgress />
                            </Box>
                        )}

                        {previewData && (
                            <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
                                <Stack spacing={2}>
                                    {previewData.map((item, idx) => (
                                        <Paper key={idx} elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{item.user.name}</Typography>
                                                    <Typography variant="caption" color="textSecondary">{item.user.unit}</Typography>
                                                </Box>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        bgcolor: item.insight.includes('Excellent') ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                                                        color: item.insight.includes('Excellent') ? theme.palette.success.main : theme.palette.error.main,
                                                        px: 1, py: 0.5, borderRadius: 1, fontWeight: 600
                                                    }}
                                                >
                                                    {item.insight}
                                                </Typography>
                                            </Stack>

                                            <Grid container spacing={1} sx={{ mt: 1 }}>
                                                <Grid item xs={3}>
                                                    <Box sx={{ textAlign: 'center', bgcolor: theme.palette.grey[50], borderRadius: 1, p: 1 }}>
                                                        <Typography variant="h6" color="success.main" sx={{ lineHeight: 1 }}>{item.stats.present}</Typography>
                                                        <Typography variant="caption" sx={{ fontSize: 10 }}>Present</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Box sx={{ textAlign: 'center', bgcolor: theme.palette.grey[50], borderRadius: 1, p: 1 }}>
                                                        <Typography variant="h6" color="error.main" sx={{ lineHeight: 1 }}>{item.stats.absent}</Typography>
                                                        <Typography variant="caption" sx={{ fontSize: 10 }}>Absent</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Box sx={{ textAlign: 'center', bgcolor: theme.palette.grey[50], borderRadius: 1, p: 1 }}>
                                                        <Typography variant="h6" color="warning.main" sx={{ lineHeight: 1 }}>{item.stats.sick + item.stats.permit}</Typography>
                                                        <Typography variant="caption" sx={{ fontSize: 10 }}>Leave</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Box sx={{ textAlign: 'center', bgcolor: theme.palette.grey[50], borderRadius: 1, p: 1 }}>
                                                        <Typography variant="h6" sx={{ lineHeight: 1 }}>{item.stats.total_days}</Typography>
                                                        <Typography variant="caption" sx={{ fontSize: 10 }}>Total</Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, bgcolor: theme.palette.grey[50] }}>
                <Button onClick={onClose} color="inherit">Close</Button>
                <Button
                    onClick={handleDownloadPDF}
                    variant="contained"
                    disabled={!previewData}
                    startIcon={<DocumentDownload />}
                    sx={{ px: 3 }}
                >
                    Download PDF Report
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReportGenerationDialog;
