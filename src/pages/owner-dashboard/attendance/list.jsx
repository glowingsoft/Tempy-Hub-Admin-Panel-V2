import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { TeamAttendanceListView } from 'src/sections/active-sections/team-attendance/view/team-attendance-list-view';

const metadata = { title: `Attendance | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
    return (
        <>
            <Helmet>
                <title>{metadata.title}</title>
            </Helmet>
            <TeamAttendanceListView ownerDashboard />
        </>
    );
}
