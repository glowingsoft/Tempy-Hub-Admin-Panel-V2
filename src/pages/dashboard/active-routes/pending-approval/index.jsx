import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import PendingApprovalListView from 'src/sections/active-sections/pending-approval/view/pending-approval-list-view';


// ----------------------------------------------------------------------

const metadata = { title: `Pending Approval | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <PendingApprovalListView />
        </>
    );
}
