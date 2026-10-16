import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { AppSurface } from 'src/auth/constants';
import { paths } from 'src/routes/paths';
import { JwtSignInView } from 'src/sections/auth/jwt';

export default function Page() {
  return (
    <>
      <Helmet><title>Staff Login - {CONFIG.site.name}</title></Helmet>
      <JwtSignInView
        surface={AppSurface.STAFF_APP}
        forgotReturnPath={paths.auth.staff.signIn}
        defaultEmail="john.williams@example.com"
        defaultPassword="123456"
      />
    </>
  );
}
