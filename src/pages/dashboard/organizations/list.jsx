import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { OrganizationListView } from 'src/sections/organization/view';

// ----------------------------------------------------------------------

const metadata = { title: `Organizations | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <OrganizationListView />
    </>
  );
}
