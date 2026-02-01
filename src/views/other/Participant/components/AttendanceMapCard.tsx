'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Chip, CircularProgress } from '@mui/material';
import { Location } from 'iconsax-react';
import MainCard from 'components/MainCard';

const MapComponent = dynamic(() => import('components/MapComponent'), {
    ssr: false,
    loading: () => (
        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <CircularProgress />
        </Box>
    )
});

interface AttendanceMapCardProps {
    adminPosition: [number, number];
    adminAddress: string;
    userLocation: [number, number] | null;
    adminRadius: number;
}

const AttendanceMapCard = ({
    adminPosition,
    adminAddress,
    userLocation,
    adminRadius
}: AttendanceMapCardProps) => {
    return (
        <MainCard title="Attendance Map" secondary={<Chip icon={<Location size={16} />} label={adminAddress} variant="outlined" size="small" />}>
            <Box sx={{ height: 400, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                <MapComponent
                    position={adminPosition}
                    address={adminAddress}
                    userPosition={userLocation}
                    radius={adminRadius}
                />
            </Box>
        </MainCard>
    );
};

export default AttendanceMapCard;
