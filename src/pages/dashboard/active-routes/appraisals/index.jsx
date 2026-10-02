import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import AppraisalListView from 'src/sections/active-sections/appraisals/view/appraisal-list-view';

const metadata = { title: `Appraisals | Line Manager - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <AppraisalListView />
    </>
  );
}
