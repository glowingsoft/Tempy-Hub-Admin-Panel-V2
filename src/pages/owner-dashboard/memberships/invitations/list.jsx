import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { MembershipListView } from 'src/sections/membership/view';

// ----------------------------------------------------------------------

const metadata = { title: `Invitations | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <MembershipListView />
    </>
  );
}
