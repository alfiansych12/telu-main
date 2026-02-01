'use client';

import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Stack,
    IconButton,
    CircularProgress,
    Paper,
    Tooltip,
    Badge,
    Grid,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
    CloseCircle,
    Timer1,
    DocumentDownload,
    UserTick,
    InfoCircle,
    Calendar,
} from 'iconsax-react';
import { motion, AnimatePresence } from 'framer-motion';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getImportHistory } from 'utils/api/import-participants';

interface ImportHistoryDialogProps {
    open: boolean;
    onClose: () => void;
}

const ImportHistoryDialog = ({ open, onClose }: ImportHistoryDialogProps) => {
    const theme = useTheme();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            loadHistory();
        }
    }, [open]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await getImportHistory();
            setHistory(data);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setLoading(false);
        }
    };

    const parseLogDetails = (log: any) => {
        if (!log.details) return {};
        if (typeof log.details === 'object') return log.details;
        try {
            return JSON.parse(log.details);
        } catch (e) {
            return {};
        }
    };

    const handleDownloadAccounts = async (log: any) => {
        const details = parseLogDetails(log);
        const accounts = details?.accounts;
        if (!accounts || !Array.isArray(accounts)) return;

        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet('🔑 Participant Accounts');

        ws.columns = [
            { header: 'Full Name', key: 'name', width: 35 },
            { header: 'Username / Email', key: 'email', width: 35 },
            { header: 'Default Password', key: 'password', width: 25 },
            { header: 'Internship Unit', key: 'unit', width: 30 }
        ];

        const headerRow = ws.getRow(1);
        headerRow.height = 35;
        headerRow.eachCell(c => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE31E24' } }; // Telkom Red
            c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            c.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        accounts.forEach(acc => {
            const r = ws.addRow([acc.name, acc.email, acc.password, acc.unit]);
            r.height = 25;
            r.eachCell(c => {
                c.alignment = { vertical: 'middle' };
                c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            });
        });

        const tipRow = ws.rowCount + 2;
        ws.mergeCells(`A${tipRow}:D${tipRow}`);
        const tipCell = ws.getCell(`A${tipRow}`);
        tipCell.value = '💡 IMPORTANT: Passwords can be changed independently by participants via the Profile menu.';
        tipCell.font = { italic: true, bold: true, color: { argb: 'FFE31E24' } };

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = `PARTICIPANT_ACCOUNTS_BATCH_${new Date(log.created_at).getTime()}.xlsx`;
        saveAs(new Blob([buffer]), filename);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                }
            }}
        >
            <Box sx={{
                p: 3,
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                color: 'white',
                position: 'relative'
            }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                    >
                        <Box sx={{
                            p: 1.5,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            borderRadius: 3,
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                            border: '1px solid rgba(255, 255, 255, 0.18)'
                        }}>
                            <Timer1 size={32} variant="Bold" />
                        </Box>
                    </motion.div>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>Import History</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <UserTick size={16} variant="Bold" /> Automatic Account Creation Activity
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                        <CloseCircle size={24} />
                    </IconButton>
                </Stack>
            </Box>

            <DialogContent sx={{ p: 4, bgcolor: '#fdfdfd' }}>
                {loading ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
                        <CircularProgress color="secondary" size={60} thickness={4} />
                        <Typography sx={{ mt: 2, fontWeight: 700, color: theme.palette.text.secondary }}>Fetching Data...</Typography>
                    </Stack>
                ) : history.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 12 }}>
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                            <Stack alignItems="center">
                                <Box sx={{
                                    width: 120, height: 120,
                                    bgcolor: alpha(theme.palette.secondary.light, 0.1),
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    mb: 3
                                }}>
                                    <Timer1 size={64} color={theme.palette.secondary.light} variant="Bulk" />
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>History Empty</Typography>
                                <Typography color="textSecondary" sx={{ mt: 1, maxWidth: 300, fontWeight: 500 }}>
                                    No bulk import activities recorded in the system yet.
                                </Typography>
                            </Stack>
                        </motion.div>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        <AnimatePresence>
                            {history.map((item, index) => {
                                const details = parseLogDetails(item);
                                const hasAccounts = !!details?.accounts;
                                return (
                                    <Grid item xs={12} key={item.id}>
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 0,
                                                    borderRadius: 4,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    overflow: 'hidden',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        borderColor: theme.palette.secondary.main,
                                                        boxShadow: `0 10px 20px ${alpha(theme.palette.secondary.main, 0.08)}`,
                                                        transform: 'translateY(-4px)'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                                                    <Box sx={{
                                                        p: 3,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        bgcolor: alpha(theme.palette.secondary.main, 0.04),
                                                        minWidth: 100,
                                                        borderRight: `1px solid ${theme.palette.divider}`
                                                    }}>
                                                        <Typography variant="h3" sx={{ fontWeight: 900, color: theme.palette.secondary.main }}>
                                                            {details?.count || 0}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ fontWeight: 800, color: alpha(theme.palette.secondary.main, 0.6), textTransform: 'uppercase' }}>
                                                            Participants
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ p: 2.5, flexGrow: 1 }}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                                                            <Box>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: theme.palette.text.primary, mb: 0.5 }}>
                                                                    Batch Import #{history.length - index}
                                                                </Typography>
                                                                <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                                                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: theme.palette.text.secondary, fontWeight: 600 }}>
                                                                        <Calendar size={14} variant="Bold" />
                                                                        {new Date(item.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                        {' • '}
                                                                        {new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: theme.palette.text.secondary, fontWeight: 600 }}>
                                                                        <UserTick size={14} variant="Bold" /> {item.user?.name || 'Admin'}
                                                                    </Typography>
                                                                </Stack>
                                                            </Box>

                                                            {hasAccounts ? (
                                                                <Tooltip title="Account Data Available for Download">
                                                                    <Box sx={{ color: theme.palette.success.main, display: 'flex' }}>
                                                                        <Badge color="success" variant="dot">
                                                                            <InfoCircle size={20} variant="Bold" />
                                                                        </Badge>
                                                                    </Box>
                                                                </Tooltip>
                                                            ) : (
                                                                <Tooltip title="Old Log: Account data not stored in the database">
                                                                    <Box sx={{ color: theme.palette.warning.main, display: 'flex' }}>
                                                                        <InfoCircle size={20} variant="Bold" />
                                                                    </Box>
                                                                </Tooltip>
                                                            )}
                                                        </Stack>

                                                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                                                            <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#f0f0f0', borderRadius: 1.5 }}>
                                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#666' }}>
                                                                    {details?.unit_ids?.length || 0} Target Units
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ px: 1.5, py: 0.5, bgcolor: alpha(theme.palette.success.light, 0.1), borderRadius: 1.5 }}>
                                                                <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.success.dark }}>
                                                                    Status: Success
                                                                </Typography>
                                                            </Box>
                                                        </Stack>

                                                        <Button
                                                            fullWidth
                                                            variant={hasAccounts ? "contained" : "outlined"}
                                                            color="secondary"
                                                            disabled={!hasAccounts}
                                                            startIcon={hasAccounts ? <DocumentDownload size={18} variant="Bold" /> : <InfoCircle size={18} />}
                                                            onClick={() => handleDownloadAccounts(item)}
                                                            sx={{
                                                                fontWeight: 900,
                                                                borderRadius: 2,
                                                                height: 42,
                                                                transition: '0.3s',
                                                                boxShadow: hasAccounts ? `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}` : 'none',
                                                                '&:hover': {
                                                                    transform: hasAccounts ? 'scale(1.02)' : 'none',
                                                                    boxShadow: hasAccounts ? `0 6px 16px ${alpha(theme.palette.secondary.main, 0.4)}` : 'none',
                                                                }
                                                            }}
                                                        >
                                                            {hasAccounts ? 'DOWNLOAD PARTICIPANT ACCOUNTS' : 'ACCOUNT DATA NOT AVAILABLE'}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </motion.div>
                                    </Grid>
                                );
                            })}
                        </AnimatePresence>
                    </Grid>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: '#fff', borderTop: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500, flexGrow: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <InfoCircle size={14} /> Showing historical import data stored in system audit logs.
                </Typography>
                <Button
                    onClick={onClose}
                    variant="contained"
                    color="inherit"
                    sx={{
                        fontWeight: 900,
                        px: 4,
                        borderRadius: 3,
                        bgcolor: '#f0f0f0',
                        color: '#666',
                        '&:hover': { bgcolor: '#e0e0e0' }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImportHistoryDialog;
