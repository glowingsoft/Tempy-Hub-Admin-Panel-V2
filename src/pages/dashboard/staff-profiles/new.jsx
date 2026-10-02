import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';

import { StaffProfileCreateView } from 'src/sections/staff-profile/view';

// ----------------------------------------------------------------------

const metadata = { title: `Add staff profile | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <StaffProfileCreateView
        pathsConfig={{
          dashboardRoot: paths.dashboard.root,
          root: paths.dashboard.staffProfiles.root,
          detail: paths.dashboard.staffProfiles.detail,
        }}
      />
    </>
  );
}
