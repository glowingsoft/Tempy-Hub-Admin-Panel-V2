export const API_ROUTES = {
    // File uploads
    UPLOAD_S3: '/upload/s3',
    AUTH: {
        LOGIN: '/auth/login',
        ADMIN_LOGIN: 'admin/login',
        RESEND_OTP_EMAIL: '/auth/resend-otp/email',
        VERIFY_OTP_EMAIL: '/auth/verify-otp/email',
        RESET_PASSWORD: '/auth/reset-password',
        CHANGE_PASSWORD: '/auth/change-password',
        INVITATION_BY_TOKEN: (token) => `/auth/invitations/${token}`,
        ACCEPT_INVITATION: (token) => `/auth/invitations/${token}/accept`,
    },

    WALLETS: '/wallets',
    WALLETS_BY_ID: (id) => `/wallets/${id}`,

    TRANSACTIONS: '/transactions',
    TRANSACTIONS_BY_ID: (id) => `/transactions/${id}`,

    USERS: '/users',
    USERS_BY_ID: (id) => `/users/${id}`,
    APP_USER_PROFILE: '/app/users/profile',

    CATEGORIES: '/categories',
    CATEGORIES_BY_ID: (id) => `/categories/${id}`,

    ORGANIZATIONS: '/admin/organizations',
    ORGANIZATION_BY_ID: (id) => `/admin/organizations/${id}`,
    ORGANIZATION_MODULE_ACCESS: (id) => `/admin/organizations/${id}/module-access`,
    ORGANIZATION_STAFF_DASHBOARD_SETTINGS: (organizationId) =>
        `/admin/organizations/${organizationId}/staff-dashboard-settings`,
    ORGANIZATION_DASHBOARD: (organizationId) =>
        `/admin/organizations/${organizationId}/dashboard`,
    ORGANIZATION_SITE_DASHBOARD: (organizationId) =>
        `/admin/organizations/${organizationId}/site-dashboard`,
    ORGANIZATION_LINE_DASHBOARD: (organizationId) =>
        `/admin/organizations/${organizationId}/line-dashboard`,
    ORGANIZATION_STAFF_HOME_DASHBOARD: (organizationId) =>
        `/admin/organizations/${organizationId}/staff-dashboard`,
    ORGANIZATION_VISITOR_SURVEY_SETTINGS: (organizationId) =>
        `/admin/organizations/${organizationId}/visitor-survey-settings`,
    ORGANIZATION_VISITOR_SURVEY_QUESTIONS: (organizationId) =>
        `/admin/organizations/${organizationId}/visitor-survey-questions`,
    ORGANIZATION_VISITOR_FEEDBACK: (organizationId) =>
        `/admin/organizations/${organizationId}/visitor-survey-responses`,
    ORGANIZATION_VISITOR_SURVEY_RESPONSES: (organizationId) =>
        `/admin/organizations/${organizationId}/visitor-survey-responses`,
    ORGANIZATION_DASHBOARD: (organizationId) =>
        `/admin/organizations/${organizationId}/dashboard`,
    ORGANIZATION_SITE_DASHBOARD: (organizationId) =>
        `/admin/organizations/${organizationId}/site-dashboard`,
    ORGANIZATION_LINE_DASHBOARD: (organizationId) =>
        `/admin/organizations/${organizationId}/line-dashboard`,
    ORGANIZATION_STAFF_HOME_DASHBOARD: (organizationId) =>
        `/admin/organizations/${organizationId}/staff-dashboard`,
    MODULE_DEFINITIONS: '/admin/module-definitions',
    ORGANIZATION_DEPARTMENTS: (organizationId) => `/admin/organizations/${organizationId}/departments`,
    ORGANIZATION_DEPARTMENT_BY_ID: (organizationId, departmentId) =>
        `/admin/organizations/${organizationId}/departments/${departmentId}`,
    ORGANIZATION_JOB_TITLES: (organizationId) => `/admin/organizations/${organizationId}/job-titles`,
    ORGANIZATION_JOB_TITLE_BY_ID: (organizationId, jobTitleId) =>
        `/admin/organizations/${organizationId}/job-titles/${jobTitleId}`,
    ORGANIZATION_BRANCHES: (organizationId) => `/admin/organizations/${organizationId}/branches`,
    BRANCH_BY_ID: (branchId) => `/admin/branches/${branchId}`,
    BRANCH_ACTIVATION_CODES: (branchId) => `/admin/branches/${branchId}/activation-codes`,
    ORGANIZATION_INVITATIONS: (organizationId) => `/admin/organizations/${organizationId}/invitations`,
    ORGANIZATION_INVITATION_BY_ID: (organizationId, invitationId) =>
        `/admin/organizations/${organizationId}/invitations/${invitationId}`,
    INVITATION_BY_ID: (invitationId) => `/admin/invitations/${invitationId}`,
    INVITATION_RESEND: (invitationId) => `/admin/invitations/${invitationId}/resend`,
    INVITATION_REVOKE: (invitationId) => `/admin/invitations/${invitationId}/revoke`,
    ORGANIZATION_GRANTABLE_PERMISSIONS: (organizationId) =>
        `/admin/organizations/${organizationId}/grantable-permissions`,

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
    STAFF_MY_SHIFTS: '/app/shifts/my',
    STAFF_OPEN_SHIFTS: '/app/shifts/open',
    STAFF_SHIFT_CLAIMS: (shiftId) => `/app/shifts/${shiftId}/claims`,

    // Shift claims — kept separate from shifts.
    ORGANIZATION_SHIFT_CLAIMS: (organizationId) =>
        `/admin/organizations/${organizationId}/shift-claims`,
    ORGANIZATION_SHIFT_CLAIM_BY_ID: (organizationId, claimId) =>
        `/admin/organizations/${organizationId}/shift-claims/${claimId}`,
    SHIFT_CLAIM_BY_ID: (shiftClaimId) => `/admin/shift-claims/${shiftClaimId}`,
    SHIFT_CLAIM_APPROVE: (shiftClaimId) => `/admin/shift-claims/${shiftClaimId}/approve`,

    // Leave requests / entitlements / approvals.
    STAFF_LEAVE_REQUESTS: '/app/leave-requests',
    ORGANIZATION_LEAVE_REQUESTS: (organizationId) =>
        `/admin/organizations/${organizationId}/leave-requests`,
    LEAVE_REQUEST_BY_ID: (leaveRequestId) => `/admin/leave-requests/${leaveRequestId}`,
    ORGANIZATION_LEAVE_ENTITLEMENTS: (organizationId) =>
        `/admin/organizations/${organizationId}/leave-entitlements`,
    LEAVE_APPROVAL_APPROVE: (leaveRequestId) => `/admin/leave-approvals/${leaveRequestId}/approve`,
    // TODO: confirm the reject path — assumed to mirror /approve.
    LEAVE_APPROVAL_REJECT: (leaveRequestId) => `/admin/leave-approvals/${leaveRequestId}/reject`,

    // Staff attendance and shared line-manager / owner attendance listings.
    STAFF_ATTENDANCE: '/app/attendance',
    ORGANIZATION_ATTENDANCE: (organizationId) => `/admin/organizations/${organizationId}/attendance`,
    ORGANIZATION_ATTENDANCE_ROTA: (organizationId) =>
        `/admin/organizations/${organizationId}/attendance/rota`,
    ATTENDANCE_BY_ID: (attendanceDayId) => `/admin/attendance/${attendanceDayId}`,
    ORGANIZATION_ATTENDANCE_CHANGE_REQUESTS: (organizationId) =>
        `/admin/organizations/${organizationId}/attendance-change-requests`,
    REPORTS_ATTENDANCE: (organizationId) =>
        `/admin/organizations/${organizationId}/reports/attendance`,
    REPORTS_STAFF_HOURS_SUMMARY: (organizationId) =>
        `/admin/organizations/${organizationId}/reports/staff-hours-summary`,
    REPORTS_VISITOR_CHECK_INS: (organizationId) =>
        `/admin/organizations/${organizationId}/reports/visitor-check-ins`,
    REPORTS_SICKNESS_RATE: (organizationId) =>
        `/admin/organizations/${organizationId}/reports/sickness-rate`,
    REPORTS_LATE_CHECK_INS: (organizationId) =>
        `/admin/organizations/${organizationId}/reports/late-check-ins`,

    // Residents
    RESIDENTS: '/admin/residents',
    RESIDENT_BY_ID: (residentId) => `/admin/residents/${residentId}`,
    RESIDENT_VISITOR_PASSCODE: (residentId) => `/admin/residents/${residentId}/visitor-passcode`,
    RESIDENT_VERIFY_PASSCODE: (residentId) => `/admin/residents/${residentId}/verify-passcode`,

    // External people (visitors / contractors / professionals) — General Directory.
    ORGANIZATION_EXTERNAL_PEOPLE: (organizationId) =>
        `/admin/organizations/${organizationId}/external-people`,
    EXTERNAL_PERSON_BY_ID: (externalPersonId) => `/admin/external-people/${externalPersonId}`,

    // Visitor Invitations
    ORGANIZATION_VISITOR_INVITATIONS: (organizationId) =>
        `/admin/organizations/${organizationId}/visitor-invitations`,
    VISITOR_INVITATION_RESEND: (invitationId) =>
        `/admin/visitor-invitations/${invitationId}/resend`,

    // Visit Sessions
    ORGANIZATION_VISIT_SESSIONS: (organizationId) =>
        `/admin/organizations/${organizationId}/visit-sessions`,
    VISIT_SESSION_APPROVE: (visitSessionId) =>
        `/admin/visit-sessions/${visitSessionId}/approve`,
    VISIT_SESSION_DENY: (visitSessionId) =>
        `/admin/visit-sessions/${visitSessionId}/deny`,

    // Visitor Account Invitations (App Accounts)
    ORGANIZATION_VISITOR_ACCOUNT_INVITATIONS: (organizationId) =>
        `/admin/organizations/${organizationId}/visitor-account-invitations`,
    VISITOR_ACCOUNT_INVITATION_RESEND: (organizationId, invitationId) =>
        `/admin/organizations/${organizationId}/visitor-account-invitations/${invitationId}/resend`,
    VISITOR_ACCOUNT_INVITATION_REVOKE: (organizationId, invitationId) =>
        `/admin/organizations/${organizationId}/visitor-account-invitations/${invitationId}/revoke`,

    // Evacuations & Fire Drills
    ORGANIZATION_EVACUATIONS: (organizationId) =>
        `/admin/organizations/${organizationId}/evacuations`,
    ORGANIZATION_EVACUATIONS_ON_SITE_SUMMARY: (organizationId) =>
        `/admin/organizations/${organizationId}/evacuations/on-site-summary`,
    ORGANIZATION_EVACUATIONS_ACTIVE: (organizationId) =>
        `/admin/organizations/${organizationId}/evacuations/active`,
    EVACUATION_BY_ID: (id) => `/admin/evacuations/${id}`,
    EVACUATION_CHECKS: (id) => `/admin/evacuations/${id}/checks`,
    EVACUATION_CLOSE: (id) => `/admin/evacuations/${id}/close`,

    // PEEP & Floor Plans
    ORGANIZATION_PEEP_FLOOR_SUMMARY: (organizationId) =>
        `/admin/organizations/${organizationId}/peep-floor-summary`,
    ORGANIZATION_PEEP_RECORDS: (organizationId) =>
        `/admin/organizations/${organizationId}/peep-records`,
    PEEP_RECORD_BY_ID: (peepRecordId) => `/admin/peep-records/${peepRecordId}`,
    ORGANIZATION_FLOOR_PLANS: (organizationId) =>
        `/admin/organizations/${organizationId}/floor-plans`,
    FLOOR_PLAN_BY_ID: (floorPlanId) => `/admin/floor-plans/${floorPlanId}`,
    FLOOR_PLAN_PINS: (floorPlanId) => `/admin/floor-plans/${floorPlanId}/pins`,
    FLOOR_PLAN_PIN_BY_ID: (floorPlanId, floorPlanPinId) =>
        `/admin/floor-plans/${floorPlanId}/pins/${floorPlanPinId}`,

    // Supervision & Appraisal
    ORGANIZATION_SUPERVISION: (organizationId) =>
        `/admin/organizations/${organizationId}/supervision`,
    ORGANIZATION_SUPERVISION_BY_ID: (organizationId, supervisionId) =>
        `/admin/organizations/${organizationId}/supervision/${supervisionId}`,
    ORGANIZATION_SUPERVISION_ACTION_POINTS_SIGN_OFF: (organizationId, supervisionId) =>
        `/admin/organizations/${organizationId}/supervision/${supervisionId}/action-points/sign-off`,
    APP_SUPERVISION: '/app/supervision',
    APP_SUPERVISION_BY_ID: (supervisionId) => `/app/supervision/${supervisionId}`,
    ORGANIZATION_APPRAISALS: (organizationId) =>
        `/admin/organizations/${organizationId}/appraisals`,
    ORGANIZATION_APPRAISAL_BY_ID: (organizationId, appraisalId) =>
        `/admin/organizations/${organizationId}/appraisals/${appraisalId}`,
    APP_APPRAISALS: '/app/appraisal',
    APP_APPRAISAL_BY_ID: (appraisalId) => `/app/appraisal/${appraisalId}`,
    APP_APPRAISAL_ACKNOWLEDGE: (appraisalId) => `/app/appraisal/${appraisalId}/acknowledge`,
    ORGANIZATION_APPRAISAL_ACTION_POINTS_SIGN_OFF: (organizationId, appraisalId) =>
        `/admin/organizations/${organizationId}/appraisals/${appraisalId}/action-points/sign-off`,
    ORGANIZATION_APPRAISAL_ACTION_POINT_SIGN_OFF: (organizationId, appraisalId, appraisalActionPointId) =>
        `/admin/organizations/${organizationId}/appraisals/${appraisalId}/action-points/${appraisalActionPointId}/sign-off`,
    ORGANIZATION_APPRAISAL_MANAGER_SIGN: (organizationId, appraisalId) =>
        `/admin/organizations/${organizationId}/appraisals/${appraisalId}/manager-sign`,

    // Family engagement — upload moderation queue
    ORGANIZATION_FAMILY_UPLOADS: (organizationId) =>
        `/admin/organizations/${organizationId}/family-uploads`,
    FAMILY_UPLOAD_BY_ID: (uploadId) => `/admin/family/uploads/${uploadId}`,
    FAMILY_UPLOADS: '/admin/family/uploads',
    FAMILY_UPLOAD_MEDIA: '/admin/family/uploads/media',
    FAMILY_UPLOAD_MEDIA_BATCH: '/admin/family/uploads/media/batch',

    FAMILY_RELATIONSHIPS: '/admin/family/relationships',
    ORGANIZATION_FAMILY_INVITATIONS: (organizationId) =>
        `/admin/organizations/${organizationId}/family-invitations`,
    ORGANIZATION_FAMILY_INVITATION_BY_ID: (organizationId, familyInvitationId) =>
        `/admin/organizations/${organizationId}/family-invitations/${familyInvitationId}`,
    FAMILY_INVITATIONS: '/admin/family-invitations',
    FAMILY_INVITATION_BY_ID: (familyInvitationId) => `/admin/family-invitations/${familyInvitationId}`,

    ORGANIZATION_FAMILY_GROUPS: (organizationId) =>
        `/admin/organizations/${organizationId}/family-groups`,
    ORGANIZATION_FAMILY_GROUP_BY_RESIDENT: (organizationId, residentId) =>
        `/admin/organizations/${organizationId}/family-groups/${residentId}`,

    ORGANIZATION_FAMILY_MEMBERS: (organizationId) =>
        `/admin/organizations/${organizationId}/family-members`,
    ORGANIZATION_FAMILY_MEMBER_BY_ID: (organizationId, memberId) =>
        `/admin/organizations/${organizationId}/family-members/${memberId}`,
    FAMILY_MEMBER_BY_ID: (memberId) => `/admin/family/members/${memberId}`,
    FAMILY_MEMBER_ACCESS: (memberId) => `/admin/family/members/${memberId}/access`,
    FAMILY_RESIDENT_MEMBER_BY_ID: (residentId, memberId) =>
        `/admin/family/residents/${residentId}/members/${memberId}`,

    ORGANIZATION_FAMILY_POSTS: (organizationId) =>
        `/admin/organizations/${organizationId}/family-posts`,
    ORGANIZATION_FAMILY_POST_AUTHORS: (organizationId) =>
        `/admin/organizations/${organizationId}/family-post-authors`,
    FAMILY_POSTS: '/admin/family/posts',
    FAMILY_POST_BY_ID: (postId) => `/admin/family/posts/${postId}`,
    FAMILY_POST_MEDIA: '/admin/family/posts/media',
    FAMILY_POST_MEDIA_BATCH: '/admin/family/posts/media/batch',
    FAMILY_POST_TAGGABLE_RESIDENTS: '/admin/family/posts/taggable-residents',

    ORGANIZATION_FAMILY_GAZETTES: (organizationId) =>
        `/admin/organizations/${organizationId}/family-gazettes`,
    ORGANIZATION_FAMILY_GAZETTE_BY_ID: (organizationId, gazetteItemId) =>
        `/admin/organizations/${organizationId}/family-gazettes/${gazetteItemId}`,
    ORGANIZATION_FAMILY_GAZETTE_PDF: (organizationId, gazetteItemId) =>
        `/admin/organizations/${organizationId}/family-gazettes/${gazetteItemId}/pdf`,
    ORGANIZATION_FAMILY_GAZETTES_DOWNLOAD: (organizationId) =>
        `/admin/organizations/${organizationId}/family-gazettes/download`,
    FAMILY_GAZETTE_BY_ID: (gazetteItemId) => `/admin/family/gazettes/${gazetteItemId}`,
    FAMILY_GAZETTE_ISSUES: '/admin/family/gazette-issues',

    FAMILY_NEWSLETTERS: '/admin/family/newsletters',
    FAMILY_NEWSLETTER_BY_ID: (newsletterId) => `/admin/family/newsletters/${newsletterId}`,
    FAMILY_NEWSLETTER_DELIVERY: (newsletterId) => `/admin/family/newsletters/${newsletterId}/delivery`,
    ORGANIZATION_FAMILY_NEWSLETTERS: (organizationId) =>
        `/admin/organizations/${organizationId}/family-newsletters`,
    ORGANIZATION_FAMILY_NEWSLETTER_BY_ID: (organizationId, newsletterId) =>
        `/admin/organizations/${organizationId}/family-newsletters/${newsletterId}`,
    ORGANIZATION_FAMILY_NEWSLETTER_PDF: (organizationId, newsletterId) =>
        `/admin/organizations/${organizationId}/family-newsletters/${newsletterId}/pdf`,

    ORGANIZATION_FAMILY_OVERVIEW: (organizationId) =>
        `/admin/organizations/${organizationId}/family-overview`,
    // Documents
    ORGANIZATION_DOCUMENTS: (organizationId) =>
        `/admin/organizations/${organizationId}/documents`,
    DOCUMENT_BY_ID: (documentId) =>
        `/admin/documents/${documentId}`,
    UPDATE_DOCUMENT: (documentId) =>
        `/admin/documents/${documentId}`,
    REPLACE_DOCUMENT_VERSION: (documentId) =>
        `/admin/documents/${documentId}/versions`,
    DELETE_DOCUMENT: (documentId) =>
        `/admin/documents/${documentId}`,

    // Document Categories
    ORGANIZATION_DOCUMENT_CATEGORIES: (organizationId) =>
        `/admin/organizations/${organizationId}/document-categories`,
    ORGANIZATION_DOCUMENT_CATEGORY_BY_ID: (organizationId, categoryId) =>
        `/admin/organizations/${organizationId}/document-categories/${categoryId}`,

    // Kiosks
    KIOSKS: '/admin/kiosks',
    KIOSK_BY_ID: (kioskId) => `/admin/kiosks/${kioskId}`,
    KIOSK_TOGGLE_LOCK: (kioskId) => `/admin/kiosks/${kioskId}/toggle-lock`,

    // Requirements & Competencies
    ORGANIZATION_REQUIREMENTS: (organizationId) =>
        `/admin/organizations/${organizationId}/requirements`,
    ORGANIZATION_REQUIREMENT_BY_ID: (organizationId, requirementId) =>
        `/admin/organizations/${organizationId}/requirements/${requirementId}`,

    // Assignments & Competency Matrix
    ORGANIZATION_ASSIGNMENTS: (organizationId) =>
        `/admin/organizations/${organizationId}/assignments`,
    ASSIGNMENT_BY_ID: (assignmentId) =>
        `/admin/assignments/${assignmentId}`,
    ASSIGNMENT_RECORDS: (assignmentId) =>
        `/admin/assignments/${assignmentId}/records`,
    ORGANIZATION_TRAINING_RECORDS: (organizationId) =>
        `/admin/organizations/${organizationId}/training-records`,
    COMPETENCY_MATRIX: (organizationId) =>
        `/admin/organizations/${organizationId}/competency-matrix`,

    SETTINGS_ALL: '/admin/settings/all',

    STATISTICS: '/admin/statistics',
    PLATFORM_DASHBOARD: '/admin/platform/dashboard',

    BILLING_USAGE: '/admin/billing/usage',
    BILLING_USAGE_BY_ORG: (organizationId) => `/admin/billing/usage/${organizationId}`,

    CHATS_CONTACTS: '/chats/contacts',
    CHATS_CONTACT_MESSAGES: (conversationId) => `/chats/contacts/${conversationId}`,
    CHATS_RECIPIENTS: '/chats/recipients',
    CHATS_MESSAGE: '/chats/message',
    CHATS_SENT: '/chats/sent',
    CHATS_SENT_BY_ID: (broadcastId) => `/chats/sent/${broadcastId}`,
    APP_TRAINING: '/app/training',
    APP_COMPETENCIES: '/app/competencies',

    // Kiosk Branding & Widgets
    ORGANIZATION_KIOSK_WIDGETS: (organizationId) =>
        `/admin/organizations/${organizationId}/kiosk-widgets`,
};