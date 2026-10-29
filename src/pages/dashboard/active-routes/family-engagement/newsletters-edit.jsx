import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { NewsletterEditView } from 'src/sections/newsletters/view';

// ----------------------------------------------------------------------

const metadata = { title: `Edit Newsletter | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <NewsletterEditView />
    </>
  );
}
