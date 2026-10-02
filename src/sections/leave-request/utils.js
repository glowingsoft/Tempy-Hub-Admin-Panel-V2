import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------
// Leave requests are shown in two places from ONE component:
//   - Owner Dashboard        -> variant "owner"        (can always set entitlement)
//   - Line Manager Dashboard -> variant "lineManager"  (set entitlement only if allowed)
// `getLeaveRequestContext(variant)` centralises the per-surface wiring so the
// views stay identical.
// ----------------------------------------------------------------------

export const LEAVE_REQUEST_VARIANTS = ['owner', 'lineManager'];

export function getLeaveRequestContext(variant = 'owner') {
  if (variant === 'lineManager') {
    return {
      variant,
      heading: 'Leave Approval',
      dashboardHref: paths.lineManager.root,
      listHref: paths.lineManager.leaveApproval.root,
      detailHref: (id) => paths.lineManager.leaveApproval.detail(id),
      // Owner grants this; wire to the real permission flag when it exists.
      defaultCanSetEntitlement: false,
    };
  }

  return {
    variant: 'owner',
    heading: 'Leave Requests',
    dashboardHref: paths.owner.root,
    listHref: paths.owner.leaveRequests.root,
    detailHref: (id) => paths.owner.leaveRequests.detail(id),
    defaultCanSetEntitlement: true,
  };
}

// ----------------------------------------------------------------------
// The owner's organization id is set on the user object at login.
// ----------------------------------------------------------------------

/**
 * @param {object} user - the authenticated user (state.user.user)
 * @returns {string | null} the organization id, when present on the user
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
 * @param {object} request
 * @returns {string} the requesting staff member's name, or a fallback label
 */
export function getLeaveRequestStaffName(request) {
  return request?.staff?.name || request?.staff?.email || 'Unknown';
}
