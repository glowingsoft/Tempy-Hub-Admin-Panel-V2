import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { AnnouncementListView } from 'src/sections/active-sections/announcement';

// ----------------------------------------------------------------------

const metadata = { title: `Announcements | Dashboard - ${CONFIG.site.name}` };

export default function Page({ ownerDashboard = false }) {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <AnnouncementListView ownerDashboard={ownerDashboard} />
    </>
  );
}
