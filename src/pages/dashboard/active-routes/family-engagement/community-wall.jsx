import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { CommunityWallView } from 'src/sections/community-wall/view/community-wall-view';

// ----------------------------------------------------------------------

const metadata = { title: `Community Wall | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <CommunityWallView />
    </>
  );
}
