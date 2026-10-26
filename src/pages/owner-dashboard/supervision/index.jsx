import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';
import { SupervisionListView } from 'src/sections/active-sections/supervision/view/supervision-list-view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Supervision | Owner Dashboard - {CONFIG.site.name}</title>
      </Helmet>
      <SupervisionListView
        dashboardHref={paths.owner.root}
        heading="Supervision"
        showTabs
      />
    </>
  );
}