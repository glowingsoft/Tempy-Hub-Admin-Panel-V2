import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { LeaveRequestListView } from 'src/sections/leave-request/view';

// ----------------------------------------------------------------------

const metadata = { title: `Leave Requests | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <LeaveRequestListView ownerDashboard />
    </>
  );
}
