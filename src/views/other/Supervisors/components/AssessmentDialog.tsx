'use client';

import React, { useState, useEffect } from 'react';
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
    DialogActions,
    CircularProgress,
    Chip,
    Select,
    FormControl,
    InputLabel,
    FormHelperText
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';
import { useTheme, alpha } from '@mui/material/styles';
import { NoteText, Award, InfoCircle, Building, User, DocumentText } from 'iconsax-react';
import { getCriteriaForUser, getAssessmentTemplates, getAssessmentCriteria } from 'utils/api/settings';

interface AssessmentDialogProps {
    open: boolean;
    onClose: () => void;
    selectedAssessment: any;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: (data?: any) => void;
    mutation: any;
    unassessedParticipants: any[];
    criteria: any;
    allAssessments: any[];
}

const AssessmentDialog = ({
    open,
    onClose,
    selectedAssessment,
    formData,
    setFormData,
    onSubmit,
    mutation,
    unassessedParticipants,
    criteria: globalCriteria,
    allAssessments
}: AssessmentDialogProps) => {
    const theme = useTheme();
    const [activeCriteria, setActiveCriteria] = useState(globalCriteria);
    const [fetchingCriteria, setFetchingCriteria] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userAssessments, setUserAssessments] = useState<Record<string, any>>({});
    const [sessionScores, setSessionScores] = useState<Record<string, Record<string, any>>>({
        internal: {},
        external: {}
    });
    const dynamicScores = sessionScores[formData.category] || {};

    // Template selection state
    const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('auto'); // 'auto', 'global', or institution_type

    // Fetch available templates on mount
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const templates = await getAssessmentTemplates();
                setAvailableTemplates(templates);
            } catch (error) {
                console.error('Failed to fetch templates:', error);
            }
        };
        if (open) {
            fetchTemplates();
        }
    }, [open]);

    // Initialize dynamic scores from all existing assessments for this user
    useEffect(() => {
        if (!open) return;

        const userId = selectedAssessment?.user_id || formData.user_id;
        if (!userId) {
            setSessionScores({ internal: {}, external: {} });
            setUserAssessments({});
            return;
        }

        // Find all assessments for this user in allAssessments
        const participantAssessments = allAssessments.filter((a: any) => a.user_id === userId);
        const internal = participantAssessments.find((a: any) => (a.category || 'internal') === 'internal');
        const external = participantAssessments.find((a: any) => a.category === 'external');

        const newSessionScores = {
            internal: internal?.scores || (internal ? {
                soft_skill: internal.soft_skill || '0',
                hard_skill: internal.hard_skill || '0',
                attitude: internal.attitude || '0'
            } : {}),
            external: external?.scores || (external ? {
                soft_skill: external.soft_skill || '0',
                hard_skill: external.hard_skill || '0',
                attitude: external.attitude || '0'
            } : {})
        };

        setUserAssessments({ internal, external });
        setSessionScores(newSessionScores);

        // Update selected user info
        if (!selectedUser || selectedUser.id !== userId) {
            const user = unassessedParticipants.find((u: any) => u.id === userId);
            if (user) setSelectedUser(user);
        }

        // Fetch criteria
        const fetchCriteria = async () => {
            setFetchingCriteria(true);
            try {
                const specific = await getCriteriaForUser(userId);
                setActiveCriteria(specific);

                // If any category is empty in sessionScores, initialize it with default values from criteria
                setSessionScores(prev => {
                    const updated = { ...prev };
                    ['internal', 'external'].forEach(cat => {
                        if (Object.keys(updated[cat]).length === 0) {
                            const initial: Record<string, any> = {};
                            (specific as any)[cat]?.forEach((c: any) => {
                                initial[c.key] = c.type === 'number' ? '0' : '';
                            });
                            updated[cat] = initial;
                        }
                    });
                    return updated;
                });
            } catch {
                setActiveCriteria(globalCriteria);
            } finally {
                setFetchingCriteria(false);
            }
        };
        fetchCriteria();
    }, [open, selectedAssessment, formData.user_id, allAssessments, globalCriteria]);

    // Handle template selection change
    const handleTemplateChange = async (templateId: string) => {
        setSelectedTemplate(templateId);
        setFetchingCriteria(true);

        try {
            let newCriteria;

            if (templateId === 'auto' && formData.user_id) {
                // Auto mode: use user's institution
                newCriteria = await getCriteriaForUser(formData.user_id);
            } else if (templateId === 'global') {
                // Use global default
                newCriteria = await getAssessmentCriteria();
            } else {
                // Use specific template
                const template = availableTemplates.find(t => t.institution_type === templateId);
                newCriteria = template ? template.criteria : globalCriteria;
            }

            setActiveCriteria(newCriteria);

            // Reset scores for both categories when template changes
            const newSessionScores: Record<string, Record<string, any>> = {
                internal: {},
                external: {}
            };

            ['internal', 'external'].forEach((cat) => {
                (newCriteria as any)[cat]?.forEach((criterion: any) => {
                    newSessionScores[cat][criterion.key] = criterion.type === 'number' ? '0' : '';
                });
            });

            setSessionScores(newSessionScores);
        } catch (error) {
            console.error('Failed to load template:', error);
            setActiveCriteria(globalCriteria);
        } finally {
            setFetchingCriteria(false);
        }
    };

    // Handle user selection change
    const handleUserChange = async (userId: string) => {
        const user = unassessedParticipants.find((u: any) => u.id === userId);
        setSelectedUser(user);

        setFormData({
            ...formData,
            user_id: userId,
            start_date: user?.internship_start ? format(new Date(user.internship_start), 'yyyy-MM-dd') : formData.start_date,
            end_date: user?.internship_end ? format(new Date(user.internship_end), 'yyyy-MM-dd') : formData.end_date
        });
    };

    const handleScoreChange = (key: string, value: any) => {
        setSessionScores((prev) => ({
            ...prev,
            [formData.category]: {
                ...prev[formData.category],
                [key]: value
            }
        }));
    };

    const handleSubmitWithDynamicScores = () => {
        const results: any[] = [];

        // Determine which assessments to save
        // We save the current category ALWAYS, and the other one ONLY if it has data
        const categories = ['internal', 'external'];

        categories.forEach(cat => {
            const scores = sessionScores[cat];
            const hasData = Object.values(scores).some(v => v !== '0' && v !== '');
            const isCurrent = cat === formData.category;
            const existing = userAssessments[cat];

            // Only save if it's the active tab, or if it's the other tab and we have non-trivial data to save
            if (isCurrent || (hasData && Object.keys(scores).length > 0)) {
                const criteriaList = activeCriteria?.[cat] || [];

                results.push({
                    ...formData,
                    id: existing?.id,
                    category: cat,
                    scores: scores,
                    // Map back to standard fields
                    soft_skill: (criteriaList[0] && scores[criteriaList[0].key] !== undefined) ? String(scores[criteriaList[0].key]) : (scores.soft_skill || '0'),
                    hard_skill: (criteriaList[1] && scores[criteriaList[1].key] !== undefined) ? String(scores[criteriaList[1].key]) : (scores.hard_skill || '0'),
                    attitude: (criteriaList[2] && scores[criteriaList[2].key] !== undefined) ? String(scores[criteriaList[2].key]) : (scores.attitude || '0')
                });
            }
        });

        onSubmit(results);
    };

    const isCustom = selectedTemplate !== 'auto' && selectedTemplate !== 'global';
    const currentCriteriaList = activeCriteria?.[formData.category] || [];

    // Get template display name
    const getTemplateDisplayName = () => {
        if (selectedTemplate === 'auto') {
            if (selectedUser?.institution_name) return `Auto (${selectedUser.institution_name})`;
            if (selectedUser?.institution_type) return `Auto (${selectedUser.institution_type})`;
            return 'Auto (Select intern first)';
        }
        if (selectedTemplate === 'global') return 'Global Default';
        return selectedTemplate;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: theme.palette.primary.lighter,
                    color: theme.palette.primary.main
                }}>
                    <NoteText size={26} />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{selectedAssessment ? 'Edit Assessment' : 'New Assessment'}</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                        Using template: {getTemplateDisplayName()}
                    </Typography>
                </Box>
                <Chip
                    icon={<DocumentText size={14} />}
                    label={`${currentCriteriaList.length} Indicators`}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
                <Stack spacing={4} sx={{ mt: 1 }}>
                    {/* Participant Selection Section */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.secondary }}>
                            <User size={16} /> 1. PARTICIPANT INFORMATION
                        </Typography>
                        <Stack spacing={2.5}>
                            <TextField
                                select
                                fullWidth
                                label="Select Intern"
                                value={formData.user_id}
                                disabled={!!selectedAssessment}
                                onChange={(e) => handleUserChange(e.target.value)}
                                helperText={selectedUser?.unit?.name ? `Unit: ${selectedUser.unit.name}` : ''}
                            >
                                <MenuItem value="" disabled>Select an intern</MenuItem>
                                {unassessedParticipants.map((user: any) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                                            <Chip label={user.institution_type || 'No Institution'} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Assessment Category"
                                        value={formData.category}
                                        onChange={(e) => {
                                            const nextCategory = e.target.value;
                                            setFormData({ ...formData, category: nextCategory });

                                            // Initialize the next category if it's empty
                                            if (Object.keys(sessionScores[nextCategory] || {}).length === 0) {
                                                const initialScores: Record<string, any> = {};
                                                (activeCriteria as any)[nextCategory]?.forEach((criterion: any) => {
                                                    initialScores[criterion.key] = criterion.type === 'number' ? '0' : '';
                                                });
                                                setSessionScores(prev => ({
                                                    ...prev,
                                                    [nextCategory]: initialScores
                                                }));
                                            }
                                        }}
                                    >
                                        <MenuItem value="internal">INTERNAL ASSESSMENT</MenuItem>
                                        <MenuItem value="external">EXTERNAL ASSESSMENT</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Template Selection"
                                        value={selectedTemplate}
                                        onChange={(e) => handleTemplateChange(e.target.value)}
                                        helperText="Choose which evaluation template to use"
                                    >
                                        <MenuItem value="auto">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <InfoCircle size={16} />
                                                <Typography variant="body2">Auto (Based on Intern's Institution)</Typography>
                                            </Stack>
                                        </MenuItem>
                                        <MenuItem value="global">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Building size={16} />
                                                <Typography variant="body2">Global Default</Typography>
                                            </Stack>
                                        </MenuItem>
                                        {availableTemplates.map((template) => (
                                            <MenuItem key={template.id} value={template.institution_type}>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Building size={16} />
                                                    <Typography variant="body2">{template.institution_type}</Typography>
                                                </Stack>
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Stack>
                    </Box>

                    {/* Timeline Info (ReadOnly) */}
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <DatePicker
                                    label="Start Date"
                                    value={parseISO(formData.start_date)}
                                    disabled
                                    slotProps={{ textField: { fullWidth: true, size: 'small', variant: 'outlined', sx: { bgcolor: alpha(theme.palette.grey[50], 0.5) } } }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <DatePicker
                                    label="End Date"
                                    value={parseISO(formData.end_date)}
                                    disabled
                                    slotProps={{ textField: { fullWidth: true, size: 'small', variant: 'outlined', sx: { bgcolor: alpha(theme.palette.grey[50], 0.5) } } }}
                                />
                            </Grid>
                        </Grid>
                    </LocalizationProvider>

                    {/* Dynamic Indicators Section */}
                    <Box sx={{
                        p: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        borderRadius: 4,
                        border: `1px solid ${isCustom ? theme.palette.success.main : alpha(theme.palette.primary.main, 0.1)}`,
                        position: 'relative',
                        transition: 'all 0.3s'
                    }}>
                        {fetchingCriteria && (
                            <Box sx={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                bgcolor: 'rgba(255,255,255,0.8)', zIndex: 10,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4
                            }}>
                                <CircularProgress size={32} thickness={5} />
                            </Box>
                        )}

                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.primary.main }}>
                                <Award size={20} />
                                2. EVALUATION INDICATORS
                            </Typography>
                            {isCustom && (
                                <Chip
                                    icon={<Building size={14} />}
                                    label={`CUSTOM: ${selectedTemplate}`}
                                    color="success"
                                    size="small"
                                    sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                                />
                            )}
                        </Stack>

                        <Grid container spacing={3}>
                            {currentCriteriaList.map((criterion: any, idx: number) => {
                                const isNumeric = criterion.type === 'number';
                                const isSelect = criterion.type === 'select';
                                const isText = criterion.type === 'text';

                                return (
                                    <Grid item xs={12} md={currentCriteriaList.length > 3 ? 6 : 12 / Math.min(currentCriteriaList.length, 3)} key={criterion.key}>
                                        {isSelect ? (
                                            <FormControl fullWidth>
                                                <InputLabel>{criterion.label}</InputLabel>
                                                <Select
                                                    value={dynamicScores[criterion.key] || ''}
                                                    onChange={(e) => handleScoreChange(criterion.key, e.target.value)}
                                                    label={criterion.label}
                                                    sx={{ borderRadius: 2, bgcolor: '#fff' }}
                                                >
                                                    {criterion.options?.map((option: string) => (
                                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                                    ))}
                                                </Select>
                                                <FormHelperText>{criterion.description}</FormHelperText>
                                            </FormControl>
                                        ) : (
                                            <TextField
                                                fullWidth
                                                type={isNumeric ? 'number' : 'text'}
                                                label={criterion.label}
                                                value={dynamicScores[criterion.key] || (isNumeric ? '0' : '')}
                                                onChange={(e) => handleScoreChange(criterion.key, e.target.value)}
                                                helperText={criterion.description}
                                                multiline={isText}
                                                rows={isText ? 2 : 1}
                                                placeholder={isNumeric ? 'Range 0 - 100' : 'Type feedback here...'}
                                                InputProps={{
                                                    sx: { borderRadius: 2, bgcolor: '#fff' },
                                                    ...(isNumeric && { inputProps: { min: 0, max: 100 } })
                                                }}
                                            />
                                        )}
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>

                    {/* Remarks Section */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.secondary }}>
                            <InfoCircle size={16} /> 3. ADDITIONAL FEEDBACK
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Write any additional observations or notes about the intern's overall performance during this period..."
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 4, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button onClick={onClose} color="secondary" sx={{ fontWeight: 700 }}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmitWithDynamicScores}
                    disabled={mutation.isPending || fetchingCriteria}
                    sx={{
                        borderRadius: 2.5,
                        px: 4,
                        py: 1.2,
                        fontWeight: 700,
                        boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                >
                    {mutation.isPending ? 'Processing...' : selectedAssessment ? 'Update Evaluation' : 'Submit Assessment'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssessmentDialog;
