import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { StaffProfileDetailView } from 'src/sections/staff-profile/view';

// ----------------------------------------------------------------------

const metadata = { title: `Staff profile details | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <StaffProfileDetailView />
    </>
  );
}
