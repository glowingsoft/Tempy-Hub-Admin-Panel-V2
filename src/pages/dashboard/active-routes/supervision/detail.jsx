import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import SupervisionDetailView from 'src/sections/active-sections/supervision/view/supervision-detail-view';

// ----------------------------------------------------------------------

const metadata = { title: `Supervision details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <SupervisionDetailView />
        </>
    );
}
