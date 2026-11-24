import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { AnnouncementDetailView } from 'src/sections/active-sections/announcement';

// ----------------------------------------------------------------------

const metadata = { title: `Announcement Details | Dashboard - ${CONFIG.site.name}` };

  export default function Page() {
    return (
      <>
        <Helmet>
          <title>{metadata.title}</title>
        </Helmet>

        <AnnouncementDetailView />
      </>
    );
  }
