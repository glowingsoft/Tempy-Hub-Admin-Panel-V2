import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { FamilyGroupView } from 'src/sections/family-group/view';

// ----------------------------------------------------------------------

const metadata = { title: `Family Groups | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <FamilyGroupView />
    </>
  );
}
