import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import ConfigurationView from 'src/sections/active-sections/configuration/view/configuration-view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Configuration | Owner Dashboard - {CONFIG.site.name}</title>
      </Helmet>
      <ConfigurationView ownerDashboard />
    </>
  );
}
