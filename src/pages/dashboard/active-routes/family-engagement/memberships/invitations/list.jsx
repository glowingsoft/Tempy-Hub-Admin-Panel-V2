import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { FamilyInvitationListView } from 'src/sections/family-invitation';

// ----------------------------------------------------------------------

const metadata = { title: `Family Invitations | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <FamilyInvitationListView />
    </>
  );
}