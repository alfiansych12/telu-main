
'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Paper,
    CircularProgress,
    Stack,
    IconButton,
    alpha,
    useTheme,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent
} from '@mui/material';
import { CloseCircle, DocumentDownload, People, Buildings, DocumentText, Profile2User } from 'iconsax-react';
import { getMonthlyReportData } from 'utils/api/reports';
import { generateMonthlyReportPDF } from 'utils/pdfGenerator';
import { getUsers } from 'utils/api/users';
import { getUnits } from 'utils/api/units';

interface ExportMonitoringDialogProps {
    open: boolean;
    onClose: () => void;
    initialUnitId?: string;
    supervisorId?: string;
}

const ExportMonitoringDialog: React.FC<ExportMonitoringDialogProps> = ({ open, onClose, initialUnitId, supervisorId }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [selectedType, setSelectedType] = useState<'individual' | 'unit' | 'institution' | 'overall'>('individual');

    // New Filters
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedParticipantId, setSelectedParticipantId] = useState<string>('all');
    const [selectedUnitId, setSelectedUnitId] = useState<string>(initialUnitId === 'all' ? 'all' : (initialUnitId || 'all'));

    // Data fetching for selectors
    const [participants, setParticipants] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);

    React.useEffect(() => {
        if (open) {
            // Load components data
            const loadData = async () => {
                try {
                    const [pData, uData] = await Promise.all([
                        getUsers({ role: 'participant', pageSize: 500 }),
                        getUnits({ pageSize: 100 })
                    ]);
                    setParticipants(pData.data || []);
                    setUnits(uData.data || []);
                } catch (e) {
                    console.error('Failed to load export reference data', e);
                }
            };
            loadData();

            // Sync unit selection from parent filter if changed
            if (initialUnitId) setSelectedUnitId(initialUnitId);
        }
    }, [open, initialUnitId]);

    const handleExport = async () => {
        setLoading(true);
        try {
            const data = await getMonthlyReportData({
                month,
                year,
                userId: (selectedType === 'individual' && selectedParticipantId !== 'all') ? selectedParticipantId : undefined,
                unitId: selectedUnitId === 'all' ? undefined : selectedUnitId,
                supervisorId
            });

            if (!data || data.length === 0) {
                alert('No data found for the selected filters.');
                setLoading(false);
                return;
            }

            const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' });
            const period = `${monthName} ${year}`;

            // Map 'unit' type to 'individual' for pdf generator as it produces one-page-per-person
            // or we could update pdfGenerator to handle more types.
            const pdfType = selectedType === 'unit' ? 'overall' : selectedType;

            await generateMonthlyReportPDF(data, period, pdfType as any);
            onClose();
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const OptionCard = ({ type, title, description, icon: Icon, color }: any) => (
        <Paper
            onClick={() => setSelectedType(type)}
            sx={{
                p: 2.5,
                cursor: 'pointer',
                borderRadius: 3,
                border: '2px solid',
                borderColor: selectedType === type ? color : 'transparent',
                bgcolor: selectedType === type ? alpha(color, 0.05) : '#fff',
                transition: 'all 0.2s',
                '&:hover': {
                    bgcolor: alpha(color, 0.02),
                    borderColor: selectedType === type ? color : alpha(color, 0.2)
                }
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(color, 0.1),
                    color: color,
                    display: 'flex'
                }}>
                    <Icon variant={selectedType === type ? 'Bold' : 'Outline'} size={24} />
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
                    <Typography variant="caption" color="textSecondary">{description}</Typography>
                </Box>
            </Stack>
        </Paper>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Export Attendance Report</Typography>
                    <IconButton onClick={onClose} size="small"><CloseCircle /></IconButton>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ py: 4 }}>
                <Stack spacing={2.5}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                            1. Select Time Period
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Month</InputLabel>
                                <Select value={month} label="Month" onChange={(e: SelectChangeEvent<number>) => setMonth(e.target.value as number)}>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <MenuItem key={i + 1} value={i + 1}>
                                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel>Year</InputLabel>
                                <Select value={year} label="Year" onChange={(e: SelectChangeEvent<number>) => setYear(e.target.value as number)}>
                                    {[2024, 2025, 2026].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Stack>
                    </Box>

                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                        2. Choose Export Category
                    </Typography>

                    <Stack spacing={1.5}>
                        <OptionCard
                            type="individual"
                            title="Per Participant"
                            description="Detailed report for specific or all individuals."
                            icon={People}
                            color={theme.palette.primary.main}
                        />
                        {selectedType === 'individual' && (
                            <Box sx={{ pl: 6.5, mt: -1, mb: 1 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Select Participant</InputLabel>
                                    <Select
                                        value={selectedParticipantId}
                                        label="Select Participant"
                                        onChange={(e: SelectChangeEvent) => setSelectedParticipantId(e.target.value as string)}
                                        sx={{ bgcolor: '#fff' }}
                                    >
                                        <MenuItem value="all">All Participants (New Page per person)</MenuItem>
                                        {participants.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Box>
                        )}

                        <OptionCard
                            type="unit"
                            title="Per Working Unit"
                            description="Attendance summary for a specific department."
                            icon={Profile2User}
                            color={theme.palette.warning.main}
                        />
                        {selectedType === 'unit' && (
                            <Box sx={{ pl: 6.5, mt: -1, mb: 1 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Select Unit</InputLabel>
                                    <Select
                                        value={selectedUnitId}
                                        label="Select Unit"
                                        onChange={(e: SelectChangeEvent) => setSelectedUnitId(e.target.value as string)}
                                        sx={{ bgcolor: '#fff' }}
                                    >
                                        <MenuItem value="all">All Units Combined</MenuItem>
                                        {units.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Box>
                        )}

                        <OptionCard
                            type="institution"
                            title="Per Institution"
                            description="Grouped by School / University origin."
                            icon={Buildings}
                            color={theme.palette.secondary.main}
                        />

                        <OptionCard
                            type="overall"
                            title="Overall Summary"
                            description="Quick summary table for comparison."
                            icon={DocumentText}
                            color={theme.palette.success.main}
                        />
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DocumentDownload />}
                    onClick={handleExport}
                    disabled={loading}
                    sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}
                >
                    {loading ? 'Generating...' : 'Download PDF'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExportMonitoringDialog;
