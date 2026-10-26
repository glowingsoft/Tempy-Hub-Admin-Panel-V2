import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { FamilyInvitationDetailView } from 'src/sections/family-membership/view';

// ----------------------------------------------------------------------

const metadata = { title: `Family Invitation Details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <FamilyInvitationDetailView />
    </>
  );
}