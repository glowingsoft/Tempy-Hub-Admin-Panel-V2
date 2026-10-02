import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { KioskListView } from 'src/sections/active-sections/kiosk/view/kiosk-list-view';


// ----------------------------------------------------------------------

const metadata = { title: `Kiosks | Dashboard - ${CONFIG.site.name}` };

export default function Page({ ownerDashboard = false }) {
    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <KioskListView ownerDashboard={ownerDashboard} />
        </>
    );
}
