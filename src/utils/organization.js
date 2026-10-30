// ----------------------------------------------------------------------
// Canonical organization helper functions
// ----------------------------------------------------------------------

/**
 * Resolves the authenticated owner's organization ID.
 * Supports direct fields, owner memberships, and access organization fallbacks.
 *
 * @param {object} user - Authenticated user object from Redux state.user.user
 * @returns {string | null}
 */
export function getOwnerOrganizationId(user) {
  const directOrganizationId = user?.organizationId || user?.organization?._id;
  if (directOrganizationId) return directOrganizationId;

  const ownerOrganizationIds = [
    ...new Set(
      (user?.access?.memberships ?? [])
        .filter((membership) => membership.role === 'owner')
        .map((membership) =>
          typeof membership.organizationId === 'string'
            ? membership.organizationId
            : membership.organizationId?._id
        )
        .filter(Boolean)
    ),
  ];

  if (ownerOrganizationIds.length === 1) return ownerOrganizationIds[0];
  if (ownerOrganizationIds.length > 1) return null;

  const organizations = user?.access?.organizations ?? [];
  return organizations.length === 1 ? organizations[0]?._id ?? null : null;
}

/**
 * Returns a display label for the owner's organization.
 *
 * @param {object} user
 * @returns {string}
 */
export function getOwnerOrganizationName(user) {
  return user?.organization?.name ?? '';
}

function getEntityId(value) {
  if (!value) return '';
  return typeof value === 'object' ? value._id || '' : value;
}

/**
 * Resolves the assigned site (API branch) for a staff user.
 * Site / line managers store it on access.memberships, not user.branchId.
 */
export function getUserBranchId(user, organizationId) {
  const target = user?.user || user;
  if (!target) return '';

  const directBranchId = getEntityId(target.branchId) || getEntityId(target.branch);
  if (directBranchId) return directBranchId;

  const memberships = target.access?.memberships ?? [];
  const membership = organizationId
    ? memberships.find(
        (item) => getEntityId(item.organizationId) === organizationId && (item.branchId || item.branch)
      )
    : memberships.find((item) => item.branchId || item.branch);

  return getEntityId(membership?.branchId) || getEntityId(membership?.branch);
}
