'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    TextField,
    Button,
    Stack,
    Grid,
    Typography,
    CircularProgress,
    Divider,
    IconButton,
    Alert,
    Tooltip,
    MenuItem
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Edit, DocumentText, User, Award, CloseCircle, Refresh } from 'iconsax-react';
import { useQuery } from '@tanstack/react-query';
import { getCertificateEligibility } from 'utils/api/certificate';
import { generateCertificatePDF } from 'utils/certificateGenerator';
import { openAlert } from 'api/alert';

interface CertificateEditDialogProps {
    open: boolean;
    onClose: () => void;
    userId: string | null;
    userName: string;
}

const CertificateEditDialog = ({ open, onClose, userId, userName }: CertificateEditDialogProps) => {
    const theme = useTheme();
    const [formData, setFormData] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const { data: eligibility, isLoading, isError } = useQuery({
        queryKey: ['certificate-eligibility', userId],
        queryFn: () => getCertificateEligibility(userId!),
        enabled: !!userId && open,
    });

    const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');

    useEffect(() => {
        if (eligibility?.eligible && eligibility.data) {
            setFormData(eligibility.data);
            const initialId = eligibility.data.allAssessments.find((a: any) => a.category === eligibility.data.category)?.id || eligibility.data.allAssessments[0]?.id;
            setSelectedAssessmentId(initialId || '');
        } else if (eligibility && !eligibility.eligible) {
            setFormData(null);
            setSelectedAssessmentId('');
        }
    }, [eligibility]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => {
            if (!prev) return prev;
            const updated = { ...prev, [name]: value };

            // Sync specific fields to the current basis bucket
            if (name === 'evaluator' || name === 'remarks') {
                const bucketKey = prev.category === 'external' ? 'externalData' : 'internalData';
                if (updated[bucketKey]) {
                    updated[bucketKey] = {
                        ...updated[bucketKey],
                        [name]: value
                    };
                }
            }
            return updated;
        });
    };

    const handleAssessmentChange = (assessmentId: string) => {
        if (!eligibility?.data) return;

        // 1. SAVE current edits to the current bucket before switching
        setFormData((prev: any) => {
            if (!prev) return prev;
            const updated = { ...prev };
            const bucketKey = prev.category === 'external' ? 'externalData' : 'internalData';
            updated[bucketKey] = {
                ...updated[bucketKey],
                scores: prev.scores,
                criteria: prev.criteria,
                avgScore: prev.score,
                grade: prev.grade,
                evaluator: prev.evaluator
            };

            // 2. NOW LOAD the new assessment from the list
            setSelectedAssessmentId(assessmentId);
            const selected = eligibility.data.allAssessments.find((a: any) => a.id === assessmentId);
            if (selected) {
                // Robust initial calculation
                const currentScores = selected.scores || {
                    soft_skill: selected.soft_skill,
                    hard_skill: selected.hard_skill,
                    attitude: selected.attitude
                };
                const numericVals = Object.values(currentScores)
                    .map(v => parseFloat(v as string))
                    .filter(v => !isNaN(v));

                let avg = 0;
                let grade = 'D';
                if (numericVals.length > 0) {
                    avg = Math.round(numericVals.reduce((a, b) => a + b, 0) / numericVals.length);
                    if (avg >= 85) grade = 'A';
                    else if (avg >= 75) grade = 'B';
                    else if (avg >= 60) grade = 'C';
                }

                // Try to auto-detect template for the NEW selection
                const templates = eligibility?.data?.templates || [];
                const matchedTemplate = templates.find((t: any) => {
                    const templateCriteria = t.criteria?.[selected.category || 'internal'] || [];
                    if (templateCriteria.length === 0) return false;
                    return templateCriteria.some((tc: any) => selected.scores && selected.scores[tc.key] !== undefined);
                });

                // 3. PRIORITIZE bucket values (edits) over raw DB values
                const targetBucketKey = selected.category === 'external' ? 'externalData' : 'internalData';
                const savedData = updated[targetBucketKey];

                return {
                    ...updated,
                    category: selected.category,
                    softSkill: savedData?.scores?.soft_skill || selected.soft_skill,
                    hardSkill: savedData?.scores?.hard_skill || selected.hard_skill,
                    attitude: savedData?.scores?.attitude || selected.attitude,
                    scores: savedData?.scores || selected.scores || null,
                    remarks: savedData?.remarks || selected.remarks,
                    score: (savedData?.avgScore !== undefined && savedData?.avgScore !== null) ? savedData.avgScore : avg,
                    grade: savedData?.grade || grade,
                    evaluator: savedData?.evaluator || selected.evaluator || updated.evaluator,
                    issueDate: selected.created_at ? new Date(selected.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : updated.issueDate,
                    criteria: savedData?.criteria || (matchedTemplate ? matchedTemplate.criteria : updated.criteria),
                    activeTemplateId: savedData?.activeTemplateId || (matchedTemplate ? matchedTemplate.institution_type : 'custom')
                };
            }
            return updated;
        });
    };

    const handleReset = () => {
        if (eligibility?.data) {
            setFormData(eligibility.data);
            openAlert({ title: 'Reset', message: 'Form has been reset to default values.', variant: 'info' });
        }
    };

    const handleDownload = async () => {
        if (!formData) return;
        setIsGenerating(true);
        try {
            // Sync current edits into the combined data for the transcript
            const updatedData = { ...formData };
            if (formData.category === 'external') {
                updatedData.externalData = {
                    ...(formData.externalData || {}),
                    scores: formData.scores,
                    criteria: (formData.criteria as any)?.external || [],
                    avgScore: formData.score,
                    grade: formData.grade,
                    evaluator: formData.evaluator
                };
            } else {
                updatedData.internalData = {
                    ...(formData.internalData || {}),
                    scores: formData.scores,
                    criteria: (formData.criteria as any)?.internal || [],
                    avgScore: formData.score,
                    grade: formData.grade,
                    evaluator: formData.evaluator
                };
            }

            await generateCertificatePDF(updatedData);
            openAlert({ title: 'Success', message: 'Certificate has been generated successfully.', variant: 'success' });
        } catch (error: any) {
            console.error('Failed to generate certificate:', error);
            openAlert({
                title: 'Error',
                message: `Failed to generate certificate PDF: ${error.message || 'Unknown error'}`,
                variant: 'error'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: theme.palette.primary.main,
                        color: '#fff'
                    }}>
                        <DocumentText size={22} variant="Bold" />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>Edit Certificate</Typography>
                        <Typography variant="caption" color="textSecondary">{userName}</Typography>
                    </Box>
                </Stack>
                <IconButton onClick={onClose} size="small">
                    <CloseCircle size={24} />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
                        <CircularProgress size={40} />
                        <Typography variant="body2" color="textSecondary">Fetching certificate data...</Typography>
                    </Box>
                ) : isError || (eligibility && !eligibility.eligible) ? (
                    <Box sx={{ py: 4 }}>
                        <Alert severity="warning" sx={{ borderRadius: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{eligibility?.message || 'User is not eligible for a certificate'}</Typography>
                            <Typography variant="body2">Admin can only edit certificates for students who have received an assessment from their supervisor.</Typography>
                        </Alert>
                    </Box>
                ) : formData ? (
                    <Stack spacing={4} sx={{ mt: 1 }}>
                        {/* Recipient Information */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 2.5, fontWeight: 700, color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <User size={18} variant="Bold" /> RECIPIENT & PERIOD
                            </Typography>
                            <Grid container spacing={2.5}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={handleChange}
                                        helperText="Name as it will appear on the certificate"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Certificate No"
                                        name="certNo"
                                        value={formData.certNo || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Internship Unit"
                                        name="unit"
                                        value={formData.unit || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Internship Period"
                                        name="period"
                                        value={formData.period || ''}
                                        onChange={handleChange}
                                        placeholder="e.g. 1 Jan 2026 - 31 Mar 2026"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Basis Assessment (Select Record)"
                                        value={selectedAssessmentId}
                                        onChange={(e) => handleAssessmentChange(e.target.value)}
                                        SelectProps={{ native: false }}
                                        helperText="Choose which assessment data to use"
                                    >
                                        {eligibility?.data?.allAssessments?.map((a: any) => (
                                            <MenuItem key={a.id} value={a.id}>
                                                {a.category.toUpperCase()} - {new Date(a.created_at).toLocaleDateString('id-ID')} ({a.evaluator})
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Apply Assessment Template"
                                        value={formData.activeTemplateId || 'custom'}
                                        onChange={(e) => {
                                            const templateId = e.target.value;
                                            const template = eligibility?.data?.templates?.find((t: any) => t.institution_type === templateId);
                                            if (template) {
                                                setFormData({
                                                    ...formData,
                                                    activeTemplateId: templateId,
                                                    criteria: template.criteria
                                                });
                                                openAlert({ title: 'Template Applied', message: `Using labels from ${templateId} template.`, variant: 'info' });
                                            } else {
                                                setFormData({ ...formData, activeTemplateId: 'custom' });
                                            }
                                        }}
                                        helperText="Forces labels to match a specific institution's template"
                                    >
                                        <MenuItem value="custom">Custom / Current</MenuItem>
                                        {eligibility?.data?.templates?.map((t: any) => (
                                            <MenuItem key={t.id} value={t.institution_type}>
                                                {t.institution_type}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider />

                        {/* Assessment details */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 2.5, fontWeight: 700, color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Award size={18} variant="Bold" /> SCORES & ASSESSMENT
                            </Typography>
                            <Grid container spacing={2.5}>
                                {(formData.criteria as any)?.[formData.category || 'internal']?.map((criterion: any, idx: number) => {
                                    const rawVal = formData.scores?.[criterion.key] || (idx === 0 ? formData.softSkill : idx === 1 ? formData.hardSkill : idx === 2 ? formData.attitude : '');
                                    const isNumeric = criterion.type === 'number';

                                    // Sanitize label: if it's a number (or stringy number), it's likely wrong
                                    let displayLabel = criterion.label || '';
                                    if (!displayLabel || !isNaN(Number(displayLabel))) {
                                        displayLabel = `Assessment Item ${idx + 1}`;
                                    }

                                    return (
                                        <Grid item xs={12} sm={4} key={criterion.key || idx}>
                                            <TextField
                                                fullWidth
                                                type={isNumeric ? 'number' : 'text'}
                                                label={displayLabel}
                                                value={rawVal}
                                                InputProps={isNumeric ? { inputProps: { min: 0, max: 100 } } : {}}
                                                placeholder={isNumeric ? '0 - 100' : 'Excellent / Good / etc'}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const newScores = { ...(formData.scores || {}), [criterion.key]: val };
                                                    let updates: any = { scores: newScores };

                                                    // Map to standard fields for backward compatibility
                                                    if (idx === 0) updates.softSkill = val;
                                                    if (idx === 1) updates.hardSkill = val;
                                                    if (idx === 2) updates.attitude = val;

                                                    // Robust Average Calculation
                                                    const numericVals = Object.keys(newScores)
                                                        .map(k => {
                                                            const v = newScores[k];
                                                            // Also check if this key belongs to a numeric criterion
                                                            const crit = (formData.criteria as any)?.[formData.category || 'internal']?.find((c: any) => c.key === k);
                                                            if (crit && crit.type !== 'number') return null;

                                                            const parsed = parseFloat(v as string);
                                                            return isNaN(parsed) ? null : parsed;
                                                        })
                                                        .filter(v => v !== null) as number[];

                                                    if (numericVals.length > 0) {
                                                        const newAvg = Math.round(numericVals.reduce((a, b) => a + b, 0) / numericVals.length);
                                                        updates.score = newAvg;

                                                        let g = 'C';
                                                        if (newAvg >= 85) g = 'A';
                                                        else if (newAvg >= 75) g = 'B';
                                                        else if (newAvg >= 60) g = 'C';
                                                        else g = 'D';
                                                        updates.grade = g;
                                                    }

                                                    const updatedFormData = { ...formData, ...updates };

                                                    // Instant Bucket Sync
                                                    const bucketKey = formData.category === 'external' ? 'externalData' : 'internalData';
                                                    updatedFormData[bucketKey] = {
                                                        ...updatedFormData[bucketKey],
                                                        scores: updates.scores,
                                                        avgScore: updates.score !== undefined ? updates.score : formData.score,
                                                        grade: updates.grade !== undefined ? updates.grade : formData.grade,
                                                        criteria: formData.criteria
                                                    };

                                                    setFormData(updatedFormData);
                                                }}
                                            />
                                        </Grid>
                                    );
                                })}
                                {(formData.criteria as any)?.[formData.category || 'internal']?.length === 0 && (
                                    <>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Soft Skill"
                                                name="softSkill"
                                                value={formData.softSkill || 0}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Hard Skill"
                                                name="hardSkill"
                                                value={formData.hardSkill || 0}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Attitude"
                                                name="attitude"
                                                value={formData.attitude || 0}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                    </>
                                )}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Average Score"
                                        name="score"
                                        value={formData.score || 0}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Grade"
                                        name="grade"
                                        value={formData.grade || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        label="Remarks / Evaluation"
                                        name="remarks"
                                        value={formData.remarks || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider />

                        {/* Transcript Labels */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 2.5, fontWeight: 700, color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DocumentText size={18} variant="Bold" /> TRANSCRIPT LABELS
                                <Box sx={{ flex: 1 }} />
                                <Button
                                    size="small"
                                    startIcon={<Refresh size={14} />}
                                    onClick={() => {
                                        const defaultCriteria = eligibility?.data?.criteria;
                                        if (defaultCriteria) {
                                            setFormData({ ...formData, criteria: JSON.parse(JSON.stringify(defaultCriteria)), activeTemplateId: 'custom' });
                                            openAlert({ title: 'Labels Reset', message: 'Restored labels to institution defaults.', variant: 'success' });
                                        }
                                    }}
                                >
                                    Reset Labels
                                </Button>
                            </Typography>
                            <Grid container spacing={2.5}>
                                {(formData.criteria as any)?.[formData.category || 'internal']?.map((criterion: any, idx: number) => (
                                    <Grid item xs={12} key={criterion.key || idx}>
                                        <TextField
                                            fullWidth
                                            label={`Transcript Label for Item ${idx + 1} (${criterion.key})`}
                                            value={criterion.label || ''}
                                            onChange={(e) => {
                                                const newCriteria = JSON.parse(JSON.stringify(formData.criteria || { internal: [], external: [] }));
                                                const cat = formData.category || 'internal';
                                                if (!newCriteria[cat]) newCriteria[cat] = [];
                                                if (!newCriteria[cat][idx]) newCriteria[cat][idx] = {};
                                                newCriteria[cat][idx].label = e.target.value;

                                                const updatedData = { ...formData, criteria: newCriteria };
                                                // Sync to bucket
                                                const bucketKey = formData.category === 'external' ? 'externalData' : 'internalData';
                                                updatedData[bucketKey] = {
                                                    ...updatedData[bucketKey],
                                                    criteria: newCriteria
                                                };

                                                setFormData(updatedData);
                                            }}
                                            placeholder="Enter label to show on PDF transcript"
                                        />
                                    </Grid>
                                ))}
                                {(formData.criteria as any)?.[formData.category || 'internal']?.length === 0 && (
                                    <Grid item xs={12}>
                                        <Alert severity="info">No dynamic labels found for this category.</Alert>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>

                        <Divider />

                        {/* Signatures */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 2.5, fontWeight: 700, color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Edit size={18} variant="Bold" /> SIGNATURES & OFFICIALS
                            </Typography>
                            <Grid container spacing={2.5}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Supervisor Name"
                                        name="evaluator"
                                        value={formData.evaluator || ''}
                                        onChange={handleChange}
                                        helperText="Appears on left signature"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Issue Date"
                                        name="issueDate"
                                        value={formData.issueDate || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="NIP/NIK Supervisor"
                                        name="evaluatorIdNumber"
                                        value={formData.evaluatorIdNumber || ''}
                                        onChange={handleChange}
                                        helperText="Supervisor ID Number"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="HR Officer Name"
                                        name="hrOfficerName"
                                        value={formData.hrOfficerName || ''}
                                        onChange={handleChange}
                                        helperText="Appears on right signature"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="HR Officer Position"
                                        name="hrOfficerPosition"
                                        value={formData.hrOfficerPosition || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="City"
                                        name="city"
                                        value={formData.city || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Institution Name (Right Bottom)"
                                        name="hrInstitutionName"
                                        value={formData.hrInstitutionName || ''}
                                        onChange={handleChange}
                                        helperText="e.g. Universitas Telkom"
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Stack>
                ) : null}
            </DialogContent>

            <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
                <Box>
                    <Tooltip title="Reset to original values">
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={handleReset}
                            startIcon={<Refresh size={18} />}
                            disabled={!formData}
                        >
                            Reset
                        </Button>
                    </Tooltip>
                </Box>
                <Stack direction="row" spacing={1.5}>
                    <Button onClick={onClose} color="inherit">Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleDownload}
                        disabled={!formData || isGenerating}
                        startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : <DocumentText size={18} />}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        {isGenerating ? 'Generating...' : 'Download PDF'}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default CertificateEditDialog;
