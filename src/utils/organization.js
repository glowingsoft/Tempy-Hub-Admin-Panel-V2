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
