import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { DocumentListView } from 'src/sections/active-sections/documents/view/document-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Documents | Dashboard - ${CONFIG.site.name}` };

export default function Page({ ownerDashboard = false }) {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DocumentListView ownerDashboard={ownerDashboard} />
    </>
  );
}
