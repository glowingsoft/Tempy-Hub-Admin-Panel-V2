import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { LeaveRequestListView } from 'src/sections/leave-request/view';

// ----------------------------------------------------------------------

const metadata = { title: `Leave Approval | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      {/* Same component as the Owner Dashboard. Line managers approve/reject;
          they only get "Set Entitlement" if the owner grants it — wire
          `canSetEntitlement` to the real permission flag when it exists. */}
      <LeaveRequestListView variant="lineManager" />
    </>
  );
}
