import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { getOwnerOrganizationId, getOwnerOrganizationName } from 'src/utils/organization';

// ----------------------------------------------------------------------

/**
 * Custom hook to resolve the current active organization context.
 *
 * @param {string | null} [propOrgId] - Optional override organization ID prop
 * @returns {{
 *   organizationId: string | null,
 *   organizationName: string,
 *   isOwner: boolean,
 *   user: object
 * }}
 */
export function useCurrentOrganization(propOrgId) {
  const { user } = useSelector((state) => state.user);

  const resolvedOrganizationId = useMemo(() => {
    if (propOrgId !== undefined && propOrgId !== null && propOrgId !== '') {
      return propOrgId;
    }
    return getOwnerOrganizationId(user);
  }, [propOrgId, user]);

  const organizationName = useMemo(() => getOwnerOrganizationName(user), [user]);

  const isOwner = user?.permission === 4 || user?.role === 'owner';

  return {
    organizationId: resolvedOrganizationId,
    organizationName,
    isOwner,
    user,
  };
}
