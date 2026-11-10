import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JobTitleListView } from 'src/sections/job-title/view';

// ----------------------------------------------------------------------

const metadata = { title: `Job Titles | Site Manager - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JobTitleListView />
    </>
  );
}
