import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import RequirementsListView from 'src/sections/active-sections/requirements/view/requirements-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Requirements | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <RequirementsListView />
    </>
  );
}