// ----------------------------------------------------------------------
// Memberships are scoped to the owner's organization. The owner's organization
// id is set on the user object at login — read it from there.
// ----------------------------------------------------------------------

/**
 * @param {object} user - the authenticated user (state.user.user)
 * @returns {string | null} the owner's organization id
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
 * @param {object} user
 * @returns {string} a display label for the owner's organization
 */
export function getOwnerOrganizationName(user) {
  return user?.organization?.name ?? '';
}
