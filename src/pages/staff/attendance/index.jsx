import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { StaffAttendanceListView } from 'src/sections/staff/attendance/view/staff-attendance-list-view';

export default function Page() {
    return (
        <>
            <Helmet>
                <title>Staff Attendance - {CONFIG.site.name}</title>
            </Helmet>
            <StaffAttendanceListView />
        </>
    );
}
