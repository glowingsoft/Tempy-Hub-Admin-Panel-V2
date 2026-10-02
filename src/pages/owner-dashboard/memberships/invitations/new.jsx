import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { MembershipCreateView } from 'src/sections/membership/view';

// ----------------------------------------------------------------------

const metadata = { title: `New invitation | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <MembershipCreateView />
    </>
  );
}
