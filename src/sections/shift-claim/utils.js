// ----------------------------------------------------------------------
// Shift claims are scoped to the owner's organization. The owner's organization
// id is set on the user object at login — read it from there.
// ----------------------------------------------------------------------

/**
 * @param {object} user - the authenticated user (state.user.user)
 * @returns {string | null} the owner's organization id
 */
export function getOwnerOrganizationId(user) {
  return user?.organizationId ?? user?.organization?._id ?? null;
}

/**
 * @param {object} user
 * @returns {string} a display label for the owner's organization
 */
export function getOwnerOrganizationName(user) {
  return user?.organization?.name ?? '';
}

/**
 * @param {object} claim
 * @returns {string} the claiming staff member's name, or a fallback label
 */
export function getShiftClaimStaffName(claim) {
  if (!claim) return 'Unassigned';
  if (typeof claim.staff === 'string') return claim.staff;
  return (
    claim?.staff?.name ||
    claim?.staff?.user?.name ||
    (claim?.staff?.firstName ? `${claim.staff.firstName} ${claim?.staff?.lastName || ''}`.trim() : null) ||
    claim?.staff?.employeeCode ||
    'Unassigned'
  );
}
