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
    subheader: 'Employee',
    items: [
      { title: 'Dashboard', path: paths.staff.dashboard, icon: ICONS.dashboard },
      { title: 'Rota', path: paths.staff.rota, icon: ICONS.rota },
      { title: 'Attendance', path: paths.staff.attendance, icon: ICONS.clock },
      { title: 'Leave Requests', path: paths.staff.leaveRequests, icon: ICONS.calendar },
      { title: 'Shifts', path: paths.staff.shifts, icon: ICONS.shifts },
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
        children: [
          { title: 'Supervision', path: paths.staff.supervision },
          { title: 'Appraisal', path: paths.staff.appraisal },
          { title: 'Competencies', path: paths.staff.competencies },
          { title: 'Training Record', path: paths.staff.training },
        ],
      },
      { title: 'Documents', path: paths.staff.documents.root, icon: ICONS.document },
    ],
  },
  {
    subheader: 'FAMILY ENGAGEMENT',
    items: [
      { title: 'My Residents', path: paths.staff.familyEngagement.myResidents, icon: ICONS.user },
      { title: 'Photo Uploads', path: paths.staff.familyEngagement.photoUploads, icon: ICONS.check },
      { title: 'Community Wall', path: paths.staff.familyEngagement.communityWall, icon: ICONS.blog },
      { title: 'Gazettes', path: paths.staff.familyEngagement.gazettes, icon: ICONS.document },
    ],
  },
];