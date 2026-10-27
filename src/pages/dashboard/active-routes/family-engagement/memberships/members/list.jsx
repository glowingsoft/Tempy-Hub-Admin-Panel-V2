import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { FamilyMemberListView } from 'src/sections/family-member';

// ----------------------------------------------------------------------

const metadata = { title: `Family Members | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <FamilyMemberListView />
    </>
  );
}