import { useEffect } from 'react';
import PropTypes from 'prop-types';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

// ----------------------------------------------------------------------

// `prefetch` loads the same lazy chunk registered for this route in
// `line-manager-dashboard.jsx`, so switching tabs doesn't hit the Suspense
// fallback while the destination page's JS is fetched.
export const TEAM_DEVELOPMENT_TABS = [
  {
    value: 'supervision',
    label: 'Supervision',
    href: paths.lineManager.supervision,
    prefetch: () => import('src/pages/dashboard/active-routes/supervision'),
  },
  {
    value: 'appraisals',
    label: 'Appraisals',
    href: paths.lineManager.appraisal,
    prefetch: () => import('src/pages/dashboard/active-routes/appraisals'),
  },
  {
    value: 'competencies',
    label: 'Competencies',
    href: paths.lineManager.teamCompliance,
    prefetch: () => import('src/pages/dashboard/active-routes/team-compliance'),
  },
  {
    value: 'training',
    label: 'Training Records',
    href: paths.lineManager.training,
    prefetch: () => import('src/pages/dashboard/active-routes/training'),
  },
];

/**
 * Shared sub-navigation tabs for the Line Manager "team development" pages
 * (Supervision / Appraisals / Competencies / Training Records).
 *
 * The active tab is derived from the current route, and switching tabs uses
 * the app's client-side router so navigation doesn't trigger a full page reload.
 * The other tabs' page chunks are prefetched on mount (and again on hover) so
 * clicking a tab doesn't flash the loading fallback while it loads.
 */
export function TeamDevelopmentTabs({ sx }) {
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = TEAM_DEVELOPMENT_TABS.find((tab) => tab.href === pathname)?.value ?? false;

  useEffect(() => {
    TEAM_DEVELOPMENT_TABS.forEach((tab) => {
      if (tab.value !== currentTab) tab.prefetch();
    });
  }, [currentTab]);

  const handleChangeTab = (event, newValue) => {
    const nextTab = TEAM_DEVELOPMENT_TABS.find((tab) => tab.value === newValue);
    if (nextTab && nextTab.href !== pathname) {
      router.push(nextTab.href);
    }
  };

  return (
    <Tabs value={currentTab} onChange={handleChangeTab} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', ...sx }}>
      {TEAM_DEVELOPMENT_TABS.map((tab) => (
        <Tab
          key={tab.value}
          label={tab.label}
          value={tab.value}
          onMouseEnter={tab.prefetch}
        />
      ))}
    </Tabs>
  );
}

TeamDevelopmentTabs.propTypes = {
  sx: PropTypes.object,
};
