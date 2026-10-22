import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export function getTeamDevelopmentTabs(prefix = paths.lineManager.root) {
  return [
    {
      value: 'supervision',
      label: 'Supervision',
      href: `${prefix}/supervision`,
      prefetch: () => import('src/pages/dashboard/active-routes/supervision'),
    },
    {
      value: 'appraisals',
      label: 'Appraisals',
      href: `${prefix}/appraisals`,
      prefetch: () => import('src/pages/dashboard/active-routes/appraisals'),
    },
    {
      value: 'competencies',
      label: 'Competencies',
      href: `${prefix}/team-compliance`,
      prefetch: () => import('src/pages/dashboard/active-routes/team-compliance'),
    },
    {
      value: 'training',
      label: 'Training Records',
      href: `${prefix}/training`,
      prefetch: () => import('src/pages/dashboard/active-routes/training'),
    },
  ];
}

export const TEAM_DEVELOPMENT_TABS = getTeamDevelopmentTabs(paths.lineManager.root);

/**
 * Shared sub-navigation tabs for team development pages
 * (Supervision / Appraisals / Competencies / Training Records)
 * across Line Manager, Site Manager, and Owner Dashboards.
 */
export function TeamDevelopmentTabs({ sx }) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = useMemo(() => {
    if (pathname.startsWith(paths.siteManager.root)) {
      return getTeamDevelopmentTabs(paths.siteManager.root);
    }
    if (pathname.startsWith(paths.owner.root)) {
      return getTeamDevelopmentTabs(paths.owner.root);
    }
    return getTeamDevelopmentTabs(paths.lineManager.root);
  }, [pathname]);

  const currentTab = tabs.find((tab) => tab.href === pathname)?.value ?? false;

  useEffect(() => {
    tabs.forEach((tab) => {
      if (tab.value !== currentTab) tab.prefetch();
    });
  }, [currentTab, tabs]);

  const handleChangeTab = (event, newValue) => {
    const nextTab = tabs.find((tab) => tab.value === newValue);
    if (nextTab && nextTab.href !== pathname) {
      router.push(nextTab.href);
    }
  };

  return (
    <Tabs value={currentTab} onChange={handleChangeTab} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', ...sx }}>
      {tabs.map((tab) => (
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