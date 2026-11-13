import { ModuleSlug } from 'src/auth/permissions';
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
      { title: 'Residents', path: paths.owner.residents.root, icon: ICONS.user, moduleSlug: ModuleSlug.RESIDENTS },
      { title: 'Reports', path: paths.owner.reports, icon: ICONS.document },

      {
        title: 'Rota Management',
        path: paths.owner.rotaManagement.root,
        icon: ICONS.rota,
        moduleSlug: ModuleSlug.ROTA_SCHEDULING,
      },
      { title: 'Shifts', path: paths.owner.shifts.root, icon: ICONS.calendar, moduleSlug: ModuleSlug.ROTA_SCHEDULING },
      { title: 'Shift Claims', path: paths.owner.shiftClaims.root, icon: ICONS.check, moduleSlug: ModuleSlug.ROTA_SCHEDULING },

      {
        title: 'Kiosk',
        path: paths.owner.kiosk,
        icon: ICONS.folder,
        moduleSlugs: [ModuleSlug.SIGN_IN_ATTENDANCE, ModuleSlug.FIRE_DRILL_EVACUATION],
      },
      {
        title: 'PEEP & Floor Plans',
        path: paths.owner.peepAndFloorPlans.root,
        icon: ICONS.plan,
        moduleSlug: ModuleSlug.PEEP_FLOOR_PLAN,
      },
      { title: 'Fire Drills', path: paths.owner.fireDrills, icon: ICONS.compliance, moduleSlug: ModuleSlug.FIRE_DRILL_EVACUATION },
      { title: 'Documents', path: paths.owner.documents.root, icon: ICONS.document, moduleSlug: ModuleSlug.DOCUMENTS_ESIGN },
      { title: 'Leave Requests', path: paths.owner.leaveRequests.root, icon: ICONS.calendar, moduleSlug: ModuleSlug.LEAVE },
      { title: 'Attendance', path: paths.owner.attendance.root, icon: ICONS.clock, moduleSlug: ModuleSlug.SIGN_IN_ATTENDANCE },

      {
        title: 'Supervision & Appraisal',
        path: paths.owner.supervision,
        activePaths: [
          paths.owner.supervision,
          paths.owner.appraisal,
          paths.owner.teamCompliance,
          paths.owner.training,
          paths.owner.requirements,
        ],
        icon: ICONS.supervision,
        moduleSlug: ModuleSlug.COMPETENCY_SUPERVISION_APPRAISAL,
        children: [
          { title: 'Supervision', path: paths.owner.supervision },
          { title: 'Appraisal', path: paths.owner.appraisal },
          { title: 'Competencies', path: paths.owner.teamCompliance },
          { title: 'Training Record', path: paths.owner.training },
          { title: 'Requirements', path: paths.owner.requirements },
        ],
      },
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
      { title: 'Overview', path: paths.owner.familyEngagement.overview, icon: ICONS.directory, moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
      { title: 'Moderation', path: paths.owner.familyEngagement.moderation, icon: ICONS.pendingApproval, moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
      { title: 'Community Wall', path: paths.owner.familyEngagement.communityWall, icon: ICONS.blog, moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
      { title: 'Newsletters', path: paths.owner.familyEngagement.newsletters, icon: ICONS.mail, moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
      { title: 'Gazettes', path: paths.owner.familyEngagement.gazettes, icon: ICONS.document, moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
      { title: 'Family Groups', path: paths.owner.familyEngagement.familyGroups, icon: ICONS.user, moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
      {
        title: 'Family Memberships',
        path: paths.owner.familyEngagement.memberships.root,
        icon: ICONS.invitations,
        moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT,
        children: [
          { title: 'Invitations', path: paths.owner.familyEngagement.memberships.invitations.root },
          { title: 'Members', path: paths.owner.familyEngagement.memberships.members.root },
        ],
      },
      { title: 'Messages', path: paths.owner.messages, icon: ICONS.chat, moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
      { title: 'Settings', path: paths.owner.familyEngagement.settings, icon: ICONS.settings, moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
    ],
  },
];