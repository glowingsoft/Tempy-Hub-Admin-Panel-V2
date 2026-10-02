import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';

import { StaffProfileDetailView } from 'src/sections/staff-profile/view';

// ----------------------------------------------------------------------

const metadata = { title: `Staff profile details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <StaffProfileDetailView
        pathsConfig={{
          dashboardRoot: paths.dashboard.root,
          root: paths.dashboard.staffProfiles.root,
          edit: paths.dashboard.staffProfiles.edit,
        }}
      />
    </>
  );
}
