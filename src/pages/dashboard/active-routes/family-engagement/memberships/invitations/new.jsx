import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { FamilyInvitationCreateView } from 'src/sections/family-membership/view';

// ----------------------------------------------------------------------

const metadata = { title: `New Family Invitation | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <FamilyInvitationCreateView />
    </>
  );
}