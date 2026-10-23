import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { FamilyMemberDetailView } from 'src/sections/family-membership/view';

// ----------------------------------------------------------------------

const metadata = { title: `Family Member Details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <FamilyMemberDetailView />
    </>
  );
}