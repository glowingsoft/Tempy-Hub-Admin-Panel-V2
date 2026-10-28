import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { DocumentCategoryListView } from 'src/sections/active-sections/documents/view/document-category-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Document Categories | Dashboard - ${CONFIG.site.name}` };

export default function DocumentCategoriesPage({ ownerDashboard = false }) {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <DocumentCategoryListView ownerDashboard={ownerDashboard} />
    </>
  );
}