'use client';
import dynamic from 'next/dynamic';
import Loader from 'components/Loader';

const MonitoringsuperView = dynamic(() => import('views/other/Supervisors/Monitoring'), {
    ssr: false,
    loading: () => <Loader />
});

export default function MonitoringsuperPage() {
    return <MonitoringsuperView />;
}
