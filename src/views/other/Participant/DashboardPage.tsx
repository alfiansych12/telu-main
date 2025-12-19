'use client';

import React from 'react';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { Button, Box, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Main } from 'next/document';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


const DashboardAttendance = () => {
  const theme = useTheme();
  // Koordinat lokasi Telkom University
  const position: [number, number] = [-6.974580, 107.630910];
  const address = 'Jl. Telekomunikasi No.1, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257';


  const [attendance, setAttendance] = React.useState<Array<{date: string, day: string, checkIn: string, status: string}>>([]);
  const [checkedIn, setCheckedIn] = React.useState(false);
  const [activityPlan, setActivityPlan] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleCheckIn = () => {
    setLoading(true);
    setTimeout(() => {
      const now = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const date = now.toISOString().slice(0, 10);
      const day = days[now.getDay()];
      const checkIn = now.toTimeString().slice(0,5);
      setAttendance([
        ...attendance,
        { date, day, checkIn, status: 'Present' }
      ]);
      setCheckedIn(true);
      setLoading(false);
    }, 1200);
  };

  const handleCheckOut = () => {
    // Dummy: tidak update tabel, hanya reset form
    setCheckedIn(false);
    setActivityPlan('');
  };

  return (
    <>
    
      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Today's Attendance
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, mb: 2 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1">Loading...</Typography>
          </Box>
        ) : !checkedIn ? (
          <>
            <Box sx={{ width: '100%', height: 320, mb: 2, borderRadius: 2, overflow: 'hidden' }}>
              <MapContainer center={position} zoom={17} style={{ width: '100%', height: '100%' }} scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                  <Popup>
                    {address}
                  </Popup>
                </Marker>
              </MapContainer>
            </Box>
            <Button variant="contained" color="primary" fullWidth size="large" onClick={handleCheckIn}>
              Check In Now
            </Button>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Today's Activity Plan</Typography>
              <textarea
                value={activityPlan}
                onChange={e => setActivityPlan(e.target.value)}
                placeholder="Describe your activity plan..."
                style={{ width: '100%', minHeight: 80, padding: 8, borderRadius: 8, border: '1px solid #ccc', resize: 'vertical' }}
              />
            </Box>
            <Button variant="contained" color="secondary" size="large" sx={{ height: 56 }} onClick={handleCheckOut}>
              Check Out
            </Button>
          </Box>
        )}
      </MainCard>

      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Attendance History
        </Typography>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f5f5f5' }}>
            <tr>
              <th style={{ padding: 8, textAlign: 'left' }}>Date</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Day</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Check-In</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Check-Out</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Working Hours</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Activity Plan</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 16, textAlign: 'center' }}>No attendance records available.</td>
              </tr>
            ) : (
              attendance.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ padding: 8 }}>{row.date}</td>
                  <td style={{ padding: 8 }}>{row.day}</td>
                  <td style={{ padding: 8 }}>{row.checkIn}</td>
                  <td style={{ padding: 8 }}>-</td>
                  <td style={{ padding: 8 }}>-</td>
                  <td style={{ padding: 8 }}>{row.status}</td>
                  <td style={{ padding: 8 }}>-</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </MainCard>
    </>
  );
};

export default DashboardAttendance;

