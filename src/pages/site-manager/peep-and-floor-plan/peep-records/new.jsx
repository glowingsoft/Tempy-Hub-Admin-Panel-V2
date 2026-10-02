import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { PeepRecordNewEditView } from 'src/sections/peep-records/view';

export default function Page() {
    return (
        <>
            <Helmet><title>New PEEP Record | Site Manager - {CONFIG.site.name}</title></Helmet>
            <PeepRecordNewEditView ownerDashboard={false} />
        </>
    );
}
