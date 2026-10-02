
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
  compliance: icon("ic-compliance")
};

// ----------------------------------------------------------------------

export const navDataLineManager = [
  /**
   * Overview
   */
  {
    subheader: 'Overview',
    items: [
      { title: 'Dashboard', path: paths.lineManager.root, icon: ICONS.dashboard },

      { title: 'Rota', path: paths.lineManager.teamRota, icon: ICONS.rota },

      { title: "Leave Requests", path: paths.lineManager.leaveApproval.root, icon: ICONS.pendingApproval },

      { title: 'Team Attendance', path: paths.lineManager.teamAttendance, icon: ICONS.invitations },

      { title: 'Team Compliance', path: paths.lineManager.teamCompliance, icon: ICONS.compliance },

      { title: 'Supervision', path: paths.lineManager.supervision, icon: ICONS.directory },

      { title: 'Appraisals', path: paths.lineManager.appraisal, icon: ICONS.reports },

      { title: 'Training Records', path: paths.lineManager.training, icon: ICONS.course },

      { title: "Uploaded Photos", path: paths.lineManager.photoApproval, icon: ICONS.pendingApproval },

      { title: 'Feedback', path: paths.lineManager.feedback, icon: ICONS.feedback },

      { title: 'Fire Drills', path: paths.lineManager.fireDrills, icon: ICONS.compliance },

      { title: 'Residents', path: paths.lineManager.residents, icon: ICONS.user },

      { title: 'Documents', path: paths.lineManager.documents.root, icon: ICONS.document },

      { title: 'Connect to Tempy', path: paths.lineManager.tempyConnection, icon: ICONS.external },
    ],
  },
];
