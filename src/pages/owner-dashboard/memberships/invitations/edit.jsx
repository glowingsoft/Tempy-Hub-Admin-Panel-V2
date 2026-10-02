import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { MembershipEditView } from 'src/sections/membership/view';
import { getMockInvitationById } from 'src/sections/membership/mocks/data';

// ----------------------------------------------------------------------

const metadata = { title: `Edit invitation | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const currentMembership = getMockInvitationById(id);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <MembershipEditView membership={currentMembership} />
    </>
  );
}
