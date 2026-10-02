import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { OrganizationDetailView } from 'src/sections/organization/view';

// ----------------------------------------------------------------------

const metadata = { title: `Organization details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <OrganizationDetailView />
    </>
  );
}
