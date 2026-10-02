import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { FloorPlanListView } from 'src/sections/floor-plans/view';

export default function Page() {
    return (
        <>
            <Helmet><title>Floor Plans | Site Manager - {CONFIG.site.name}</title></Helmet>
            <FloorPlanListView ownerDashboard={false} />
        </>
    );
}
