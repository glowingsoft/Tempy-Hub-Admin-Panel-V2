import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import SupervisionSignOffView from 'src/sections/active-sections/supervision/view/supervision-sign-off-view';

// ----------------------------------------------------------------------

const metadata = { title: `Supervision sign-off | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <SupervisionSignOffView />
    </>
  );
}