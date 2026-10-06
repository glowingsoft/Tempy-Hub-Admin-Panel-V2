import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { FamilyOverviewView } from 'src/sections/family-engagement/view/family-overview-view';

// ----------------------------------------------------------------------

const metadata = { title: `Family Overview | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <FamilyOverviewView />
    </>
  );
}
