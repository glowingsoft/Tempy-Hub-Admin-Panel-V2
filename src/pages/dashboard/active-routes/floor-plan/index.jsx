import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PeepFloorPlanView } from '../../../../sections/active-sections/peen-floor-plan/view/peep-floor-plan-view';

// ----------------------------------------------------------------------

const metadata = { title: `PEEP & Floor Plan | Dashboard - ${CONFIG.site.name}` };

export default function Page({ ownerDashboard = false, siteManagerDashboard = false }) {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PeepFloorPlanView ownerDashboard={ownerDashboard} siteManagerDashboard={siteManagerDashboard} />
    </>
  );
}
