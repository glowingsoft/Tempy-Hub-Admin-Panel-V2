import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useSearchParams } from 'src/routes/hooks';
import { getOwnerOrganizationId, getOwnerOrganizationName } from 'src/utils/organization';

// ----------------------------------------------------------------------

/**
 * Reads the persisted user from Redux state or localStorage fallback.
 */
function getPersistedUser(reduxUser) {
  if (reduxUser) {
    return reduxUser?.user || reduxUser;
  }

  try {
    const rawRoot = localStorage.getItem('persist:root');
    if (!rawRoot) return null;
    const parsedRoot = JSON.parse(rawRoot);
    if (!parsedRoot?.user) return null;
    const userSlice = JSON.parse(parsedRoot.user);
    return userSlice?.user || userSlice;
  } catch (_) {
    return null;
  }
}

/**
 * Extracts organization ID from the authenticated / persisted user object.
 */
function extractUserOrganizationId(targetUser) {
  if (!targetUser) return null;
  const target = targetUser?.user || targetUser;

  // 1. Direct organizationId field (string or populated object)
  if (target?.organizationId) {
    const id = typeof target.organizationId === 'object' ? target.organizationId._id : target.organizationId;
    if (id) return id;
  }

  // 2. Direct organization field (string or populated object)
  if (target?.organization) {
    const id = typeof target.organization === 'string' ? target.organization : target.organization?._id;
    if (id) return id;
  }

  // 3. activeOrganizationId or currentOrganizationId on user
  if (target?.activeOrganizationId) return target.activeOrganizationId;
  if (target?.currentOrganizationId) return target.currentOrganizationId;

  // 4. Owner membership or single access organization
  const ownerOrgId = getOwnerOrganizationId(target);
  if (ownerOrgId) return ownerOrgId;

  // 5. Access organizations list fallback
  const accessOrgs = target?.access?.organizations || target?.organizations;
  if (Array.isArray(accessOrgs) && accessOrgs.length > 0) {
    const firstOrg = accessOrgs[0];
    return typeof firstOrg === 'string' ? firstOrg : firstOrg?._id || null;
  }

  return null;
}

/**
 * Extracts organization display name from the persisted user object.
 */
function extractUserOrganizationName(targetUser) {
  if (!targetUser) return '';
  const target = targetUser?.user || targetUser;

  if (target?.organization && typeof target.organization === 'object' && target.organization.name) {
    return target.organization.name;
  }

  if (target?.organizationName) return target.organizationName;

  const ownerName = getOwnerOrganizationName(target);
  if (ownerName) return ownerName;

  const accessOrgs = target?.access?.organizations || target?.organizations;
  if (Array.isArray(accessOrgs) && accessOrgs.length > 0) {
    const firstOrg = accessOrgs[0];
    if (typeof firstOrg === 'object' && firstOrg?.name) {
      return firstOrg.name;
    }
  }

  return '';
}

// ----------------------------------------------------------------------

/**
 * Custom hook to resolve the current active organization context.
 * Uses localStorage (instead of sessionStorage) and extracts data from the persisted user.
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
  const { user: reduxUser } = useSelector((state) => state.user);
  const searchParams = useSearchParams();

  const effectiveUser = useMemo(() => getPersistedUser(reduxUser), [reduxUser]);

  const queryOrgId = searchParams.get('orgId') || searchParams.get('organizationId');

  const resolvedOrganizationId = useMemo(() => {
    // 1. Explicit prop override
    if (propOrgId !== undefined && propOrgId !== null && propOrgId !== '') {
      try {
        localStorage.setItem('activeOrganizationId', propOrgId);
      } catch (_) {}
      return propOrgId;
    }

    // 2. Query parameter (?orgId=... or ?organizationId=...)
    if (queryOrgId) {
      try {
        localStorage.setItem('activeOrganizationId', queryOrgId);
      } catch (_) {}
      return queryOrgId;
    }

    // 3. Organization from persisted user
    const userOrgId = extractUserOrganizationId(effectiveUser);
    if (userOrgId) {
      try {
        localStorage.setItem('activeOrganizationId', userOrgId);
      } catch (_) {}
      return userOrgId;
    }

    // 4. Stored active organization in localStorage
    try {
      const storedOrgId = localStorage.getItem('activeOrganizationId');
      if (storedOrgId) return storedOrgId;
    } catch (_) {}

    return null;
  }, [propOrgId, queryOrgId, effectiveUser]);

  const organizationName = useMemo(() => {
    // 1. Organization name from persisted user
    const userName = extractUserOrganizationName(effectiveUser);
    if (userName) return userName;

    // 2. Stored active organization name in localStorage
    try {
      const storedName = localStorage.getItem('activeOrganizationName');
      if (storedName) return storedName;
    } catch (_) {}

    return '';
  }, [effectiveUser]);

  const isOwner =
    effectiveUser?.permission === 4 ||
    effectiveUser?.role === 'owner' ||
    effectiveUser?.role === 'Organization Owner';

  return {
    organizationId: resolvedOrganizationId,
    organizationName,
    isOwner,
    user: effectiveUser,
  };
}
