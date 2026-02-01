'use client';
import dynamic from 'next/dynamic';
import Loader from 'components/Loader';

const ReportMonitoringView = dynamic(() => import('views/other/Admin/ReportMon'), {
  ssr: false,
  loading: () => <Loader />
});

export default function ReportsMonitoringPage() {
  return <ReportMonitoringView />;
}