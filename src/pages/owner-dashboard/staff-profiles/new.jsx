import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { StaffProfileCreateView } from 'src/sections/staff-profile/view';

// ----------------------------------------------------------------------

const metadata = { title: `Add staff profile | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <StaffProfileCreateView />
    </>
  );
}
