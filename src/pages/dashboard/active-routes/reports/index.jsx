import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { ReportsView } from 'src/sections/active-sections/reports/view/reports-view';


// ----------------------------------------------------------------------

const metadata = { title: `Reports | Dashboard - ${CONFIG.site.name}` };

export default function Page({ ownerDashboard = false }) {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ReportsView ownerDashboard={ownerDashboard} />
    </>
  );
}
