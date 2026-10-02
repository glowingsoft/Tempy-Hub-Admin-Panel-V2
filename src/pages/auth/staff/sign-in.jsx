import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { StaffSignInView } from 'src/sections/auth/staff/staff-sign-in-view';

export default function Page() {
  return (
    <>
      <Helmet><title>Staff Login - {CONFIG.site.name}</title></Helmet>
      <StaffSignInView />
    </>
  );
}
