import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import TeamComplianceListView from 'src/sections/active-sections/team-compliance/view/team-compliance-list-view';

export default function Page() {
    return (
        <>
            <Helmet>
                <title>Competencies | Staff Dashboard - {CONFIG.site.name}</title>
            </Helmet>
            <TeamComplianceListView />
        </>
    );
}
