import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { StaffDocumentDetailView } from 'src/sections/staff/documents/view/staff-document-detail-view';

export default function Page() {
    return (
        <>
            <Helmet>
                <title>Document | Staff Dashboard - {CONFIG.site.name}</title>
            </Helmet>
            <StaffDocumentDetailView />
        </>
    );
}
