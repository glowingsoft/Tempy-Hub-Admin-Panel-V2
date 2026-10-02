// ----------------------------------------------------------------------
// Shifts are scoped to the owner's organization. The owner's organization id is
// set on the user object at login — read it from there.
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
 * @param {object} shift
 * @returns {string} the assigned staff member's name, or an open/unassigned label
 */
export function getShiftStaffName(shift) {
  return shift?.staff?.user?.name || shift?.staff?.name || 'Open / Unassigned';
}
