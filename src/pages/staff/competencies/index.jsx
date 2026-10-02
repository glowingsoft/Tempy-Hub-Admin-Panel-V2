import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { StaffCompetencyListView } from 'src/sections/staff/competencies/view/staff-competency-list-view';

export default function Page() {
    return (
        <>
            <Helmet>
                <title>My Competencies | Staff Dashboard - {CONFIG.site.name}</title>
            </Helmet>
            <StaffCompetencyListView />
        </>
    );
}
