import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { FamilyModerationView } from 'src/sections/moderation/view/family-moderation-view';

// ----------------------------------------------------------------------

const metadata = { title: `Family Moderation | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <FamilyModerationView />
    </>
  );
}
