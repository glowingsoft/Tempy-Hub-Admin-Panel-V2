import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { AnnouncementCreateView } from 'src/sections/active-sections/announcement';

// ----------------------------------------------------------------------

const metadata = { title: `New Announcement | Dashboard - ${CONFIG.site.name}` };

export default function Page({ ownerDashboard = false }) {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <AnnouncementCreateView ownerDashboard={ownerDashboard} />
    </>
  );
}
