import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { OwnerSettingsView } from 'src/sections/owner-settings/view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Settings | Owner Dashboard - {CONFIG.site.name}</title>
      </Helmet>
      <OwnerSettingsView />
    </>
  );
}