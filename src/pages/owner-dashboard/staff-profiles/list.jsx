import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { StaffProfileListView } from 'src/sections/staff-profile/view';

// ----------------------------------------------------------------------

const metadata = { title: `Staff Profiles | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <StaffProfileListView hideViewAction />
    </>
  );
}
