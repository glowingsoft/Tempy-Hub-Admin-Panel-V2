import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { BranchListView } from 'src/sections/branch/view';

// ----------------------------------------------------------------------

const metadata = { title: `Sites | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <BranchListView />
    </>
  );
}
