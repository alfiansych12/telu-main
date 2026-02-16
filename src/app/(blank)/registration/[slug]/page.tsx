import React from 'react';
import PublicRegistrationView from 'views/other/Registration/PublicRegistrationView';

export const dynamic = 'force-dynamic';

const PublicRegistrationPage = ({ params }: { params: { slug: string } }) => {
    return <PublicRegistrationView slug={params.slug} />;
};

export default PublicRegistrationPage;
