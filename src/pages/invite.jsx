import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JwtInviteAcceptView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Accept Invitation - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtInviteAcceptView />
    </>
  );
}
