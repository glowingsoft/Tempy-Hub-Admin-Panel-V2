import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { StatsView } from 'src/sections/active-sections/stats/view/stats-view';

// ----------------------------------------------------------------------

const metadata = { title: `Statistics | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <StatsView ownerDashboard />
    </>
  );
}
