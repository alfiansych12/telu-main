'use client';

import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Paper
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Calendar } from 'iconsax-react';
import { formatDate } from 'utils/format';
import { FormattedMessage } from 'react-intl';

interface InternshipWaitingStateProps {
    userProfile: any;
    timeLeft: { days: number; hours: number; minutes: number; seconds: number } | null;
}

const InternshipWaitingState = ({ userProfile, timeLeft }: InternshipWaitingStateProps) => {
    const theme = useTheme();

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            textAlign: 'center',
            px: 3
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{
                    width: 120,
                    height: 120,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    mx: 'auto'
                }}>
                    <Calendar size={60} color={theme.palette.primary.main} variant="Bulk" />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                    <FormattedMessage id="internship.waiting.title" />
                </Typography>
                <Typography variant="h5" color="textSecondary" sx={{ mb: 4, maxWidth: 500 }}>
                    <FormattedMessage
                        id="internship.waiting.msg"
                        values={{
                            date: (
                                <strong style={{ color: theme.palette.primary.main }}>
                                    {userProfile?.internship_start ? formatDate(userProfile.internship_start) : '-'}
                                </strong>
                            )
                        }}
                    />
                </Typography>

                {timeLeft && (
                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
                        {[
                            { label: <FormattedMessage id="internship.waiting.days" />, value: timeLeft.days },
                            { label: <FormattedMessage id="internship.waiting.hours" />, value: timeLeft.hours },
                            { label: <FormattedMessage id="internship.waiting.minutes" />, value: timeLeft.minutes },
                            { label: <FormattedMessage id="internship.waiting.seconds" />, value: timeLeft.seconds }
                        ].map((item, index) => (
                            <Box key={index} sx={{
                                width: 80,
                                py: 1.5,
                                borderRadius: 3,
                                bgcolor: index === 0 ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                                color: index === 0 ? '#fff' : theme.palette.primary.main,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                boxShadow: index === 0 ? `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}` : 'none'
                            }}>
                                <Typography variant="h4" sx={{ fontWeight: 800 }}>{String(item.value).padStart(2, '0')}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8 }}>{item.label}</Typography>
                            </Box>
                        ))}
                    </Stack>
                )}

                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: alpha(theme.palette.primary.lighter, 0.2), border: `1px dashed ${theme.palette.primary.main}` }}>
                    <Typography variant="body1">
                        <FormattedMessage id="internship.waiting.footer" />
                    </Typography>
                </Paper>
            </motion.div>
        </Box>
    );
};

export default InternshipWaitingState;
