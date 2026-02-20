'use client';

import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Grid,
    Paper,
    Avatar,
    Button,
    CircularProgress
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Award } from 'iconsax-react';
import { formatDate } from 'utils/format';
import { FormattedMessage } from 'react-intl';

interface InternshipFinishedStateProps {
    userProfile: any;
    certEligibility: any;
    certEligibilityLoading: boolean;
    certLoading: boolean;
    onDownloadCertificate: () => Promise<void>;
}

const InternshipFinishedState = ({
    userProfile,
    certEligibility,
    certEligibilityLoading,
    certLoading,
    onDownloadCertificate
}: InternshipFinishedStateProps) => {
    const theme = useTheme();

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            textAlign: 'center',
            px: 3,
            background: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.lighter, 0.3)} 0%, transparent 70%)`
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
            >
                <Box sx={{ position: 'relative', mb: 4 }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        style={{ position: 'absolute', top: -20, left: -20, right: -20, bottom: -20, border: `2px dashed ${alpha(theme.palette.success.main, 0.3)}`, borderRadius: '50%' }}
                    />
                    <Avatar sx={{
                        width: 120,
                        height: 120,
                        bgcolor: theme.palette.success.main,
                        mx: 'auto',
                        boxShadow: `0 12px 32px ${alpha(theme.palette.success.main, 0.4)}`,
                        fontSize: '4rem'
                    }}>
                        🎓
                    </Avatar>
                </Box>

                <Typography variant="h1" sx={{ fontWeight: 900, mb: 1, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    <FormattedMessage id="internship.finished.title" />
                </Typography>

                <Typography variant="h4" color="textSecondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto', fontWeight: 500 }}>
                    <FormattedMessage
                        id="internship.finished.msg"
                        values={{
                            unit: <strong>{userProfile?.unit?.name || 'Telkom University'}</strong>,
                            date: userProfile?.internship_end ? formatDate(userProfile.internship_end) : '-'
                        }}
                    />
                </Typography>

                {/* Performance Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Paper elevation={0} sx={{
                        p: 4,
                        mb: 5,
                        borderRadius: 5,
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${theme.palette.divider}`,
                        maxWidth: 500,
                        mx: 'auto',
                        boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.05)}`
                    }}>
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    <FormattedMessage id="internship.finished.score" />
                                </Typography>
                                <Typography variant="h2" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                                    {certEligibilityLoading ? <CircularProgress size={24} /> : (certEligibility?.eligible && certEligibility.data ? certEligibility.data.score : '-')}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    <FormattedMessage id="internship.finished.scale" />
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    <FormattedMessage id="internship.finished.predicate" />
                                </Typography>
                                <Typography variant="h2" sx={{ fontWeight: 800, color: theme.palette.success.main }}>
                                    {certEligibilityLoading ? <CircularProgress size={24} /> : (certEligibility?.eligible && certEligibility.data ? certEligibility.data.grade : '-')}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    <FormattedMessage id="internship.finished.outcome" />
                                </Typography>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                <FormattedMessage id="internship.finished.thank_you" />
                            </Typography>
                            <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 700 }}>
                                <FormattedMessage id="internship.finished.team" />
                            </Typography>
                        </Box>
                    </Paper>
                </motion.div>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={certLoading ? <CircularProgress size={20} color="inherit" /> : <Award variant="Bold" />}
                        disabled={certLoading}
                        sx={{
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                        }}
                        onClick={onDownloadCertificate}
                    >
                        <FormattedMessage id="internship.finished.download_cert" />
                    </Button>
                </Stack>
            </motion.div>
        </Box>
    );
};

export default InternshipFinishedState;
