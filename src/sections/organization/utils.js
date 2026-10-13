// ----------------------------------------------------------------------
// Organization edit permission
//
// Only *invited* users may edit an organization's details. Users who are still
// completing their own onboarding ("onboarding" users) must not be able to.
//
// The distinction is carried on `user.accountState.userType`. Align the values
// below with the backend once the real auth flow is wired up.
// ----------------------------------------------------------------------

export const ONBOARDING_USER_TYPE = 'onboarding';

/**
 * @param {object} user - the authenticated user (state.user.user)
 * @returns {boolean} whether the user is allowed to edit organization details
 */
export function canEditOrganization(user) {
  const userType = user?.accountState?.userType;
  return !!userType && userType !== ONBOARDING_USER_TYPE;
}

export {
  getOwnerOrganizationId,
  getOwnerOrganizationName,
} from 'src/utils/organization';
