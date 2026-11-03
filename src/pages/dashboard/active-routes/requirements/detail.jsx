import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import RequirementDetailView from 'src/sections/active-sections/requirements/view/requirement-detail-view';

const metadata = { title: `Requirement details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <RequirementDetailView />
    </>
  );
}
