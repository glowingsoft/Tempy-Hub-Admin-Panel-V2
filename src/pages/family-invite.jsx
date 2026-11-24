import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { FamilyInviteAcceptView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Accept Family Invitation - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <FamilyInviteAcceptView />
    </>
  );
}
