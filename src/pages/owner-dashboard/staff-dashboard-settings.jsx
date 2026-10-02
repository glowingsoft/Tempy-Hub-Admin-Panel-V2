import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { StaffDashboardSettingsView } from 'src/sections/staff-dashboard-settings/view';

export default function Page() {
    return (
        <>
            <Helmet><title>Staff Dashboard Settings | Owner Dashboard - {CONFIG.site.name}</title></Helmet>
            <StaffDashboardSettingsView />
        </>
    );
}
