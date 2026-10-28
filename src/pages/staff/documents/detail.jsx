import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { DocumentDetailView } from 'src/sections/active-sections/documents/view/document-detail-view';

export default function Page() {
    return (
        <>
            <Helmet>
                <title>Document | Staff Dashboard - {CONFIG.site.name}</title>
            </Helmet>
            <DocumentDetailView isStaff />
        </>
    );
}