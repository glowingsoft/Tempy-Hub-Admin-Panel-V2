import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { BranchDetailView } from 'src/sections/branch/view';

// ----------------------------------------------------------------------

const metadata = { title: `Site details | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <BranchDetailView />
    </>
  );
}
