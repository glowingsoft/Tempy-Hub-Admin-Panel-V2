import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { StaffSupervisionListView } from 'src/sections/staff/supervision/view/staff-supervision-list-view';

export default function Page() {
    return (
        <>
            <Helmet>
                <title>Supervision & Appraisal | Staff Dashboard - {CONFIG.site.name}</title>
            </Helmet>
            <StaffSupervisionListView />
        </>
    );
}
