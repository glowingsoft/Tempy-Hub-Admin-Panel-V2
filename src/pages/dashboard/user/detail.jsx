import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { UserProfileView } from 'src/sections/user/view';
import UserDetailView from 'src/sections/user/view/employee-profile-view';

// ----------------------------------------------------------------------

const metadata = { title: `Directoy Detail | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <UserDetailView />
    </>
  );
}
