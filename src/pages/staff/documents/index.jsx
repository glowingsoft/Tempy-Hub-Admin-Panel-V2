import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { StaffDocumentListView } from 'src/sections/staff/documents/view/staff-document-list-view';

export default function Page() {
    return (
        <>
            <Helmet>
                <title>Documents | Staff Dashboard - {CONFIG.site.name}</title>
            </Helmet>
            <StaffDocumentListView />
        </>
    );
}
