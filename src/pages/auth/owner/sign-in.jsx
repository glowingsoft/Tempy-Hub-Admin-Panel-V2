import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { OwnerSignInView } from 'src/sections/auth/owner/owner-sign-in-view';

// ----------------------------------------------------------------------

const metadata = { title: `Owner sign in - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <OwnerSignInView />
    </>
  );
}
