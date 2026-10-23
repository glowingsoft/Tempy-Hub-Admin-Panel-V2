import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import AppraisalSignOffView from 'src/sections/active-sections/appraisals/view/appraisal-sign-off-view';

// ----------------------------------------------------------------------

const metadata = { title: `Appraisal sign-off | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <AppraisalSignOffView />
    </>
  );
}