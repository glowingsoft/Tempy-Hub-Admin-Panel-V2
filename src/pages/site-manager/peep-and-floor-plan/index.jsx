import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { OrgRollupView } from 'src/sections/org-rollup/view';

export default function Page() {
    return (
        <>
            <Helmet><title>PEEP &amp; Floor Plans | Site Manager - {CONFIG.site.name}</title></Helmet>
            <OrgRollupView ownerDashboard={false} />
        </>
    );
}
