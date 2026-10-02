import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { BranchCreateView } from 'src/sections/branch/view';

// ----------------------------------------------------------------------

const metadata = { title: `Add site | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <BranchCreateView />
    </>
  );
}
