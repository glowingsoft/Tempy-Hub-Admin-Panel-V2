import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

export const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;

// const icon = (name) => (
//   <Iconify icon={name} />
// );

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
  directory: icon('ic-users'),
  settings: icon('ic-settings'),
  reports: icon('ic-reports'),
  rota: icon('ic-rota'),
  invitations: icon('ic-invitations'),
  plan: icon('ic-plan'),
  document: icon('ic-document'),
  feedback: icon('ic-feedback'),
  pendingApproval: icon('ic-check'),
  compliance: icon('ic-compliance'),
};

// ----------------------------------------------------------------------

export const navDataAdmin = [
  /**
   * Overview
   */
  {
    subheader: 'Overview',
    items: [
      // { title: 'Dashboard', path: paths.adminDashboard.root, icon: ICONS.dashboard },
      // { title: 'Statistics', path: paths.adminDashboard.statistics, icon: ICONS.analytics },
      // { title: 'Directory', path: paths.adminDashboard.directory.root, icon: ICONS.directory },
      // { title: 'Reports', path: paths.adminDashboard.reports, icon: ICONS.reports },
      // { title: 'Rota', path: paths.adminDashboard.rota, icon: ICONS.rota },
      // { title: 'Invitations', path: paths.adminDashboard.invitaions.root, icon: ICONS.invitations },
      // { title: "Kiosks", path: paths.adminDashboard.kiosk, icon: ICONS.course },
      // { title: 'PEEP & Floor Plan', path: paths.adminDashboard.PEEPandFloorPlan, icon: ICONS.plan },
      // { title: 'Documents', path: paths.adminDashboard.documents, icon: ICONS.document },
      // { title: 'Configuration', path: paths.adminDashboard.configuration, icon: ICONS.settings },
      // { title: "Pending Approval", path: paths.adminDashboard.pendingApproval, icon: ICONS.pendingApproval },
      // { title: "Roles", path: paths.adminDashboard.roles, icon: ICONS.lock },
      { title: 'Fire Drills', path: paths.adminDashboard.fireDrills, icon: ICONS.compliance },
    ],
  },
];
