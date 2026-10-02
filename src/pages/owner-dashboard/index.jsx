import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { OwnerDashboardView } from 'src/sections/owner/view';

// ----------------------------------------------------------------------

const metadata = { title: `Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <OwnerDashboardView />
    </>
  );
}
