'use client';

import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Button,
    CircularProgress
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Calendar, Award } from 'iconsax-react';

import { FormattedMessage, FormattedDate } from 'react-intl';

interface ParticipantDashboardHeaderProps {
    certEligibility: any;
    certLoading: boolean;
    onDownloadCertificate: () => Promise<void>;
}

const ParticipantDashboardHeader = ({
    certEligibility,
    certLoading,
    onDownloadCertificate
}: ParticipantDashboardHeaderProps) => {
    const theme = useTheme();

    return (
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    <FormattedMessage id="dashboard.participant.title" />
                </Typography>
                {certEligibility?.eligible && (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={certLoading ? <CircularProgress size={16} color="inherit" /> : <Award variant="Bold" size={18} />}
                        disabled={certLoading}
                        onClick={onDownloadCertificate}
                        sx={{
                            borderRadius: 2,
                            px: 2,
                            py: 0.5,
                            fontSize: '0.8rem',
                            textTransform: 'none',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                            background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                            '&:hover': {
                                background: `linear-gradient(45deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                            }
                        }}
                    >
                        <FormattedMessage id="dashboard.participant.download_cert" /> 🎓
                    </Button>
                )}
            </Stack>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                bgcolor: alpha(theme.palette.primary.lighter, 0.2),
                px: 2,
                py: 1,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}>
                <Calendar size={20} color={theme.palette.primary.main} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.darker }}>
                    <FormattedDate value={new Date()} day="numeric" month="long" year="numeric" />
                </Typography>
            </Box>
        </Box>
    );
};

export default ParticipantDashboardHeader;
