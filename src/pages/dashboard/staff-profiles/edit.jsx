import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';
import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';

import { StaffProfileEditView } from 'src/sections/staff-profile/view';
import { getMockStaffProfileById } from 'src/sections/staff-profile/mocks/data';

// ----------------------------------------------------------------------

const metadata = { title: `Edit staff profile | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const currentStaffProfile = getMockStaffProfileById(id);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <StaffProfileEditView
        staffProfile={currentStaffProfile}
        pathsConfig={{
          dashboardRoot: paths.dashboard.root,
          root: paths.dashboard.staffProfiles.root,
          detail: paths.dashboard.staffProfiles.detail,
        }}
      />
    </>
  );
}
