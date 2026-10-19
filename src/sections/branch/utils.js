// ----------------------------------------------------------------------
// Re-export organization helper functions from canonical src/utils/organization
// ----------------------------------------------------------------------

export {
  getOwnerOrganizationId,
  getOwnerOrganizationName,
} from 'src/utils/organization';

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
