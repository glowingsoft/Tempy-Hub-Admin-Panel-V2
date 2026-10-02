import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { StaffDashboardView } from 'src/sections/staff/dashboard/view/staff-dashboard-view';

export default function Page() {
  return (
    <>
      <Helmet><title>Staff Dashboard - {CONFIG.site.name}</title></Helmet>
      <StaffDashboardView />
    </>
  );
}
