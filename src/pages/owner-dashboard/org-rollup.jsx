import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { OrgRollupView } from 'src/sections/org-rollup/view';

export default function Page() {
    return (
        <>
            <Helmet><title>Org Rollup | Owner Dashboard - {CONFIG.site.name}</title></Helmet>
            <OrgRollupView />
        </>
    );
}
