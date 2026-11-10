import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { LeaveRequestDetailView } from 'src/sections/leave-request/view';

// ----------------------------------------------------------------------

const metadata = { title: `Leave request details | Site Manager - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <LeaveRequestDetailView variant="siteManager" />
    </>
  );
}
