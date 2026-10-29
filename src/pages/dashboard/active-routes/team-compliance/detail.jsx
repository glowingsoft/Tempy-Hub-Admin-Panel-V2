import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import AssignmentDetailView from 'src/sections/active-sections/team-compliance/view/assignment-detail-view';

const metadata = { title: `Assignment details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
    return (
        <>
            <Helmet>
                <title>{metadata.title}</title>
            </Helmet>
            <AssignmentDetailView />
        </>
    );
}