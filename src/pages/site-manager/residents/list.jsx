import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { ResidentListView } from 'src/sections/resident/view';

const metadata = { title: `Residents | Site Manager - ${CONFIG.site.name}` };

export default function Page() {
    return (
        <>
            <Helmet>
                <title>{metadata.title}</title>
            </Helmet>
            <ResidentListView />
        </>
    );
}
