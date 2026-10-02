import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import TeamComplianceListView from 'src/sections/active-sections/team-compliance/view/team-compliance-list-view';


// ----------------------------------------------------------------------

const metadata = { title: `Team Compliance | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <TeamComplianceListView/>
    </>
  );
}
