'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    TextField,
    Button,
    Stack,
    Divider,
    Paper,
    Tab,
    Tabs,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    alpha,
    MenuItem,
    Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Setting2, Save2, Refresh, Add, Trash, Building, Global, AddCircle } from 'iconsax-react';
import {
    getAssessmentCriteria,
    updateAssessmentCriteria,
    AssessmentCriteria,
    Criterion,
    getAssessmentTemplates,
    upsertAssessmentTemplate,
    deleteAssessmentTemplate
} from 'utils/api/settings';
import { getDefaultAssessmentCriteria } from 'utils/api/assessment-defaults';
import { openAlert } from 'api/alert';

const AssessmentSettings = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(0); // 0: internal, 1: external
    const [sidebarTab, setSidebarTab] = useState('global'); // 'global' or institution type

    const [globalCriteria, setGlobalCriteria] = useState<AssessmentCriteria>(getDefaultAssessmentCriteria());
    const [templates, setTemplates] = useState<any[]>([]);
    const [currentCriteria, setCurrentCriteria] = useState<AssessmentCriteria>(getDefaultAssessmentCriteria());

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newInstType, setNewInstType] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [global, tplList] = await Promise.all([
                getAssessmentCriteria(),
                getAssessmentTemplates()
            ]);
            setGlobalCriteria(global);
            setTemplates(tplList);

            if (sidebarTab === 'global') {
                setCurrentCriteria(global);
            } else {
                const activeTpl = tplList.find((t: any) => t.institution_type === sidebarTab);
                if (activeTpl) {
                    setCurrentCriteria(activeTpl.criteria as any);
                } else {
                    setSidebarTab('global');
                    setCurrentCriteria(global);
                }
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSidebarChange = (id: string) => {
        setSidebarTab(id);
        if (id === 'global') {
            setCurrentCriteria(globalCriteria);
        } else {
            const tpl = templates.find((t: any) => t.institution_type === id);
            if (tpl) {
                setCurrentCriteria(tpl.criteria as any);
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (sidebarTab === 'global') {
                await updateAssessmentCriteria(currentCriteria);
                setGlobalCriteria(currentCriteria);
            } else {
                await upsertAssessmentTemplate(sidebarTab, currentCriteria);
                const updatedTemplates = await getAssessmentTemplates();
                setTemplates(updatedTemplates);
            }
            openAlert({
                variant: 'success',
                title: 'Settings Saved',
                message: 'Assessment criteria labels have been updated successfully.'
            });
        } catch (error) {
            console.error('Save error:', error);
            openAlert({
                variant: 'error',
                title: 'Save Failed',
                message: 'Failed to update assessment criteria.'
            });
        } finally {
            setSaving(false);
        }
    };

    const resetToDefault = () => {
        setCurrentCriteria(getDefaultAssessmentCriteria());
    };

    const handleLabelChange = (category: 'internal' | 'external', index: number, field: keyof Criterion, value: any) => {
        const newCriteria = { ...currentCriteria };
        (newCriteria[category][index] as any)[field] = value;
        setCurrentCriteria(newCriteria);
    };

    const handleAddColumn = (category: 'internal' | 'external') => {
        const newCriteria = { ...currentCriteria };
        const newKey = `custom_${Date.now()}`;
        newCriteria[category].push({
            key: newKey,
            label: 'New Indicator',
            description: 'Description for new indicator',
            type: 'number'
        });
        setCurrentCriteria(newCriteria);
    };

    const handleRemoveColumn = (category: 'internal' | 'external', index: number) => {
        if (currentCriteria[category].length <= 1) {
            openAlert({ variant: 'warning', title: 'Cannot Remove', message: 'At least one indicator is required.' });
            return;
        }
        const newCriteria = { ...currentCriteria };
        newCriteria[category].splice(index, 1);
        setCurrentCriteria(newCriteria);
    };

    const handleAddNewTemplate = async () => {
        if (!newInstType.trim()) return;
        setSaving(true);
        try {
            await upsertAssessmentTemplate(newInstType.trim(), getDefaultAssessmentCriteria(), `Custom template for ${newInstType}`);
            setNewInstType('');
            setIsAddDialogOpen(false);
            await fetchData();
            setSidebarTab(newInstType.trim());
        } catch (error) {
            openAlert({ variant: 'error', title: 'Error', message: 'Failed to create template.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTemplate = async (id: string, instType: string) => {
        if (!confirm(`Are you sure you want to delete the template for ${instType}?`)) return;
        try {
            await deleteAssessmentTemplate(id);
            if (sidebarTab === instType) {
                setSidebarTab('global');
            }
            await fetchData();
            openAlert({ variant: 'success', title: 'Deleted', message: 'Template removed.' });
        } catch (error) {
            openAlert({ variant: 'error', title: 'Error', message: 'Failed to delete template.' });
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    const currentCategory = activeTab === 0 ? 'internal' : 'external';

    return (
        <Box sx={{ py: 2 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>Assessment Templates</Typography>
                    <Typography variant="body1" color="textSecondary">Customize evaluation components for specific educational institutions or defaults.</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh size={18} />}
                        onClick={resetToDefault}
                    >
                        Reset Defaults
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Save2 size={18} />}
                        onClick={handleSave}
                        disabled={saving}
                        sx={{ borderRadius: 2, px: 3, bgcolor: theme.palette.primary.main, color: '#fff' }}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={4}>
                {/* Sidebar */}
                <Grid item xs={12} md={3}>
                    <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: theme.palette.primary.main }}>
                                Selection List
                            </Typography>
                        </Box>
                        <List sx={{ p: 0 }}>
                            <ListItem
                                button
                                selected={sidebarTab === 'global'}
                                onClick={() => handleSidebarChange('global')}
                                sx={{ py: 2 }}
                            >
                                <Global size={20} style={{ marginRight: 12, color: sidebarTab === 'global' ? theme.palette.primary.main : theme.palette.text.secondary }} />
                                <ListItemText primary="Global Default" primaryTypographyProps={{ fontWeight: sidebarTab === 'global' ? 800 : 500 }} />
                            </ListItem>

                            <Divider />

                            {templates.map((tpl) => (
                                <ListItem
                                    key={tpl.id}
                                    button
                                    selected={sidebarTab === tpl.institution_type}
                                    onClick={() => handleSidebarChange(tpl.institution_type)}
                                    sx={{ py: 2 }}
                                >
                                    <Building size={20} style={{ marginRight: 12, color: sidebarTab === tpl.institution_type ? theme.palette.primary.main : theme.palette.text.secondary }} />
                                    <ListItemText primary={tpl.institution_type} primaryTypographyProps={{ fontWeight: sidebarTab === tpl.institution_type ? 800 : 500 }} />
                                    <ListItemSecondaryAction>
                                        <IconButton size="small" edge="end" color="error" onClick={() => handleDeleteTemplate(tpl.id, tpl.institution_type)}>
                                            <Trash size={16} />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}

                            <ListItem button onClick={() => setIsAddDialogOpen(true)} sx={{ py: 2, color: theme.palette.primary.main }}>
                                <Add size={20} style={{ marginRight: 12 }} />
                                <ListItemText primary="Add New Template" primaryTypographyProps={{ fontWeight: 700 }} />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

                {/* Main Panel */}
                <Grid item xs={12} md={9}>
                    <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                        <Tabs
                            value={activeTab}
                            onChange={(_, newValue) => setActiveTab(newValue)}
                            sx={{
                                px: 3,
                                pt: 1,
                                bgcolor: alpha(theme.palette.primary.main, 0.03),
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                '& .MuiTab-root': {
                                    fontWeight: 700,
                                    minHeight: 56,
                                    fontSize: '0.9rem'
                                }
                            }}
                        >
                            <Tab label="INTERNAL EVALUATION" />
                            <Tab label="EXTERNAL EVALUATION" />
                        </Tabs>

                        <Box sx={{ p: 4 }}>
                            <Stack spacing={4}>
                                <Box>
                                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Setting2 size={20} color={theme.palette.primary.main} />
                                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                                {sidebarTab === 'global' ? 'Global Default' : sidebarTab} : {activeTab === 0 ? 'Internal' : 'External'} Indicators
                                            </Typography>
                                            <Chip label={`${currentCriteria[currentCategory].length} Columns`} size="small" color="primary" />
                                        </Box>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<AddCircle size={16} />}
                                            onClick={() => handleAddColumn(currentCategory)}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Add Column
                                        </Button>
                                    </Box>

                                    <Grid container spacing={3}>
                                        {currentCriteria[currentCategory].map((criterion, index) => (
                                            <Grid item xs={12} md={6} lg={4} key={criterion.key}>
                                                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.grey[50], 0.5), transition: 'all 0.2s', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02), borderColor: theme.palette.primary.main } }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                        <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.disabled' }}>
                                                            COLUMN {index + 1}
                                                        </Typography>
                                                        <IconButton size="small" color="error" onClick={() => handleRemoveColumn(currentCategory, index)}>
                                                            <Trash size={16} />
                                                        </IconButton>
                                                    </Box>
                                                    <Stack spacing={2.5}>
                                                        <TextField
                                                            select
                                                            fullWidth
                                                            label="Input Type"
                                                            value={criterion.type || 'number'}
                                                            onChange={(e) => handleLabelChange(currentCategory, index, 'type', e.target.value)}
                                                            size="small"
                                                        >
                                                            <MenuItem value="number">Numeric (0-100)</MenuItem>
                                                            <MenuItem value="text">Text / Description</MenuItem>
                                                            <MenuItem value="select">Dropdown Selection</MenuItem>
                                                        </TextField>
                                                        <TextField
                                                            fullWidth
                                                            label="Column Label"
                                                            value={criterion.label}
                                                            onChange={(e) => handleLabelChange(currentCategory, index, 'label', e.target.value)}
                                                            placeholder="e.g. Soft Skill"
                                                            size="small"
                                                        />
                                                        <TextField
                                                            fullWidth
                                                            multiline
                                                            rows={2}
                                                            label="Helper Text"
                                                            value={criterion.description}
                                                            onChange={(e) => handleLabelChange(currentCategory, index, 'description', e.target.value)}
                                                            placeholder="Instructions..."
                                                            size="small"
                                                        />
                                                        {criterion.type === 'select' && (
                                                            <TextField
                                                                fullWidth
                                                                label="Options (comma separated)"
                                                                value={criterion.options?.join(', ') || ''}
                                                                onChange={(e) => handleLabelChange(currentCategory, index, 'options', e.target.value.split(',').map(s => s.trim()))}
                                                                placeholder="Excellent, Good, Average, Poor"
                                                                size="small"
                                                                helperText="Separate options with commas"
                                                            />
                                                        )}
                                                    </Stack>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>

                                <Divider />

                                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                        <Box sx={{ bgcolor: theme.palette.info.main, p: 0.5, borderRadius: 1 }}>
                                            <Setting2 size={16} color="#fff" />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.info.dark }}>Implementation Info</Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1.6 }}>
                                                {sidebarTab === 'global'
                                                    ? 'This global template is used as the fallback if an intern does not have an institution-specific template.'
                                                    : `This specific template applies only to interns from "${sidebarTab}". It overrides the global defaults.`}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Add New Template Dialog */}
            <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>Create New Template</DialogTitle>
                <DialogContent>
                    <Box sx={{ py: 1 }}>
                        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                            Enter the Institution Type (must match exactly with the value in the user profile).
                        </Typography>
                        <TextField
                            fullWidth
                            label="Institution Type"
                            placeholder="e.g. SMK, UNIVERSITAS, KABUPATEN"
                            value={newInstType}
                            onChange={(e) => setNewInstType(e.target.value)}
                            autoFocus
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddNewTemplate}
                        disabled={!newInstType || saving}
                        sx={{ borderRadius: 2 }}
                    >
                        Create Template
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AssessmentSettings;
