import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { StaffMyResidentDetailView } from 'src/sections/staff/my-residents/view';

// ----------------------------------------------------------------------

const metadata = { title: `Resident Details | Staff Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <StaffMyResidentDetailView />
    </>
  );
}