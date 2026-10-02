import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import SupervisionListView from 'src/sections/active-sections/supervision/view/supervision-list-view';


// ----------------------------------------------------------------------

const metadata = { title: `Supervision | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <SupervisionListView />
        </>
    );
}
