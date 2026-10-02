import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { ResidentDetailView } from 'src/sections/resident/view';

const metadata = { title: `Resident | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
    return (
        <>
            <Helmet>
                <title>{metadata.title}</title>
            </Helmet>
            <ResidentDetailView />
        </>
    );
}
