import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { StaffShiftListView } from 'src/sections/staff/shifts/view/staff-shift-list-view';

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Shift Claim | Staff Dashboard - {CONFIG.site.name}</title>
      </Helmet>
      <StaffShiftListView claimable />
    </>
  );
}
