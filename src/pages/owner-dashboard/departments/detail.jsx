import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { DepartmentDetailView } from 'src/sections/department/view';

// ----------------------------------------------------------------------

const metadata = { title: `Department details | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DepartmentDetailView />
    </>
  );
}
