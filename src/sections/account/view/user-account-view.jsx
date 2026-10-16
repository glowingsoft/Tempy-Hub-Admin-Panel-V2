import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';

import { useTabs } from 'src/hooks/use-tabs';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AccountGeneral } from '../account-general';
import { AccountChangePassword } from '../account-change-password';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'general', label: 'General', icon: <Iconify icon="solar:user-id-bold" width={24} /> },
  {
    value: 'changePassword',
    label: 'Change Password',
    icon: <Iconify icon="solar:key-minimalistic-bold" width={24} />,
  },
];

// ----------------------------------------------------------------------

export function AccountView() {
  const tabs = useTabs('general');
  const pathname = usePathname();

  let dashboardRoot = paths.dashboard?.root || '/';
  if (pathname.startsWith('/owner-dashboard')) {
    dashboardRoot = paths.owner?.root || '/owner-dashboard';
  } else if (pathname.startsWith('/site-manager')) {
    dashboardRoot = paths.siteManager?.root || '/site-manager';
  } else if (pathname.startsWith('/line-manager')) {
    dashboardRoot = paths.lineManager?.root || '/line-manager';
  } else if (pathname.startsWith('/admin-dashboard')) {
    dashboardRoot = paths.adminDashboard?.root || '/admin-dashboard';
  } else if (pathname.startsWith('/staff')) {
    dashboardRoot = paths.staff?.dashboard || '/staff/dashboard';
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Account"
        links={[
          { name: 'Dashboard', href: dashboardRoot },
          { name: 'Profile' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Tabs value={tabs.value} onChange={tabs.onChange} sx={{ mb: { xs: 3, md: 5 } }}>
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {tabs.value === 'general' && <AccountGeneral />}

      {tabs.value === 'changePassword' && <AccountChangePassword />}
    </DashboardContent>
  );
}