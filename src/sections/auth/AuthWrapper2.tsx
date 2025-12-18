'use client';;
import { ReactElement } from 'react';

// MATERIAL - UI
import Grid from '@mui/material/Grid';
import AuthCard from './AuthCard';
import Image from 'next/image';
import { Typography } from '@mui/material';

import { withBasePath } from 'utils/path';

const logoSatu = withBasePath('/assets/images/auth/situ-crop.png');
const logoSatuPowered = withBasePath('/assets/images/auth/auth-logo.png');

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

interface Props {
  children: ReactElement;
}

// Bokeh Background Component
const BokehBackground = () => {
  const circles = [
    { top: '12%', left: '33%', color: '#6c757d', duration: '8s', delay: '-1s', origin: '15vw -5vh' },
    { top: '40%', left: '50%', color: '#6a0417', duration: '13s', delay: '-3s', origin: '5vw 10vh' },
    { top: '25%', left: '75%', color: '#263238', duration: '17s', delay: '-4s', origin: '-20vw 15vh' },
    { top: '80%', left: '10%', color: '#6c757d', duration: '23s', delay: '-0s', origin: '10vw -15vh' },
    { top: '5%', left: '20%', color: '#6a0417', duration: '8s', delay: '-2s', origin: '-10vw 5vh' },
    { top: '55%', left: '80%', color: '#263238', duration: '13s', delay: '-5s', origin: '0vw 20vh' },
    { top: '70%', left: '30%', color: '#6c757d', duration: '18s', delay: '-1s', origin: '20vw 10vh' },
    { top: '15%', left: '45%', color: '#6a0417', duration: '23s', delay: '-3s', origin: '15vw -10vh' },
    { top: '60%', left: '70%', color: '#263238', duration: '8s', delay: '-2s', origin: '-5vw 5vh' },
    { top: '35%', left: '55%', color: '#6c757d', duration: '13s', delay: '-4s', origin: '10vw 20vh' }
  ];

  return (
    <div className="relative w-screen h-screen bg-[#171717] overflow-hidden background-bokeh">
      {circles.map((circle, index) => (
        <span
          key={index}
          className={`absolute rounded-full animate-move circle-${index}`}
          style={{
            top: circle.top,
            left: circle.left,
            backgroundColor: circle.color,
            animationDuration: circle.duration,
            animationDelay: circle.delay,
            transformOrigin: circle.origin
          }}
        ></span>
      ))}
    </div>
  );
};

// Main Component
const AuthWrapper2 = ({ children }: Props) => {
  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ height: '100vh', bgcolor: 'background.paper' }}>
      {/* Side image for large screens */}
      <Grid
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: '68%',
          bgcolor: 'black',
          height: '100%'
        }}
      >
        <BokehBackground />
        <div className="absolute bottom-24 left-28 text-white">
          <Image src={logoSatu} alt="Satu Logo" width={150} height={150} />
          <br />
          <Typography sx={{ fontWeight: 'regular', fontSize: 22 }}>Selamat Datang di</Typography>
          <Typography sx={{ fontWeight: 500, fontSize: 56 }}>Tel-U Satu</Typography>
          <Typography sx={{ fontWeight: 'regular', fontSize: 16 }}>
            ♦ One Data <br />♦ One App <br />♦ One Network
            <br /> ♦ One Platform <br />♦ One Screen
          </Typography>
          <br />
          <Image src={logoSatuPowered} alt="Satu Logo" width={200} height={200} />
        </div>
      </Grid>

      {/* Auth card container */}
      <Grid
        item
        sx={{
          width: { xs: '100%', lg: '32%' },
          display: 'flex',
          justifyContent: 'center',
          height: 1
        }}
      >
        <AuthCard border={false}>{children}</AuthCard>
      </Grid>
    </Grid>
  );
};

export default AuthWrapper2;
