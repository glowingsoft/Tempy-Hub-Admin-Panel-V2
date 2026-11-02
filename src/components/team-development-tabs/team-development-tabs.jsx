import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export function getTeamDevelopmentTabs(prefix = paths.lineManager.root) {
  const isStaff = prefix === paths.staff.root;
  return [
    {
      value: 'supervision',
      label: 'Supervision',
      href: `${prefix}/supervision`,
      href: isStaff ? paths.staff.supervision : `${prefix}/supervision`,
      prefetch: () => import('src/pages/dashboard/active-routes/supervision'),
    },
    {
      value: 'appraisals',
      label: 'Appraisals',
      href: `${prefix}/appraisals`,
      label: 'Appraisal',
      href: isStaff ? paths.staff.appraisal : `${prefix}/appraisals`,
      prefetch: () => import('src/pages/dashboard/active-routes/appraisals'),
    },
    {
      value: 'competencies',
      label: 'Competencies',
      href: `${prefix}/team-compliance`,
      prefetch: () => import('src/pages/dashboard/active-routes/team-compliance'),
      href: isStaff ? paths.staff.competencies : `${prefix}/team-compliance`,
      prefetch: () =>
        isStaff
          ? import('src/pages/staff/competencies')
          : import('src/pages/dashboard/active-routes/team-compliance'),
    },
    {
      value: 'training',
      label: 'Training Records',
      href: `${prefix}/training`,
      label: 'Training Record',
      href: isStaff ? paths.staff.training : `${prefix}/training`,
      prefetch: () => import('src/pages/dashboard/active-routes/training'),
    },
    {
      value: 'requirements',
      label: 'Requirements',
      href: `${prefix}/requirements`,
      prefetch: () => import('src/pages/dashboard/active-routes/requirements'),
    },
  ];
}

export const TEAM_DEVELOPMENT_TABS = getTeamDevelopmentTabs(paths.lineManager.root);

/**
 * Shared sub-navigation tabs for team development pages
 * (Supervision / Appraisals / Competencies / Training Records)
 * across Line Manager, Site Manager, and Owner Dashboards.
 * across Line Manager, Site Manager, Owner, and Staff Dashboards.
 */
export function TeamDevelopmentTabs() {
  return null;
}

TeamDevelopmentTabs.propTypes = {
  sx: PropTypes.object,
};