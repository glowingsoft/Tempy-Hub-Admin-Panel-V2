import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';
import { FireDrillsView } from 'src/sections/active-sections/fire-drills/view/fire-drills-view';

// ----------------------------------------------------------------------

const metadata = { title: `Fire Drills | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <FireDrillsView rootPath={paths.owner.root} showSiteFilter />
    </>
  );
}