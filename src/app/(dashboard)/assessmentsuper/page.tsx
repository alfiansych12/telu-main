'use client';
import dynamic from 'next/dynamic';
import Loader from 'components/Loader';

const AssessmentView = dynamic(() => import('views/other/Supervisors/AssessmentView'), {
    ssr: false,
    loading: () => <Loader />
});

// ==============================|| PAGE - ASSESSMENT SUPERVISOR ||============================== //

const AssessmentPage = () => {
    return <AssessmentView />;
};

export default AssessmentPage;
