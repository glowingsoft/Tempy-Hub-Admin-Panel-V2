import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { StaffMyResidentsView } from 'src/sections/staff/my-residents/view/staff-my-residents-view';

// ----------------------------------------------------------------------

const metadata = { title: `My Residents | Staff Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <StaffMyResidentsView />
    </>
  );
}