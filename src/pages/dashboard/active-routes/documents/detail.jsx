import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { DocumentDetailView } from 'src/sections/active-sections/documents/view/document-detail-view';

// ----------------------------------------------------------------------

const metadata = { title: `Document Detail | Dashboard - ${CONFIG.site.name}` };

export default function Page({ ownerDashboard = false }) {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DocumentDetailView ownerDashboard={ownerDashboard} />
    </>
  );
}
