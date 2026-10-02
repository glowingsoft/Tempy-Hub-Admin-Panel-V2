import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { AdminSignInView } from 'src/sections/auth/admin/admin-sign-in-view';


// ----------------------------------------------------------------------

const metadata = { title: `Sign in | Amplify - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <AdminSignInView />
    </>
  );
}
