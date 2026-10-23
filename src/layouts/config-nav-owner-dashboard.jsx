import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  dashboard: icon('ic-dashboard'),
  chat: icon('ic-chat'),
  analytics: icon('ic-analytics'),
  directory: icon('ic-users'),
  rota: icon('ic-rota'),
  reports: icon('ic-reports'),
  folder: icon('ic-folder'),
  label: icon('ic-label'),
  booking: icon('ic-booking'),
  invitations: icon('ic-invitations'),
  user: icon('ic-user'),
  calendar: icon('ic-calendar'),
  check: icon('ic-check'),
  clock: icon('ic-clock'),
  plan: icon('ic-plan'),
  document: icon('ic-document'),
  supervision: icon('ic-users'),
  settings: icon('ic-settings'),
  external: icon('ic-external'),
  blog: icon('ic-blog'),
  mail: icon('ic-mail'),
  pendingApproval: icon('ic-check'),
  compliance: icon('ic-compliance'),
};

// ----------------------------------------------------------------------

export const navDataOwner = [
  {
    subheader: '',
    items: [
      { title: 'Dashboard', path: paths.owner.root, icon: ICONS.dashboard },
      { title: 'Sites', path: paths.owner.sites.root, icon: ICONS.booking },
      { title: 'Departments', path: paths.owner.departments.root, icon: ICONS.folder },
      { title: 'Job Titles', path: paths.owner.jobTitles.root, icon: ICONS.label },
      { title: 'Staff Profiles', path: paths.owner.staffProfiles.root, icon: ICONS.user },
      { title: 'Billing & Usage', path: paths.owner.dataUsage.root, icon: ICONS.folder },
      { title: 'Statistics', path: paths.owner.statistics, icon: ICONS.analytics },
      { title: 'General Directory', path: paths.owner.directory.root, icon: ICONS.directory },
      { title: 'Residents', path: paths.owner.residents.root, icon: ICONS.user },
      { title: 'Reports', path: paths.owner.reports, icon: ICONS.document },

      {
        title: 'Rota Management',
        path: paths.owner.rotaManagement.root,
        icon: ICONS.rota,
      },
      { title: 'Shifts', path: paths.owner.shifts.root, icon: ICONS.calendar },
      { title: 'Shift Claims', path: paths.owner.shiftClaims.root, icon: ICONS.check },

      { title: 'Kiosk', path: paths.owner.kiosk, icon: ICONS.folder },
      {
        title: 'PEEP & Floor Plans',
        path: paths.owner.peepAndFloorPlans.root,
        icon: ICONS.plan,
      },
      { title: 'Fire Drills', path: paths.owner.fireDrills, icon: ICONS.compliance },
      { title: 'Documents', path: paths.owner.documents.root, icon: ICONS.document },
      { title: 'Leave Requests', path: paths.owner.leaveRequests.root, icon: ICONS.calendar },
      { title: 'Attendance', path: paths.owner.attendance.root, icon: ICONS.clock },
      { title: 'Supervision', path: paths.owner.supervision, icon: ICONS.supervision },
      { title: 'Appraisals', path: paths.owner.appraisal, icon: ICONS.reports },
      {
        // Same shared-prefix rule as Rota so the group stays open between
        // Invitations and Members.
        title: 'Memberships',
        path: paths.owner.memberships.root,
        icon: ICONS.invitations,
        children: [
          { title: 'Invitations', path: paths.owner.memberships.invitations.root },
          { title: 'Members', path: paths.owner.memberships.members.root },
        ],
      },
      {
        title: 'Staff Dashboard Settings',
        path: paths.owner.staffDashboardSettings,
        icon: ICONS.settings,
      },
      {
        title: 'Configuration',
        path: paths.owner.configuration,
        icon: ICONS.settings,
      },
      {
        title: 'Settings',
        path: paths.owner.settings,
        icon: ICONS.settings,
      },

      { title: 'Connect to Tempy', path: paths.owner.tempyConnection, icon: ICONS.external },
    ],
  },
  /**
   * Family Engagement
   */
  {
    subheader: 'FAMILY ENGAGEMENT',
    items: [
      { title: 'Overview', path: paths.owner.familyEngagement.overview, icon: ICONS.directory },
      { title: 'Moderation', path: paths.owner.familyEngagement.moderation, icon: ICONS.pendingApproval },
      { title: 'Community Wall', path: paths.owner.familyEngagement.communityWall, icon: ICONS.blog },
      { title: 'Newsletters', path: paths.owner.familyEngagement.newsletters, icon: ICONS.mail },
      { title: 'Gazettes', path: paths.owner.familyEngagement.gazettes, icon: ICONS.document },
      { title: 'Family Groups', path: paths.owner.familyEngagement.familyGroups, icon: ICONS.user },
      {
        title: 'Memberships',
        path: paths.owner.familyEngagement.memberships.root,
        icon: ICONS.invitations,
        children: [
          { title: 'Invitations', path: paths.owner.familyEngagement.memberships.invitations.root },
          { title: 'Members', path: paths.owner.familyEngagement.memberships.members.root },
        ],
      },
      { title: 'Messages', path: paths.owner.messages, icon: ICONS.chat },
    ],
  },
];