import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { AcknowledgementTrackerView } from 'src/sections/active-sections/documents/view/acknowledgement-tracker-view';

export default function Page() {
    return (
        <>
            <Helmet>
                <title>Acknowledgements | Dashboard - {CONFIG.site.name}</title>
            </Helmet>
            <AcknowledgementTrackerView />
        </>
    );
}