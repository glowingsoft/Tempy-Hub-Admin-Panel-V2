import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JobTitleDetailView } from 'src/sections/job-title/view';

// ----------------------------------------------------------------------

const metadata = { title: `Job title details | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JobTitleDetailView />
    </>
  );
}
