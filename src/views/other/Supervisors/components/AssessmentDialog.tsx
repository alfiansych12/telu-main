'use client';

import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Button,
    Grid,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';
import { useTheme, alpha } from '@mui/material/styles';
import { NoteText, Award } from 'iconsax-react';

interface AssessmentDialogProps {
    open: boolean;
    onClose: () => void;
    selectedAssessment: any;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: () => void;
    mutation: any;
    unassessedParticipants: any[];
}

const AssessmentDialog = ({
    open,
    onClose,
    selectedAssessment,
    formData,
    setFormData,
    onSubmit,
    mutation,
    unassessedParticipants
}: AssessmentDialogProps) => {
    const theme = useTheme();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2.5 }}>
                <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: theme.palette.primary.lighter,
                    color: theme.palette.primary.main
                }}>
                    <NoteText size={24} />
                </Box>
                <Box>
                    <Typography variant="h4">{selectedAssessment ? 'Edit Assessment' : 'New Assessment'}</Typography>
                    <Typography variant="caption" color="textSecondary">Complete the evaluation for softskills, hardskills, and attitude</Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <TextField
                        select
                        fullWidth
                        label="Select Intern"
                        value={formData.user_id}
                        disabled={!!selectedAssessment}
                        onChange={(e) => {
                            const userId = e.target.value;
                            const user = unassessedParticipants.find((u: any) => u.id === userId);
                            setFormData({
                                ...formData,
                                user_id: userId,
                                start_date: user?.internship_start ? format(new Date(user.internship_start), 'yyyy-MM-dd') : formData.start_date,
                                end_date: user?.internship_end ? format(new Date(user.internship_end), 'yyyy-MM-dd') : formData.end_date
                            });
                        }}
                    >
                        {unassessedParticipants.map((user: any) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <DatePicker
                                    label="Start Date"
                                    value={parseISO(formData.start_date)}
                                    disabled
                                    onChange={() => { }}
                                    slotProps={{ textField: { fullWidth: true, size: 'small', helperText: 'Auto-filled' } }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <DatePicker
                                    label="End Date"
                                    value={parseISO(formData.end_date)}
                                    disabled
                                    onChange={() => { }}
                                    slotProps={{ textField: { fullWidth: true, size: 'small', helperText: 'Auto-filled' } }}
                                />
                            </Grid>
                        </Grid>
                    </LocalizationProvider>

                    <Box sx={{ p: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Award size={18} color={theme.palette.primary.main} />
                            Evaluation Indicators
                        </Typography>

                        <Stack spacing={2.5}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Soft Skill (0 - 100)"
                                value={formData.soft_skill}
                                onChange={(e) => setFormData({ ...formData, soft_skill: Number(e.target.value) })}
                                helperText="Communication, teamwork, and leadership"
                            />

                            <TextField
                                fullWidth
                                type="number"
                                label="Hard Skill (0 - 100)"
                                value={formData.hard_skill}
                                onChange={(e) => setFormData({ ...formData, hard_skill: Number(e.target.value) })}
                                helperText="Technical ability and quality of work"
                            />

                            <TextField
                                fullWidth
                                type="number"
                                label="Attitude (0 - 100)"
                                value={formData.attitude}
                                onChange={(e) => setFormData({ ...formData, attitude: Number(e.target.value) })}
                                helperText="Discipline, politeness, and initiative"
                            />
                        </Stack>
                    </Box>

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Remarks / Additional Feedback"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button onClick={onClose} color="secondary">Cancel</Button>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={mutation.isPending}
                    sx={{ borderRadius: 2, px: 4 }}
                >
                    {mutation.isPending ? 'Saving...' : 'Save Assessment'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssessmentDialog;
