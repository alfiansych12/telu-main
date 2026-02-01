'use client';

import dynamic from 'next/dynamic';
import Loader from 'components/Loader';

const ManagementDataView = dynamic(() => import('views/other/Admin/ManagementData'), {
    ssr: false,
    loading: () => <Loader />
});

export default ManagementDataView;
