import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { GazettesView } from 'src/sections/gazettes/view/gazettes-view';

// ----------------------------------------------------------------------

const metadata = { title: `Gazettes | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <GazettesView />
    </>
  );
}
