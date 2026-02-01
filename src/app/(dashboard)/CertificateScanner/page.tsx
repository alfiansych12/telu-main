'use client';

import dynamic from 'next/dynamic';
import Loader from 'components/Loader';

// Move metadata out? No, this is 'use client'.
// Navigation metadata should be in a separate layout or handled by the page if it's a server component.
// But we need 'ssr: false' to bypass the crash.

const CertificateScanner = dynamic(() => import('views/other/Admin/CertificateScanner'), {
    ssr: false,
    loading: () => <Loader />
});

const Page = () => {
    return <CertificateScanner />;
};

export default Page;
