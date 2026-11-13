import { useSelector } from 'react-redux';

import { usePathname } from 'src/routes/hooks';

import { RoleBasedGuard } from './role-based-guard';
import { can, canManageKiosk, canViewKiosk, isPlatformAdmin, ModuleAction } from '../permissions';
import { getPathModuleRequirement } from '../route-module-map';

function Denied() {
  return <RoleBasedGuard hasContent currentRole="none" acceptRoles={[]} />;
}

export function ModuleGuard({ children }) {
  const pathname = usePathname();
  const user = useSelector((state) => state.user?.user);

  if (isPlatformAdmin(user)) {
    return children;
  }

  const requirement = getPathModuleRequirement(pathname);
  if (!requirement) {
    return children;
  }

  if (requirement.kiosk) {
    if (!canViewKiosk(user)) {
      return <Denied />;
    }
    if (requirement.action === ModuleAction.MANAGE && !canManageKiosk(user)) {
      return <Denied />;
    }
    return children;
  }

  if (!can(user, requirement.moduleSlug, ModuleAction.VIEW)) {
    return <Denied />;
  }

  if (requirement.action === ModuleAction.MANAGE && !can(user, requirement.moduleSlug, ModuleAction.MANAGE)) {
    return <Denied />;
  }

  return children;
}
