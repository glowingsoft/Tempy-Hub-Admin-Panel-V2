
import { ModuleSlug } from 'src/auth/permissions';
import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

export const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;


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
    subheader: '',
    items: [
      { title: 'Dashboard', path: paths.lineManager.root, icon: ICONS.dashboard },

      { title: 'Rota', path: paths.lineManager.teamRota, icon: ICONS.rota, moduleSlug: ModuleSlug.ROTA_SCHEDULING },

      { title: "Leave Requests", path: paths.lineManager.leaveApproval.root, icon: ICONS.pendingApproval, moduleSlug: ModuleSlug.LEAVE },

      { title: 'Team Attendance', path: paths.lineManager.teamAttendance, icon: ICONS.invitations, moduleSlug: ModuleSlug.SIGN_IN_ATTENDANCE },

      {
        title: 'Supervision & Appraisal',
        path: paths.lineManager.supervision,
        activePaths: [
          paths.lineManager.supervision,
          paths.lineManager.appraisal,
          paths.lineManager.teamCompliance,
          paths.lineManager.training,
          paths.lineManager.requirements,
        ],
        icon: ICONS.directory,
        moduleSlug: ModuleSlug.COMPETENCY_SUPERVISION_APPRAISAL,
        children: [
          { title: 'Supervision', path: paths.lineManager.supervision },
          { title: 'Appraisal', path: paths.lineManager.appraisal },
          { title: 'Competencies', path: paths.lineManager.teamCompliance },
          { title: 'Training Record', path: paths.lineManager.training },
          { title: 'Requirements', path: paths.lineManager.requirements },
        ],
      },

      // { title: "Uploaded Photos", path: paths.lineManager.photoApproval, icon: ICONS.pendingApproval },

      { title: 'Visitor Feedback', path: paths.lineManager.feedback, icon: ICONS.feedback },

      { title: 'Fire Drills', path: paths.lineManager.fireDrills, icon: ICONS.compliance, moduleSlug: ModuleSlug.FIRE_DRILL_EVACUATION },

      { title: 'Residents', path: paths.lineManager.residents, icon: ICONS.user, moduleSlug: ModuleSlug.RESIDENTS },

      { title: 'Documents', path: paths.lineManager.documents.root, icon: ICONS.document, moduleSlug: ModuleSlug.DOCUMENTS_ESIGN },

      { title: 'Connect to Tempy', path: paths.lineManager.tempyConnection, icon: ICONS.external },
    ],
  },
  /**
   * Family Engagement
   */
  {
    subheader: 'FAMILY ENGAGEMENT',
    items: [
      { title: 'Moderation', path: paths.lineManager.familyEngagement.moderation, icon: ICONS.pendingApproval, moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
      { title: 'Community Wall', path: paths.lineManager.familyEngagement.communityWall, icon: ICONS.blog, moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
      {
        title: 'Memberships',
        path: paths.lineManager.familyEngagement.memberships.root,
        icon: ICONS.invitations,
        moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT,
        children: [
          { title: 'Invitations', path: paths.lineManager.familyEngagement.memberships.invitations.root },
          { title: 'Members', path: paths.lineManager.familyEngagement.memberships.members.root },
        ],
      },
      { title: 'Messages', path: paths.lineManager.messages, icon: ICONS.chat, moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
    ],
  },
];