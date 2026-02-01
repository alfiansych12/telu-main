'use client';

import dynamic from 'next/dynamic';
import Loader from 'components/Loader';

const AttendanceReportView = dynamic(() => import('views/other/Supervisors/AttendanceReport'), {
    ssr: false,
    loading: () => <Loader />
});

export default function AttendanceReportPage() {
    return <AttendanceReportView />;
}
