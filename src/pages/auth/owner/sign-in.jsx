import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { AppSurface } from 'src/auth/constants';
import { paths } from 'src/routes/paths';
import { JwtSignInView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Owner sign in - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtSignInView
        surface={AppSurface.OWNER_ADMIN}
        forgotReturnPath={paths.auth.owner.signIn}
      />
    </>
  );
}
