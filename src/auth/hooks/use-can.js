import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import {
  ModuleAction,
  can,
  canApprove,
  canManage,
  canView,
  canManageKiosk,
  canViewKiosk,
} from '../permissions';

export function useCurrentUser() {
  return useSelector((state) => state.user?.user);
}

export function useCan(moduleSlug, action = ModuleAction.VIEW) {
  const user = useCurrentUser();
  return useMemo(() => can(user, moduleSlug, action), [user, moduleSlug, action]);
}

export function useCanView(moduleSlug) {
  const user = useCurrentUser();
  return useMemo(() => canView(user, moduleSlug), [user, moduleSlug]);
}

export function useCanManage(moduleSlug) {
  const user = useCurrentUser();
  return useMemo(() => canManage(user, moduleSlug), [user, moduleSlug]);
}

export function useCanApprove(moduleSlug) {
  const user = useCurrentUser();
  return useMemo(() => canApprove(user, moduleSlug), [user, moduleSlug]);
}

export function useCanViewKiosk() {
  const user = useCurrentUser();
  return useMemo(() => canViewKiosk(user), [user]);
}

export function useCanManageKiosk() {
  const user = useCurrentUser();
  return useMemo(() => canManageKiosk(user), [user]);
}
