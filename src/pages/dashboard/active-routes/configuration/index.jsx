import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import ConfigurationView from 'src/sections/active-sections/configuration/view/configuration-view';

// ----------------------------------------------------------------------

const metadata = { title: `Configuration | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ConfigurationView />
    </>
  );
}
