import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';
import { FireDrillsView } from 'src/sections/active-sections/fire-drills/view/fire-drills-view';

// ----------------------------------------------------------------------
// Admin (Super Admin) entry point — same view, with the cross-site filter
// switched on since this role isn't scoped to one site.

const metadata = { title: `Fire Drills | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <FireDrillsView rootPath={paths.adminDashboard.root} showSiteFilter />
    </>
  );
}
