import React, { useState, useEffect } from 'react';


import DashboardHeader from './DashboardHeader';
// import AttendanceChecklist, { ChecklistItem } from './AttendanceChecklist';
import Card from '../../components/ui/Card';
import MapCard from '../MapCard/MapCard';
import ActivityPlanSection from './ActivityPlanSection';
import CheckInButton from './CheckInButton';
import HorizontalDivider from './HorizontalDivider';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';




const MainContainer: React.FC = () => {
  const [attendanceStatus, setAttendanceStatus] = useState({ hasCheckedIn: false, hasCheckedOut: false, isAbsent: false });
  const [loading, setLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [activityPlan, setActivityPlan] = useState<string[] | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  // Fetch attendance status
  useEffect(() => {
    setLoading(true);
    fetch('/api/attendance/today-status')
      .then(res => res.json())
      .then(data => {
        setAttendanceStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch activity plan (optional, can be moved to ActivityPlanSection)
  const fetchActivityPlan = () => {
    setActivityLoading(true);
    setActivityError(null);
    fetch('/api/today-activity')
      .then(res => res.json())
      .then(data => {
        setActivityPlan(Array.isArray(data.activities) ? data.activities : []);
        setActivityLoading(false);
      })
      .catch(() => {
        setActivityError('Failed to load activities.');
        setActivityLoading(false);
      });
  };



  // Date display
  const now = new Date();
  const formattedDate = format(now, 'EEEE, MMMM d, yyyy');

  // Check-in handler
  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const res = await fetch('/api/attendance/check-in', { method: 'POST' });
      if (res.ok) {
        setAttendanceStatus((prev) => ({ ...prev, hasCheckedIn: true }));
      }
    } finally {
      setCheckInLoading(false);
    }
  };

  // ActivityPlanSection handler
  const handleActivityPlanClick = () => {
    if (activityPlan === null && !activityLoading) fetchActivityPlan();
  };

  // Urutan komponen sesuai instruksi
  return (
    <div
      className="mx-auto flex flex-col gap-4 mt-8 mb-12"
      style={{
        maxWidth: '1020px',
        width: '95%',
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: 24,
      }}
    >
      <DashboardHeader />
      {/* Hapus tulisan Dashboard di atas maps */}
      {/* <div className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
        Today's Attendance - {formattedDate}
      </div> */}
      <ActivityPlanSection
        onClick={handleActivityPlanClick}
        activities={activityPlan}
        loading={activityLoading}
        error={activityError}
      />
      {/* Pindahkan MapCard ke bawah ActivityPlanSection */}
      <Card className="p-0" style={{ borderRadius: 12 }}>
        <div
          className="w-full"
          style={{
            aspectRatio: typeof window !== 'undefined' && window.innerWidth <= 480 ? '1/1' : '4/3',
            borderRadius: 12,
            overflow: 'hidden',
            maxWidth: '100%',
          }}
        >
          <MapCard
            height="100%"
            style={{ width: '1000px', height: '200px', borderRadius: 12 }}
          />
        </div>
      </Card>
      <HorizontalDivider />
      <CheckInButton
        checkedIn={attendanceStatus.hasCheckedIn}
        onCheckIn={handleCheckIn}
        loading={checkInLoading}
      />
    </div>
  );
};

export default MainContainer;
