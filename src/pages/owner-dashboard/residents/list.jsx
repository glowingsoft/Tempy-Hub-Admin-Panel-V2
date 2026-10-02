import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { ResidentListView } from 'src/sections/resident/view';

const metadata = { title: `Residents | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
    return (
        <>
            <Helmet>
                <title>{metadata.title}</title>
            </Helmet>
            <ResidentListView ownerDashboard />
        </>
    );
}
