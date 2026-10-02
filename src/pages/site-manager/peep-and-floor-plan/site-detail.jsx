import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { OrgRollupSiteDetail } from 'src/sections/org-rollup/org-rollup-site-detail';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Site Detail | Site Manager - {CONFIG.site.name}</title>
      </Helmet>
      <OrgRollupSiteDetail ownerDashboard={false} />
    </>
  );
}
