export const ModuleSlug = {
  SIGN_IN_ATTENDANCE: 'signInAttendance',
  ROTA_SCHEDULING: 'rotaScheduling',
  FIRE_DRILL_EVACUATION: 'fireDrillEvacuation',
  PEEP_FLOOR_PLAN: 'peepFloorPlan',
  RESIDENTS: 'residents',
  DOCUMENTS_ESIGN: 'documentsEsign',
  LEAVE: 'leave',
  SHIFT_BIDDING: 'shiftBidding',
  COMPETENCY_SUPERVISION_APPRAISAL: 'competencySupervisionAppraisal',
  ONBOARDING_DBS: 'onboardingDbs',
  PAYROLL_FORECASTING: 'payrollForecasting',
  VISITOR_COMMS: 'visitorComms',
  AGENCY_SHIFT_BIDS: 'agencyShiftBids',
  FAMILY_ENGAGEMENT: 'familyEngagement',
};

export const ModuleAction = {
  VIEW: 'view',
  MANAGE: 'manage',
  APPROVE: 'approve',
};

export function isPlatformAdmin(user) {
  return user?.permission === 1;
}

function getModulePermissions(user, moduleSlug) {
  const modules = user?.access?.modules;
  if (!Array.isArray(modules) || !moduleSlug) return [];
  const match = modules.find((item) => item?.moduleSlug === moduleSlug);
  return Array.isArray(match?.permissions) ? match.permissions : [];
}

export function can(user, moduleSlug, action = ModuleAction.VIEW) {
  if (!user || !moduleSlug || !action) return false;
  if (isPlatformAdmin(user)) return true;
  return getModulePermissions(user, moduleSlug).includes(action);
}

export function canView(user, moduleSlug) {
  return can(user, moduleSlug, ModuleAction.VIEW);
}

export function canManage(user, moduleSlug) {
  return can(user, moduleSlug, ModuleAction.MANAGE);
}

export function canApprove(user, moduleSlug) {
  return can(user, moduleSlug, ModuleAction.APPROVE);
}

export function canViewKiosk(user) {
  return (
    canView(user, ModuleSlug.SIGN_IN_ATTENDANCE) ||
    canView(user, ModuleSlug.FIRE_DRILL_EVACUATION)
  );
}

export function canManageKiosk(user) {
  return (
    canManage(user, ModuleSlug.SIGN_IN_ATTENDANCE) ||
    canManage(user, ModuleSlug.FIRE_DRILL_EVACUATION)
  );
}

export function canViewNavItem(user, item) {
  if (!item) return false;
  if (Array.isArray(item.moduleSlugs) && item.moduleSlugs.length) {
    return item.moduleSlugs.some((slug) => canView(user, slug));
  }
  if (item.moduleSlug) {
    return canView(user, item.moduleSlug);
  }
  return true;
}

export function filterNavByModules(navData, user) {
  if (!Array.isArray(navData)) return [];
  if (isPlatformAdmin(user)) return navData;

  return navData
    .map((group) => {
      const items = (group.items || [])
        .map((item) => {
          if (!canViewNavItem(user, item)) return null;

          if (Array.isArray(item.children) && item.children.length) {
            const children = item.children.filter((child) => canViewNavItem(user, child));
            if (!children.length && (item.moduleSlug || item.moduleSlugs)) return null;
            if (!children.length && item.children.length) return null;
            return { ...item, children };
          }

          return item;
        })
        .filter(Boolean);

      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);
}
