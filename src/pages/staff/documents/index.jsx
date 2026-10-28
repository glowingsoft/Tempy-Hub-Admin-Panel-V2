import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { DocumentListView } from 'src/sections/active-sections/documents/view/document-list-view';

export default function Page() {
    return (
        <>
            <Helmet>
                <title>Documents | Staff Dashboard - {CONFIG.site.name}</title>
            </Helmet>
            <DocumentListView isStaff />
        </>
    );
}