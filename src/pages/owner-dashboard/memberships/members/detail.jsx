import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { MemberDetailView } from 'src/sections/member/view';

// ----------------------------------------------------------------------

const metadata = { title: `Member details | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <MemberDetailView />
    </>
  );
}
