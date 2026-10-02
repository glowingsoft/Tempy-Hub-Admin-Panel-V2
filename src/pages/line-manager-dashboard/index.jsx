import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { LineManagerDashboardView } from 'src/sections/line-manager/dashboard/view/line-manager-dashboard-view';

// ----------------------------------------------------------------------

const metadata = { title: `Line Manager Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <LineManagerDashboardView />
    </>
  );
}
