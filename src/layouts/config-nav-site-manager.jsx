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
  supervision: icon('ic-users'),
};

// ----------------------------------------------------------------------

export const navDataSiteManager = [
  /**
   * Overview
   */
  {
    subheader: '',
    items: [
      { title: 'Dashboard', path: paths.siteManager.root, icon: ICONS.dashboard },
      { title: 'Statistics', path: paths.siteManager.statistics, icon: ICONS.analytics },
      { title: 'General Directory', path: paths.siteManager.directory.root, icon: ICONS.directory },
      { title: 'Residents', path: paths.siteManager.residents.root, icon: ICONS.user },
      { title: 'Reports', path: paths.siteManager.reports, icon: ICONS.reports },
      { title: 'Rota', path: paths.siteManager.rota, icon: ICONS.rota },
      { title: 'Invitations', path: paths.siteManager.invitaions.root, icon: ICONS.invitations },
      { title: "Kiosks", path: paths.siteManager.kiosk, icon: ICONS.course },
      { title: 'Visitor Feedback', path: paths.siteManager.feedback, icon: ICONS.feedback },
      { title: 'Fire Drills', path: paths.siteManager.fireDrills, icon: ICONS.compliance },
      { title: 'PEEP & Floor Plan', path: paths.siteManager.PEEPandFloorPlan, icon: ICONS.plan },
      { title: 'Documents', path: paths.siteManager.documents.root, icon: ICONS.document },

      {
        title: 'Supervision & Appraisal',
        path: paths.siteManager.supervision,
        activePaths: [
          paths.siteManager.supervision,
          paths.siteManager.appraisal,
          paths.siteManager.teamCompliance,
          paths.siteManager.training,
        ],
        icon: ICONS.supervision,
        children: [
          { title: 'Supervision', path: paths.siteManager.supervision },
          { title: 'Appraisal', path: paths.siteManager.appraisal },
          { title: 'Competencies', path: paths.siteManager.teamCompliance },
          { title: 'Training Record', path: paths.siteManager.training },
        ],
      },
      { title: 'Configuration', path: paths.siteManager.configuration, icon: ICONS.settings },
      { title: "Approvals", path: paths.siteManager.pendingApproval, icon: ICONS.pendingApproval },
      { title: "Roles", path: paths.siteManager.roles, icon: ICONS.lock },
    ],
  },
  /**
   * Family Engagement
   */
  {
    subheader: 'FAMILY ENGAGEMENT',
    items: [
      { title: 'Overview', path: paths.siteManager.familyEngagement.overview, icon: ICONS.directory },
      { title: 'Moderation', path: paths.siteManager.familyEngagement.moderation, icon: ICONS.pendingApproval },
      { title: 'Community Wall', path: paths.siteManager.familyEngagement.communityWall, icon: ICONS.blog },
      { title: 'Newsletters', path: paths.siteManager.familyEngagement.newsletters, icon: ICONS.mail },
      { title: 'Gazettes', path: paths.siteManager.familyEngagement.gazettes, icon: ICONS.document },
      { title: 'Family Groups', path: paths.siteManager.familyEngagement.familyGroups, icon: ICONS.user },
      {
        title: 'Memberships',
        path: paths.siteManager.familyEngagement.memberships.root,
        icon: ICONS.invitations,
        children: [
          { title: 'Invitations', path: paths.siteManager.familyEngagement.memberships.invitations.root },
          { title: 'Members', path: paths.siteManager.familyEngagement.memberships.members.root },
        ],
      },
      { title: 'Messages', path: paths.siteManager.messages, icon: ICONS.chat },
    ],
  },
];