import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { PeepRecordListView } from 'src/sections/peep-records/view';

export default function Page() {
    return (
        <>
            <Helmet><title>PEEP Records | Site Manager - {CONFIG.site.name}</title></Helmet>
            <PeepRecordListView ownerDashboard={false} />
        </>
    );
}
