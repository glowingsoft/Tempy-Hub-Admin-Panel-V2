import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { MemberEditView } from 'src/sections/member/view';
import { getMockMemberById } from 'src/sections/member/mocks/data';

// ----------------------------------------------------------------------

const metadata = { title: `Edit membership | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const currentMember = getMockMemberById(id);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <MemberEditView member={currentMember} />
    </>
  );
}
