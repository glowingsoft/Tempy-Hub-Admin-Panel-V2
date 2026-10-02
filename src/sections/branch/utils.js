// ----------------------------------------------------------------------
// Branches are always scoped to the owner's organization. The owner's
// organization id is set on the user object at login — read it from there.
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
 * Resolve the current IANA timezone from the browser (built-in Intl API).
 * @returns {string} e.g. "Europe/London" — falls back to "UTC".
 */
export function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}
