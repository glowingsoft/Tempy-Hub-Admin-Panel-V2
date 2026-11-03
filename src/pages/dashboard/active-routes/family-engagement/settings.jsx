import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { AdminSettingsView } from 'src/sections/admin-settings/view';

// ----------------------------------------------------------------------

const metadata = { title: `Family Settings | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <AdminSettingsView variant="owner" />
    </>
  );
}
