import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { TempyUsageView } from 'src/sections/tempy-connection/view/tempy-usage-view';

// ----------------------------------------------------------------------

const metadata = { title: `Connect to Tempy | Dashboard - ${CONFIG.site.name}` };

export default function Page({ ownerDashboard = false }) {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <TempyUsageView ownerDashboard={ownerDashboard} />
    </>
  );
}
