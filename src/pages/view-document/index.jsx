import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { KioskDocumentView } from 'src/sections/active-sections/configuration/view/kiosk-document-view';

// ----------------------------------------------------------------------

const metadata = { title: `Document - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <KioskDocumentView />
    </>
  );
}
