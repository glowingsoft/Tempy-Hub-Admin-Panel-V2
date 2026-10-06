import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { NewslettersView } from 'src/sections/newsletters/view';

// ----------------------------------------------------------------------

const metadata = { title: `Newsletters | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <NewslettersView />
    </>
  );
}
