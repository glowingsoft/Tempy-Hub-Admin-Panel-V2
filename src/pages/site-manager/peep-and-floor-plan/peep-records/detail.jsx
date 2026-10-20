import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { PeepRecordDetailView } from 'src/sections/peep-records/view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>PEEP Record Details | Site Manager - {CONFIG.site.name}</title>
      </Helmet>
      <PeepRecordDetailView ownerDashboard={false} />
    </>
  );
}
