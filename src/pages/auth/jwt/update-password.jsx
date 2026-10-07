import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JwtUpdatePasswordView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Update password | Jwt - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtUpdatePasswordView />
    </>
  );
}
