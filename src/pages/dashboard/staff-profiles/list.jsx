import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';

import { StaffProfileListView } from 'src/sections/staff-profile/view';

// ----------------------------------------------------------------------

const metadata = { title: `Staff Profiles | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <StaffProfileListView
        pathsConfig={{
          dashboardRoot: paths.dashboard.root,
          root: paths.dashboard.staffProfiles.root,
          new: paths.dashboard.staffProfiles.new,
          detail: paths.dashboard.staffProfiles.detail,
          edit: paths.dashboard.staffProfiles.edit,
        }}
      />
    </>
  );
}
