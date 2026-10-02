/**
 * Fire drill / evacuation admin API map.
 * UI calls go through mock helpers today — replace bodies with these endpoints later.
 *
 * Base: /api/v1/admin
 * Auth: Bearer + membership; module fireDrillEvacuation
 * Org scope: path organizationId OR header x-org-id on /evacuations/:id routes
 */

export const FIRE_DRILL_API = {
  /** People currently on site before / during a drill (Screen 86 counts). */
  onSiteSummary: {
    method: 'GET',
    path: '/organizations/:organizationId/evacuations/on-site-summary',
    query: ['branchId'],
  },
  /** Live event for a site, or empty. */
  active: {
    method: 'GET',
    path: '/organizations/:organizationId/evacuations/active',
    query: ['branchId', 'includeStats'],
  },
  /** History list. */
  list: {
    method: 'GET',
    path: '/organizations/:organizationId/evacuations',
    query: ['branchId', 'status', 'type', 'page', 'limit'],
  },
  /** Start mock or real evacuation. */
  start: {
    method: 'POST',
    path: '/organizations/:organizationId/evacuations',
    body: ['branchId', 'type'],
  },
  /** Single event detail. */
  get: {
    method: 'GET',
    path: '/evacuations/:evacuationEventId',
    headers: ['x-org-id'],
  },
  /** Close active event. */
  close: {
    method: 'POST',
    path: '/evacuations/:evacuationEventId/close',
    headers: ['x-org-id'],
  },
  /** Rollcall rows. */
  listChecks: {
    method: 'GET',
    path: '/evacuations/:evacuationEventId/checks',
    query: ['unaccountedOnly', 'personKind', 'status'],
    headers: ['x-org-id'],
  },
  /** Mark person safe / missing. */
  upsertCheck: {
    method: 'POST',
    path: '/evacuations/:evacuationEventId/checks',
    body: ['personKind', 'personId', 'status', 'locationLabel', 'clientEventId'],
    headers: ['x-org-id'],
  },
};
