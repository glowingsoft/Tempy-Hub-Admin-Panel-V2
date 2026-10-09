export const API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        ADMIN_LOGIN: 'admin/login',
        INVITATION_BY_TOKEN: (token) => `/auth/invitations/${token}`,
        ACCEPT_INVITATION: (token) => `/auth/invitations/${token}/accept`,
    },

    WALLETS: '/wallets',
    WALLETS_BY_ID: (id) => `/wallets/${id}`,

    TRANSACTIONS: '/transactions',
    TRANSACTIONS_BY_ID: (id) => `/transactions/${id}`,

    USERS: '/users',
    USERS_BY_ID: (id) => `/users/${id}`,

    CATEGORIES: '/categories',
    CATEGORIES_BY_ID: (id) => `/categories/${id}`,

    ORGANIZATIONS: '/admin/organizations',
    ORGANIZATION_BY_ID: (id) => `/admin/organizations/${id}`,
    ORGANIZATION_MODULE_ACCESS: (id) => `/admin/organizations/${id}/module-access`,
    MODULE_DEFINITIONS: '/admin/module-definitions',
    ORGANIZATION_DEPARTMENTS: (organizationId) => `/admin/organizations/${organizationId}/departments`,
    ORGANIZATION_DEPARTMENT_BY_ID: (organizationId, departmentId) =>
        `/admin/organizations/${organizationId}/departments/${departmentId}`,
    ORGANIZATION_JOB_TITLES: (organizationId) => `/admin/organizations/${organizationId}/job-titles`,
    ORGANIZATION_JOB_TITLE_BY_ID: (organizationId, jobTitleId) =>
        `/admin/organizations/${organizationId}/job-titles/${jobTitleId}`,
    ORGANIZATION_BRANCHES: (organizationId) => `/admin/organizations/${organizationId}/branches`,
    BRANCH_BY_ID: (branchId) => `/admin/branches/${branchId}`,
    ORGANIZATION_INVITATIONS: (organizationId) => `/admin/organizations/${organizationId}/invitations`,
    ORGANIZATION_INVITATION_BY_ID: (organizationId, invitationId) =>
        `/admin/organizations/${organizationId}/invitations/${invitationId}`,
    INVITATION_BY_ID: (invitationId) => `/admin/invitations/${invitationId}`,
    INVITATION_RESEND: (invitationId) => `/admin/invitations/${invitationId}/resend`,
    INVITATION_REVOKE: (invitationId) => `/admin/invitations/${invitationId}/revoke`,

    // Members / memberships — kept separate from the invitation flow.
    ORGANIZATION_MEMBERS: (organizationId) => `/admin/organizations/${organizationId}/members`,
    MEMBERSHIP_BY_ID: (membershipId) => `/admin/memberships/${membershipId}`,
    MEMBERSHIP_DEACTIVATE: (membershipId) => `/admin/memberships/${membershipId}/deactivate`,

    // Staff profiles — kept separate from members / invitations.
    ORGANIZATION_STAFF_PROFILES: (organizationId) =>
        `/admin/organizations/${organizationId}/staff-profiles`,
    STAFF_PROFILE_BY_ID: (staffProfileId) => `/admin/staff-profiles/${staffProfileId}`,
    ORGANIZATION_SHIFTS: (organizationId) => `/admin/organizations/${organizationId}/shifts`,
    SHIFT_BY_ID: (shiftId) => `/admin/shifts/${shiftId}`,
    STAFF_SHIFT_CLAIMS: (shiftId) => `/app/shifts/${shiftId}/claims`,

    // Shift claims — kept separate from shifts.
    ORGANIZATION_SHIFT_CLAIMS: (organizationId) =>
        `/admin/organizations/${organizationId}/shift-claims`,
    SHIFT_CLAIM_BY_ID: (shiftClaimId) => `/admin/shift-claims/${shiftClaimId}`,
    SHIFT_CLAIM_APPROVE: (shiftClaimId) => `/admin/shift-claims/${shiftClaimId}/approve`,

    // Leave requests / entitlements / approvals.
    ORGANIZATION_LEAVE_REQUESTS: (organizationId) =>
        `/admin/organizations/${organizationId}/leave-requests`,
    ORGANIZATION_LEAVE_ENTITLEMENTS: (organizationId) =>
        `/admin/organizations/${organizationId}/leave-entitlements`,
    LEAVE_APPROVAL_APPROVE: (leaveRequestId) => `/admin/leave-approvals/${leaveRequestId}/approve`,
    // TODO: confirm the reject path — assumed to mirror /approve.
    LEAVE_APPROVAL_REJECT: (leaveRequestId) => `/admin/leave-approvals/${leaveRequestId}/reject`,

    // Attendance (shared line-manager / owner listing).
    ORGANIZATION_ATTENDANCE: (organizationId) => `/admin/organizations/${organizationId}/attendance`,
    ATTENDANCE_BY_ID: (attendanceDayId) => `/admin/attendance/${attendanceDayId}`,

    // Residents
    RESIDENTS: '/admin/residents',
    RESIDENT_BY_ID: (residentId) => `/admin/residents/${residentId}`,
    RESIDENT_VISITOR_PASSCODE: (residentId) => `/admin/residents/${residentId}/visitor-passcode`,
    RESIDENT_VERIFY_PASSCODE: (residentId) => `/admin/residents/${residentId}/verify-passcode`,
};