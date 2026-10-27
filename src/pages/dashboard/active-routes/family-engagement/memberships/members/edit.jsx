import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { FamilyMemberEditView } from 'src/sections/family-member';

// ----------------------------------------------------------------------

const metadata = { title: `Edit Family Member | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <FamilyMemberEditView />
    </>
  );
}