import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';
import { StaffSupervisionListView } from 'src/sections/staff/supervision/view/staff-supervision-list-view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Supervision & Appraisal | Owner Dashboard - {CONFIG.site.name}</title>
      </Helmet>
      <StaffSupervisionListView
        dashboardHref={paths.owner.root}
        heading="Supervision & Appraisal"
      />
    </>
  );
}
