'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// MATERIAL - UI
import {
  Grid,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { createNotification } from 'utils/api/notifications';

// PROJECT IMPORTS
import { createAttendance, updateAttendance } from 'utils/api/attendances';
import { getCertificateEligibility } from 'utils/api/certificate';
import { openAlert } from 'api/alert';
import OutAreaRequestDialog from 'components/OutAreaRequestDialog';
import LeaveRequestDialog from 'components/LeaveRequestDialog';
import { generateCertificatePDF } from 'utils/certificateGenerator';
import { formatInJakarta } from 'utils/date-tz';
import { getParticipantDashboardData } from 'utils/api/batch';
import { AttendanceWithRelations } from 'types/api';

// LOCAL COMPONENTS
import InternshipWaitingState from './components/InternshipWaitingState';
import InternshipFinishedState from './components/InternshipFinishedState';
import ParticipantDashboardHeader from './components/ParticipantDashboardHeader';
import ParticipantStatusCards from './components/ParticipantStatusCards';
import AttendanceMapCard from './components/AttendanceMapCard';
import AttendanceHistoryTable from './components/AttendanceHistoryTable';
import TodayAttendanceActionCard from './components/TodayAttendanceActionCard';

import { useIntl, FormattedMessage } from 'react-intl';

const DashboardAttendance = () => {
  const queryClient = useQueryClient();
  const intl = useIntl();
  const [outAreaDialogOpen, setOutAreaDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [activityPlan, setActivityPlan] = useState('');
  const [attendancePhoto, setAttendancePhoto] = useState<string | null>(null);
  const [forceCheckedOut, setForceCheckedOut] = useState(false);
  const [todayAttendanceId, setTodayAttendanceId] = useState<string | null>(null);
  const today = formatInJakarta(new Date(), 'yyyy-MM-dd');
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const [certLoading, setCertLoading] = useState(false);

  // Batch fetch all dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['participant-dashboard-data', userId, today],
    queryFn: () => getParticipantDashboardData(userId, today),
    enabled: !!userId,
    staleTime: 60000, // 1 minute stale time
    refetchOnWindowFocus: false // Reduce server load
  });

  const userProfile = dashboardData?.userProfile;
  const locationSettings = dashboardData?.locationSettings;
  const todayRequests = dashboardData?.todayRequests;
  const attendanceData = dashboardData?.attendanceData;
  const certEligibility = dashboardData?.certEligibility;

  const profileLoading = dashboardLoading;
  const attendanceLoading = dashboardLoading;
  const certEligibilityLoading = dashboardLoading;

  const adminPosition: [number, number] = locationSettings ? [locationSettings.latitude, locationSettings.longitude] : [-6.974580, 107.630910];
  const adminAddress = locationSettings?.address || 'Jl. Telekomunikasi No.1, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257';
  const adminRadius = locationSettings?.radius || 100;

  const latestRequest = todayRequests?.[0];
  const isPending = latestRequest?.status === 'pending';
  const isRejected = latestRequest?.status === 'rejected';

  // Check if user has checked in today
  const todayAttendance = useMemo(() => {
    const attendances = Array.isArray(attendanceData) ? attendanceData : (attendanceData?.data || []);
    return attendances.find((a: AttendanceWithRelations) => {
      if (!a.date) return false;
      const attDate = formatInJakarta(a.date, 'yyyy-MM-dd');
      return attDate === today;
    });
  }, [attendanceData, today]);

  useEffect(() => {
    if (todayAttendance) {
      setTodayAttendanceId(todayAttendance.id);
    }
  }, [todayAttendance]);

  const checkedIn = !!todayAttendance?.check_in_time;
  const checkedOut = !!todayAttendance?.check_out_time || forceCheckedOut;
  const isOnLeave = todayAttendance?.status === 'sick' || todayAttendance?.status === 'permit';

  // Internship Status Logic
  const internshipStatus = useMemo(() => {
    if (!userProfile) return 'active';
    const todayDate = new Date();
    if (userProfile.internship_start) {
      const startDate = new Date(userProfile.internship_start);
      startDate.setHours(8, 0, 0, 0);
      if (todayDate < startDate) return 'waiting';
    }
    const hasAssessment = (userProfile as any)?.assessments?.length > 0;
    if (userProfile.internship_end) {
      const endDate = new Date(userProfile.internship_end);
      endDate.setHours(23, 59, 59, 999);
      if (todayDate > endDate || hasAssessment) return 'finished';
    } else if (hasAssessment) {
      return 'finished';
    }
    return 'active';
  }, [userProfile]);

  // Get user's current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Attendance Rate
  const calcAttendanceRate = useMemo(() => {
    const records = Array.isArray(attendanceData) ? attendanceData : (attendanceData?.data || []);
    if (records.length === 0) return 0;
    const presentCount = records.filter((p: AttendanceWithRelations) => p.status === 'present' || p.status === 'late').length;
    return Math.round((presentCount / records.length) * 100);
  }, [attendanceData]);

  // Countdown Logic
  useEffect(() => {
    if (internshipStatus !== 'waiting' || !userProfile?.internship_start) return;
    const targetDate = new Date(userProfile.internship_start);
    targetDate.setHours(8, 0, 0, 0);
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft(null);
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [internshipStatus, userProfile, queryClient]);

  // Distance Calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const dPhi = (lat2 - lat1) * Math.PI / 180;
    const dLambda = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const isOutOfArea = useMemo(() => {
    if (!userLocation) return false;
    const distanceToAdmin = calculateDistance(userLocation[0], userLocation[1], adminPosition[0], adminPosition[1]);
    const isInApprovedArea = todayRequests?.some(req => {
      if (req.status !== 'approved') return false;
      const dist = calculateDistance(userLocation[0], userLocation[1], Number(req.latitude) || 0, Number(req.longitude) || 0);
      return dist <= 100;
    });
    return distanceToAdmin > adminRadius && !isInApprovedArea;
  }, [userLocation, adminPosition, adminRadius, todayRequests]);

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      return createAttendance({
        user_id: userId,
        date: today,
        check_in_time: now,
        // Don't set status here - let backend determine based on time
        activity_description: JSON.stringify({ check_in_location: userLocation })
      } as any);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['participant-dashboard-data'] });
      setTodayAttendanceId(data.id);

      // Show different message based on status
      let message = intl.formatMessage({ id: 'dashboard.attendance.checkin_success' });
      let variant: 'success' | 'warning' | 'error' = 'success';

      if (data.status === 'late') {
        message = intl.formatMessage({ id: 'dashboard.attendance.checkin_late' });
        variant = 'warning';
      } else if (data.status === 'absent') {
        message = intl.formatMessage({ id: 'dashboard.attendance.checkin_absent' });
        variant = 'error';
      }

      openAlert({ title: intl.formatMessage({ id: 'Check In' }) + '!', message, variant });
    },
    onError: (error: any) => {
      openAlert({
        title: intl.formatMessage({ id: 'dashboard.attendance.checkin_error' }),
        message: error.message || intl.formatMessage({ id: 'dashboard.attendance.checkin_error' }),
        variant: 'error'
      });
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      let existingData = {};
      try {
        existingData = todayAttendance?.activity_description ? JSON.parse(todayAttendance.activity_description) : {};
      } catch (e) {
        existingData = { notes: todayAttendance?.activity_description };
      }
      return updateAttendance(todayAttendanceId!, {
        check_out_time: now,
        activity_description: JSON.stringify({ ...existingData, plan: activityPlan, photo: attendancePhoto })
      });
    },
    onSuccess: () => {
      setForceCheckedOut(true);
      queryClient.invalidateQueries({ queryKey: ['participant-dashboard-data'] });
      openAlert({
        title: intl.formatMessage({ id: 'Successfully Checked Out!' }),
        message: intl.formatMessage({ id: 'dashboard.attendance.checkout_success' }),
        variant: 'success'
      });
    },
    onError: (error: any) => {
      let errorMsg = error.message || intl.formatMessage({ id: 'dashboard.attendance.checkout_error' });
      if (errorMsg.includes('Body exceeded 1 MB limit')) {
        errorMsg = intl.formatMessage({ id: 'dashboard.attendance.photo_too_large' });
      }
      openAlert({ title: intl.formatMessage({ id: 'dashboard.attendance.checkout_error' }), message: errorMsg, variant: 'error' });
    }
  });

  const handleCheckIn = () => {
    // Only block if we already have a check-in time recorded
    const alreadyCheckedIn = !!todayAttendance?.check_in_time;
    if (!userId || alreadyCheckedIn || checkInMutation.isPending) return;

    if (!userLocation) {
      openAlert({
        title: intl.formatMessage({ id: 'Location Required' }),
        message: intl.formatMessage({ id: 'dashboard.attendance.location_required' }),
        variant: 'warning'
      });
      return;
    }
    if (isOutOfArea) {
      setOutAreaDialogOpen(true);
      return;
    }
    checkInMutation.mutate();
  };

  // ATTENDANCE REMINDER LOGIC
  useEffect(() => {
    if (internshipStatus !== 'active' || checkedIn || !userId || dashboardLoading) return;

    const checkReminder = async () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      // Get settings for thresholds
      const thresholdStr = locationSettings?.late_threshold_time || '08:15';
      const [thHours, thMinutes] = thresholdStr.split(':').map(Number);

      const absentThresholdStr = locationSettings?.absent_threshold_time || '12:00';
      const [abHours, abMinutes] = absentThresholdStr.split(':').map(Number);

      const isPastLate = currentHours > thHours || (currentHours === thHours && currentMinutes >= thMinutes);
      const isPastAbsent = currentHours > abHours || (currentHours === abHours && currentMinutes >= abMinutes);

      if (isPastLate) {
        const notifications = dashboardData?.notifications || [];
        const todayStr = now.toISOString().split('T')[0];

        // Use different notification title based on threshold
        const expectedTitle = isPastAbsent
          ? intl.formatMessage({ id: 'dashboard.attendance.critical_absent' })
          : intl.formatMessage({ id: 'dashboard.attendance.reminder' });
        const expectedMessage = isPastAbsent
          ? intl.formatMessage({ id: 'dashboard.attendance.past_absent_msg' }, { time: absentThresholdStr })
          : intl.formatMessage({ id: 'dashboard.attendance.past_late_msg' }, { time: thresholdStr });

        const hasThisReminder = notifications.some((n: any) =>
          n.type === 'attendance' &&
          n.title === expectedTitle &&
          new Date(n.created_at).toISOString().split('T')[0] === todayStr
        );

        if (!hasThisReminder) {
          await createNotification({
            userId: userId,
            title: expectedTitle,
            message: expectedMessage,
            type: 'attendance',
            link: '/dashboarduser'
          });
          // Refresh dashboard data to include the new notification
          queryClient.invalidateQueries({ queryKey: ['participant-dashboard-data'] });
        }
      }
    };

    const timer = setTimeout(checkReminder, 5000);
    return () => clearTimeout(timer);
  }, [internshipStatus, checkedIn, userId, dashboardData, dashboardLoading, queryClient, locationSettings, intl]);

  const handleCheckOut = () => {
    if (!todayAttendanceId) return;
    openAlert({
      title: intl.formatMessage({ id: 'Confirm Check-out' }),
      message: intl.formatMessage({ id: 'dashboard.attendance.confirm_checkout_msg' }),
      variant: 'warning',
      showCancel: true,
      confirmText: intl.formatMessage({ id: 'Yes, Check-out' }),
      onConfirm: () => checkOutMutation.mutate()
    });
  };

  const onDownloadCertificate = async () => {
    if (!certEligibility?.eligible || !certEligibility.data) {
      openAlert({
        title: intl.formatMessage({ id: 'Not Available Yet' }),
        message: certEligibility?.message || intl.formatMessage({ id: 'dashboard.attendance.cert_not_eligible' }),
        variant: 'info'
      });
      return;
    }
    setCertLoading(true);
    try {
      await generateCertificatePDF(certEligibility.data as any);
      openAlert({
        title: intl.formatMessage({ id: 'Success' }) + '!',
        message: intl.formatMessage({ id: 'dashboard.attendance.cert_downloading' }),
        variant: 'success'
      });
    } catch (e) {
      openAlert({
        title: intl.formatMessage({ id: 'Error' }),
        message: intl.formatMessage({ id: 'dashboard.attendance.cert_download_failed' }),
        variant: 'error'
      });
    } finally {
      setCertLoading(false);
    }
  };

  const onCheckCertificate = async () => {
    setCertLoading(true);
    try {
      const result = await getCertificateEligibility(userId);
      if (result.eligible && result.data) {
        generateCertificatePDF(result.data as any);
        openAlert({
          title: intl.formatMessage({ id: 'dashboard.attendance.cert_generated' }) + '!',
          message: intl.formatMessage({ id: 'dashboard.attendance.cert_generated' }),
          variant: 'success'
        });
      } else {
        openAlert({
          title: intl.formatMessage({ id: 'Not Eligible' }),
          message: result.message || intl.formatMessage({ id: 'dashboard.attendance.cert_not_eligible' }),
          variant: 'info'
        });
      }
    } catch (e) {
      openAlert({
        title: intl.formatMessage({ id: 'Error' }),
        message: intl.formatMessage({ id: 'dashboard.attendance.cert_eligibility_error' }),
        variant: 'error'
      });
    } finally {
      setCertLoading(false);
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'error';
      case 'sick':
      case 'permit': return 'info';
      default: return 'default';
    }
  };

  if (attendanceLoading || profileLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ px: 1 }}>
      {!dashboardData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Typography color="error" variant="h6">
            <FormattedMessage id="dashboard.data_fetch_failed" />
          </Typography>
        </Box>
      ) : internshipStatus === 'waiting' ? (
        <InternshipWaitingState userProfile={userProfile} timeLeft={timeLeft} />
      ) : internshipStatus === 'finished' ? (
        <InternshipFinishedState
          userProfile={userProfile}
          certEligibility={certEligibility}
          certEligibilityLoading={certEligibilityLoading}
          certLoading={certLoading}
          onDownloadCertificate={onDownloadCertificate}
        />
      ) : (
        <>
          <ParticipantDashboardHeader
            certEligibility={certEligibility}
            certLoading={certLoading}
            onDownloadCertificate={onDownloadCertificate}
          />

          <ParticipantStatusCards
            userProfile={userProfile}
            attendanceRate={calcAttendanceRate}
          />

          <Grid container spacing={3} justifyContent="center">
            {!isOnLeave && (
              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  <AttendanceMapCard
                    adminPosition={adminPosition}
                    adminAddress={adminAddress}
                    userLocation={userLocation}
                    adminRadius={adminRadius}
                  />
                  <AttendanceHistoryTable
                    attendances={Array.isArray(attendanceData) ? attendanceData : (attendanceData?.data || [])}
                    getStatusColor={getStatusColor}
                  />
                </Stack>
              </Grid>
            )}

            <Grid item xs={12} md={isOnLeave ? 10 : 4} lg={isOnLeave ? 8 : 4}>
              <TodayAttendanceActionCard
                userId={userId}
                checkedIn={checkedIn}
                checkedOut={checkedOut}
                isPending={isPending}
                isRejected={isRejected}
                isOutOfArea={isOutOfArea}
                latestRequest={latestRequest}
                checkInMutationPending={checkInMutation.isPending}
                handleCheckIn={handleCheckIn}
                setOutAreaDialogOpen={setOutAreaDialogOpen}
                setLeaveDialogOpen={setLeaveDialogOpen}
                todayAttendance={todayAttendance}
                activityPlan={activityPlan}
                setActivityPlan={setActivityPlan}
                attendancePhoto={attendancePhoto}
                setAttendancePhoto={setAttendancePhoto}
                handleCheckOut={handleCheckOut}
                checkOutMutationPending={checkOutMutation.isPending}
                certLoading={certLoading}
                onCheckCertificate={onCheckCertificate}
                locationSettings={locationSettings}
              />
            </Grid>

            <OutAreaRequestDialog
              open={outAreaDialogOpen}
              onClose={() => setOutAreaDialogOpen(false)}
              userId={userId || ''}
            />

            <LeaveRequestDialog
              open={leaveDialogOpen}
              onClose={() => setLeaveDialogOpen(false)}
              userId={userId || ''}
              supervisorName={userProfile?.supervisor?.name}
            />
          </Grid>
        </>
      )}
    </Box>
  );
};

export default DashboardAttendance;
