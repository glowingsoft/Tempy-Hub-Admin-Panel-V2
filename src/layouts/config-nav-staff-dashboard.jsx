import { ModuleSlug } from 'src/auth/permissions';
import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { SvgColor } from 'src/components/svg-color';

const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  dashboard: icon('ic-dashboard'),
  clock: icon('ic-clock'),
  calendar: icon('ic-calendar'),
  shifts: icon('ic-plan'),
  competencies: icon('ic-compliance'),
  supervision: icon('ic-users'),
  document: icon('ic-document'),
  rota: icon('ic-rota'),
  blog: icon('ic-blog'),
  check: icon('ic-check'),
  user: icon('ic-user'),
};

export const navDataStaff = [
  {
    subheader: '',
    items: [
      { title: 'Dashboard', path: paths.staff.dashboard, icon: ICONS.dashboard },
      { title: 'Rota', path: paths.staff.rota, icon: ICONS.rota, moduleSlug: ModuleSlug.ROTA_SCHEDULING },
      { title: 'Attendance', path: paths.staff.attendance, icon: ICONS.clock, moduleSlug: ModuleSlug.SIGN_IN_ATTENDANCE },
      { title: 'Leave Requests', path: paths.staff.leaveRequests, icon: ICONS.calendar, moduleSlug: ModuleSlug.LEAVE },
      { title: 'My Shifts', path: paths.staff.shifts, icon: ICONS.shifts, moduleSlug: ModuleSlug.ROTA_SCHEDULING },
      { title: 'Shift Claim', path: paths.staff.shiftClaims, icon: ICONS.check, moduleSlug: ModuleSlug.ROTA_SCHEDULING },
      {
        title: 'Supervision & Appraisal',
        path: paths.staff.supervision,
        activePaths: [
          paths.staff.supervision,
          paths.staff.appraisal,
          paths.staff.competencies,
          paths.staff.training,
        ],
        icon: ICONS.supervision,
        moduleSlug: ModuleSlug.COMPETENCY_SUPERVISION_APPRAISAL,
        children: [
          { title: 'Supervision', path: paths.staff.supervision },
          { title: 'Appraisal', path: paths.staff.appraisal },
          { title: 'Competencies', path: paths.staff.competencies },
          { title: 'Training Record', path: paths.staff.training },
        ],
      },
      { title: 'Documents', path: paths.staff.documents.root, icon: ICONS.document, moduleSlug: ModuleSlug.DOCUMENTS_ESIGN },
    ],
  },
  {
    subheader: 'FAMILY ENGAGEMENT',
    items: [
      { title: 'My Residents', path: paths.staff.familyEngagement.myResidents, icon: ICONS.user, moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
      { title: 'Photo Upload', path: paths.staff.familyEngagement.photoUploads, icon: ICONS.check, moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
      { title: 'Community Wall', path: paths.staff.familyEngagement.communityWall, icon: ICONS.blog, moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
      { title: 'Gazettes', path: paths.staff.familyEngagement.gazettes, icon: ICONS.document, moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
    ],
  },
];