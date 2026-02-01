import React from 'react';
import { Box, Card, Typography, Stack, Button } from '@mui/material';


export default function VerifyPage({ params }: { params: { id: string } }) {
    const certId = params.id;

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            p: 3
        }}>
            <Card sx={{
                maxWidth: 500,
                width: '100%',
                p: 4,
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                {/* Logo Placeholder - assuming public/telkom-logo.png exists */}
                <Box mb={3} display="flex" justifyContent="center">
                    {/* Using simple img tag for safety if next/image config issues exist */}
                    <img src="/telkom-logo.png" alt="Telkom University" style={{ width: 80, height: 'auto' }} />
                </Box>

                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#BE1E2D' }}>
                    Certificate Verification
                </Typography>

                <Box my={4} p={3} bgcolor="#e8f5e9" borderRadius={2} border="1px solid #81c784">
                    <Typography variant="h4" color="success.main" fontWeight="bold" sx={{ mb: 1 }}>
                        ✓ VALID
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Certificate ID: {decodeURIComponent(certId)}
                    </Typography>
                </Box>

                <Stack spacing={2} sx={{ textAlign: 'left', px: 2 }}>
                    <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Program:</Typography>
                        <Typography fontWeight="bold">PUTI Internship</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Issued By:</Typography>
                        <Typography fontWeight="bold">Telkom University</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Status:</Typography>
                        <Typography color="success.main" fontWeight="bold">Officially Issued</Typography>
                    </Box>
                </Stack>

                <Button variant="contained" sx={{ mt: 5, borderRadius: 3, bgcolor: '#BE1E2D', '&:hover': { bgcolor: '#9a1d28' } }} href="/" fullWidth>
                    Back to Home
                </Button>
            </Card>
        </Box>
    );
}
