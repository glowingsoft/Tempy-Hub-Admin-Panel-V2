import { ModuleAction, ModuleSlug } from './permissions';

const ORG_ROOTS = ['/owner-dashboard', '/site-manager', '/line-manager', '/staff'];

const MODULE_PREFIXES = [
  { prefix: '/directory/visitor-invitation', moduleSlug: ModuleSlug.FIRE_DRILL_EVACUATION },
  { prefix: '/directory/visit-sessions', moduleSlug: ModuleSlug.FIRE_DRILL_EVACUATION },
  { prefix: '/family-engagement', moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
  { prefix: '/messages', moduleSlug: ModuleSlug.FAMILY_ENGAGEMENT },
  { prefix: '/peep-and-floor-plan', moduleSlug: ModuleSlug.PEEP_FLOOR_PLAN },
  { prefix: '/peep-and-Floor-plan', moduleSlug: ModuleSlug.PEEP_FLOOR_PLAN },
  { prefix: '/peep-records', moduleSlug: ModuleSlug.PEEP_FLOOR_PLAN },
  { prefix: '/floor-plans', moduleSlug: ModuleSlug.PEEP_FLOOR_PLAN },
  { prefix: '/org-rollup', moduleSlug: ModuleSlug.PEEP_FLOOR_PLAN },
  { prefix: '/rota-management', moduleSlug: ModuleSlug.ROTA_SCHEDULING },
  { prefix: '/team-rota', moduleSlug: ModuleSlug.ROTA_SCHEDULING },
  { prefix: '/shift-claims', moduleSlug: ModuleSlug.ROTA_SCHEDULING },
  { prefix: '/shifts', moduleSlug: ModuleSlug.ROTA_SCHEDULING },
  { prefix: '/rota', moduleSlug: ModuleSlug.ROTA_SCHEDULING },
  { prefix: '/team-attendance', moduleSlug: ModuleSlug.SIGN_IN_ATTENDANCE },
  { prefix: '/attendance', moduleSlug: ModuleSlug.SIGN_IN_ATTENDANCE },
  { prefix: '/leave-requests', moduleSlug: ModuleSlug.LEAVE },
  { prefix: '/leave-approval', moduleSlug: ModuleSlug.LEAVE },
  { prefix: '/documents', moduleSlug: ModuleSlug.DOCUMENTS_ESIGN },
  { prefix: '/fire-drills', moduleSlug: ModuleSlug.FIRE_DRILL_EVACUATION },
  { prefix: '/kiosks', kiosk: true },
  { prefix: '/kiosk', kiosk: true },
  { prefix: '/residents', moduleSlug: ModuleSlug.RESIDENTS },
  { prefix: '/supervision', moduleSlug: ModuleSlug.COMPETENCY_SUPERVISION_APPRAISAL },
  { prefix: '/appraisals', moduleSlug: ModuleSlug.COMPETENCY_SUPERVISION_APPRAISAL },
  { prefix: '/team-compliance', moduleSlug: ModuleSlug.COMPETENCY_SUPERVISION_APPRAISAL },
  { prefix: '/competencies', moduleSlug: ModuleSlug.COMPETENCY_SUPERVISION_APPRAISAL },
  { prefix: '/training', moduleSlug: ModuleSlug.COMPETENCY_SUPERVISION_APPRAISAL },
  { prefix: '/requirements', moduleSlug: ModuleSlug.COMPETENCY_SUPERVISION_APPRAISAL },
];

function stripOrgRoot(pathname) {
  if (!pathname) return null;

  return ORG_ROOTS.reduce((matched, root) => {
    if (matched) return matched;
    if (pathname === root) return '/';
    if (pathname.startsWith(`${root}/`)) return pathname.slice(root.length) || '/';
    return null;
  }, null);
}

function isManagePath(relativePath) {
  return /\/(new|edit|add-pin)(\/|$)/.test(relativePath);
}

export function getPathModuleRequirement(pathname) {
  const relativePath = stripOrgRoot(pathname);
  if (!relativePath || relativePath === '/') return null;

  const match = MODULE_PREFIXES.find(
    (item) => relativePath === item.prefix || relativePath.startsWith(`${item.prefix}/`)
  );

  if (!match) return null;

  return {
    ...match,
    action: isManagePath(relativePath) ? ModuleAction.MANAGE : ModuleAction.VIEW,
  };
}
