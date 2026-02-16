'use client';

import dynamic from 'next/dynamic';
import Loader from 'components/Loader';

const ArsipView = dynamic(() => import('views/other/Admin/Arsip'), {
    ssr: false,
    loading: () => <Loader />
});

export default ArsipView;
