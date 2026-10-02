import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { PeepAddPinView } from 'src/sections/active-sections/peen-floor-plan/view/peep-add-pin-view';

const metadata = { title: `Add Pin | Site Manager - ${CONFIG.site.name}` };

export default function Page() {
    return (
        <>
            <Helmet>
                <title>{metadata.title}</title>
            </Helmet>
            <PeepAddPinView ownerDashboard={false} />
        </>
    );
}
