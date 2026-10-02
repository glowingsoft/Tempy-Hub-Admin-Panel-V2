import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import AppraisalDetailView from 'src/sections/active-sections/appraisals/view/appraisal-detail-view';

// ----------------------------------------------------------------------

const metadata = { title: `Appraisal Details | Line Manager - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <AppraisalDetailView />
    </>
  );
}
