import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { StaffLeaveRequestListView } from 'src/sections/staff/leave-requests/view/staff-leave-request-list-view';

export default function Page() {
    return (
        <>
            <Helmet>
                <title>Leave Requests | Staff Dashboard - {CONFIG.site.name}</title>
            </Helmet>
            <StaffLeaveRequestListView />
        </>
    );
}
