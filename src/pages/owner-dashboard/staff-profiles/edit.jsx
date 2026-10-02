import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { StaffProfileEditView } from 'src/sections/staff-profile/view';
import { getMockStaffProfileById } from 'src/sections/staff-profile/mocks/data';

// ----------------------------------------------------------------------

const metadata = { title: `Edit staff profile | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const currentStaffProfile = getMockStaffProfileById(id);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <StaffProfileEditView staffProfile={currentStaffProfile} />
    </>
  );
}
