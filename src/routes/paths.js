import { paramCase } from 'src/utils/change-case';

import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  SITE_MANAGER: "/site-manager",
  LINE_MANAGER: "/line-manager",
  OWNER_DASHBOARD: "/owner-dashboard",
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin-dashboard',
  SUPER_ADMIN_DASHBOARD: '/super-admin-dashboard',
  STAFF: '/staff',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  // Public, unauthenticated page — opened by scanning the QR code the kiosk
  // shows at checkout. `token` identifies the visit.
  visitorSurvey: (token) => `/visitor-survey/${token}`,
  // Public, unauthenticated page — opened by scanning a "document" QR widget
  // on the kiosk home screen. `token` identifies the uploaded document.
  documentView: (token) => `/view-document/${token}`,
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  components: '/components',
  docs: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
  zoneStore: 'https://mui.com/store/items/zone-landing-page/',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  figma: 'https://www.figma.com/design/cAPz4pYPtQEXivqe11EcDE/%5BPreview%5D-Minimal-Web.v6.0.0',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id) => `/product/${id}`,
    demo: { details: `/product/${MOCK_ID}` },
  },
  post: {
    root: `/post`,
    details: (title) => `/post/${paramCase(title)}`,
    demo: { details: `/post/${paramCase(MOCK_TITLE)}` },
  },
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },

    admin: {
      signIn: `${ROOTS.AUTH}/admin/login`,
    },
    owner: {
      signIn: '/owner/login',
    },
    staff: {
      signIn: '/staff/login',
    },
    invite: (token) => `/invite/${token}`,
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
      resetPassword: `${ROOTS.AUTH}/jwt/reset-password`,
      verify: `${ROOTS.AUTH}/jwt/verify`,
      updatePassword: `${ROOTS.AUTH}/jwt/update-password`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  authDemo: {
    split: {
      signIn: `${ROOTS.AUTH_DEMO}/split/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/split/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/split/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/split/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/split/verify`,
    },
    centered: {
      signIn: `${ROOTS.AUTH_DEMO}/centered/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/centered/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/centered/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/centered/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/centered/verify`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    organizations: {
      root: `${ROOTS.DASHBOARD}/organizations`,
      detail: (id) => `${ROOTS.DASHBOARD}/organizations/${id}`,
    },
    staffProfiles: {
      root: `${ROOTS.DASHBOARD}/staff-profiles`,
      new: `${ROOTS.DASHBOARD}/staff-profiles/new`,
      detail: (id) => `${ROOTS.DASHBOARD}/staff-profiles/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/staff-profiles/${id}/edit`,
    },
    fireDrills: `${ROOTS.DASHBOARD}/fire-drills`,
    dataUsage: {
      root: `${ROOTS.DASHBOARD}/data-usage`,
      detail: (id) => `${ROOTS.DASHBOARD}/data-usage/${id}`,
    },
    billingAndUsage: {
      root: `${ROOTS.DASHBOARD}/data-usage`,
      detail: (id) => `${ROOTS.DASHBOARD}/data-usage/${id}`,
    },
    mail: `${ROOTS.DASHBOARD}/mail`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    fileManager: `${ROOTS.DASHBOARD}/file-manager`,
    permission: `${ROOTS.DASHBOARD}/permission`,
    sample: `${ROOTS.DASHBOARD}/sample`,
    wallets: `${ROOTS.DASHBOARD}/wallets`,
    transactions: `${ROOTS.DASHBOARD}/transactions`,
    income: `${ROOTS.DASHBOARD}/category/income`,
    expense: `${ROOTS.DASHBOARD}/category/expense`,
    // category: {
    //   app: `${ROOTS.DASHBOARD}/app`,
    //   income: `${ROOTS.DASHBOARD}/income`,
    //   expense: `${ROOTS.DASHBOARD}/expense`,
    // },

    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
      course: `${ROOTS.DASHBOARD}/course`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      pending: `${ROOTS.DASHBOARD}/user/pending-users`,
      cards: `${ROOTS.DASHBOARD}/user/cards`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      edit: (id) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit`,
      },
    },
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoice`,
      new: `${ROOTS.DASHBOARD}/invoice/new`,
      details: (id) => `${ROOTS.DASHBOARD}/invoice/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}/edit`,
      },
    },
    post: {
      root: `${ROOTS.DASHBOARD}/post`,
      new: `${ROOTS.DASHBOARD}/post/new`,
      details: (title) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}`,
      edit: (title) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}`,
        edit: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}/edit`,
      },
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      details: (id) => `${ROOTS.DASHBOARD}/order/${id}`,
      demo: {
        details: `${ROOTS.DASHBOARD}/order/${MOCK_ID}`,
      },
    },
    job: {
      root: `${ROOTS.DASHBOARD}/job`,
      new: `${ROOTS.DASHBOARD}/job/new`,
      details: (id) => `${ROOTS.DASHBOARD}/job/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    tour: {
      root: `${ROOTS.DASHBOARD}/tour`,
      new: `${ROOTS.DASHBOARD}/tour/new`,
      details: (id) => `${ROOTS.DASHBOARD}/tour/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}/edit`,
      },
    },
    familyEngagement: {
      root: `${ROOTS.DASHBOARD}/family-engagement`,
      overview: `${ROOTS.DASHBOARD}/family-engagement/overview`,
      moderation: `${ROOTS.DASHBOARD}/family-engagement/moderation`,
      communityWall: `${ROOTS.DASHBOARD}/family-engagement/community-wall`,
      newsletters: `${ROOTS.DASHBOARD}/family-engagement/newsletters`,
      gazettes: `${ROOTS.DASHBOARD}/family-engagement/gazettes`,
      familyGroups: `${ROOTS.DASHBOARD}/family-engagement/family-groups`,
      memberships: {
        root: `${ROOTS.DASHBOARD}/family-engagement/memberships`,
        invitations: {
          root: `${ROOTS.DASHBOARD}/family-engagement/memberships/invitations`,
          new: `${ROOTS.DASHBOARD}/family-engagement/memberships/invitations/new`,
          detail: (id) => `${ROOTS.DASHBOARD}/family-engagement/memberships/invitations/${id}`,
          edit: (id) => `${ROOTS.DASHBOARD}/family-engagement/memberships/invitations/${id}/edit`,
        },
        members: {
          root: `${ROOTS.DASHBOARD}/family-engagement/memberships/members`,
          detail: (id) => `${ROOTS.DASHBOARD}/family-engagement/memberships/members/${id}`,
          edit: (id) => `${ROOTS.DASHBOARD}/family-engagement/memberships/members/${id}/edit`,
        },
      },
    },
  },
  // SITE MANAGER  DASHBOARD
  siteManager: {
    root: `${ROOTS.SITE_MANAGER}`,
    statistics: `${ROOTS.SITE_MANAGER}/statistics`,
    directory: {
      root: `${ROOTS.SITE_MANAGER}/directory`,
      visitorInvitation: `${ROOTS.SITE_MANAGER}/directory/visitor-invitation`,
      visitSessions: `${ROOTS.SITE_MANAGER}/directory/visit-sessions`,
      appAccounts: `${ROOTS.SITE_MANAGER}/directory/app-accounts`,
      detail: (id) => `${ROOTS.SITE_MANAGER}/directory/${id}`,
    },
    residents: {
      root: `${ROOTS.SITE_MANAGER}/residents`,
      detail: (id) => `${ROOTS.SITE_MANAGER}/residents/${id}`,
    },
    reports: `${ROOTS.SITE_MANAGER}/reports`,
    rota: `${ROOTS.SITE_MANAGER}/rota`,
    supervision: `${ROOTS.SITE_MANAGER}/supervision`,
    supervisionDetail: (id) => `${ROOTS.SITE_MANAGER}/supervision/${id}`,
    supervisionSignOff: (id) => `${ROOTS.SITE_MANAGER}/supervision/${id}/sign-off`,
    appraisal: `${ROOTS.SITE_MANAGER}/appraisals`,
    appraisalDetail: (id) => `${ROOTS.SITE_MANAGER}/appraisals/${id}`,
    appraisalSignOff: (id) => `${ROOTS.SITE_MANAGER}/appraisals/${id}/sign-off`,
    teamCompliance: `${ROOTS.SITE_MANAGER}/team-compliance`,
    teamComplianceDetail: (id) => `${ROOTS.SITE_MANAGER}/team-compliance/${id}`,
    training: `${ROOTS.SITE_MANAGER}/training`,
    requirements: `${ROOTS.SITE_MANAGER}/requirements`,
    invitaions: {
      root: `${ROOTS.SITE_MANAGER}/invitaions`,
      new: `${ROOTS.SITE_MANAGER}/invitaions/new`,
    },
    account: `${ROOTS.SITE_MANAGER}/account`,
    profile: `${ROOTS.SITE_MANAGER}/account`,
    kiosk: `${ROOTS.SITE_MANAGER}/kiosk`,
    kioskDetail: (id) => `${ROOTS.SITE_MANAGER}/kiosk/${id}`,
    feedback: `${ROOTS.SITE_MANAGER}/feedback`,
    fireDrills: `${ROOTS.SITE_MANAGER}/fire-drills`,
    PEEPandFloorPlan: `${ROOTS.SITE_MANAGER}/peep-and-Floor-plan`,
    peepAndFloorPlans: {
      // Main listing page (Org Rollup / All sites) — same flow as owner dashboard
      root: `${ROOTS.SITE_MANAGER}/peep-and-Floor-plan`,
      site: (siteId) => `${ROOTS.SITE_MANAGER}/peep-and-Floor-plan/site/${siteId}`,
      map: (siteId) => `${ROOTS.SITE_MANAGER}/peep-and-Floor-plan/site/${siteId}/map`,
      addPin: (siteId) => `${ROOTS.SITE_MANAGER}/peep-and-Floor-plan/site/${siteId}/map/add-pin`,
      records: {
        root: `${ROOTS.SITE_MANAGER}/peep-and-Floor-plan/peep-records`,
        bySite: (siteId) => `${ROOTS.SITE_MANAGER}/peep-and-Floor-plan/site/${siteId}/peep-records`,
        new: `${ROOTS.SITE_MANAGER}/peep-and-Floor-plan/peep-records/new`,
        detail: (id) => `${ROOTS.SITE_MANAGER}/peep-and-Floor-plan/peep-records/${id}`,
        edit: (id) => `${ROOTS.SITE_MANAGER}/peep-and-Floor-plan/peep-records/${id}/edit`,
      },
      floorPlans: {
        root: `${ROOTS.SITE_MANAGER}/peep-and-Floor-plan/floor-plans`,
        bySite: (siteId) => `${ROOTS.SITE_MANAGER}/peep-and-Floor-plan/site/${siteId}/floor-plans`,
      },
    },
    documents: {
      root: `${ROOTS.SITE_MANAGER}/documents`,
      categories: `${ROOTS.SITE_MANAGER}/documents/categories`,
      detail: (id) => `${ROOTS.SITE_MANAGER}/documents/${id}`,
      acknowledgements: (id) => `${ROOTS.SITE_MANAGER}/documents/${id}/acknowledgements`,
    },
    configuration: `${ROOTS.SITE_MANAGER}/configuration`,
    pendingApproval: `${ROOTS.SITE_MANAGER}/approvals`,
    roles: `${ROOTS.SITE_MANAGER}/roles`,
    familyEngagement: {
      root: `${ROOTS.SITE_MANAGER}/family-engagement`,
      overview: `${ROOTS.SITE_MANAGER}/family-engagement/overview`,
      moderation: `${ROOTS.SITE_MANAGER}/family-engagement/moderation`,
      communityWall: `${ROOTS.SITE_MANAGER}/family-engagement/community-wall`,
      newsletters: `${ROOTS.SITE_MANAGER}/family-engagement/newsletters`,
      gazettes: `${ROOTS.SITE_MANAGER}/family-engagement/gazettes`,
      familyGroups: `${ROOTS.SITE_MANAGER}/family-engagement/family-groups`,
      memberships: {
        root: `${ROOTS.SITE_MANAGER}/family-engagement/memberships`,
        invitations: {
          root: `${ROOTS.SITE_MANAGER}/family-engagement/memberships/invitations`,
          new: `${ROOTS.SITE_MANAGER}/family-engagement/memberships/invitations/new`,
          detail: (id) => `${ROOTS.SITE_MANAGER}/family-engagement/memberships/invitations/${id}`,
          edit: (id) => `${ROOTS.SITE_MANAGER}/family-engagement/memberships/invitations/${id}/edit`,
        },
        members: {
          root: `${ROOTS.SITE_MANAGER}/family-engagement/memberships/members`,
          detail: (id) => `${ROOTS.SITE_MANAGER}/family-engagement/memberships/members/${id}`,
          edit: (id) => `${ROOTS.SITE_MANAGER}/family-engagement/memberships/members/${id}/edit`,
        },
      },
    },

    mail: `${ROOTS.ADMIN_DASHBOARD}/mail`,
    chat: `${ROOTS.ADMIN_DASHBOARD}/chat`,
    messages: `${ROOTS.SITE_MANAGER}/messages`,
    blank: `${ROOTS.ADMIN_DASHBOARD}/blank`,
    kanban: `${ROOTS.ADMIN_DASHBOARD}/kanban`,
    calendar: `${ROOTS.ADMIN_DASHBOARD}/calendar`,
    fileManager: `${ROOTS.ADMIN_DASHBOARD}/file-manager`,
    permission: `${ROOTS.ADMIN_DASHBOARD}/permission`,
    general: {
      app: `${ROOTS.ADMIN_DASHBOARD}/app`,
      ecommerce: `${ROOTS.ADMIN_DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.ADMIN_DASHBOARD}/analytics`,
      banking: `${ROOTS.ADMIN_DASHBOARD}/banking`,
      booking: `${ROOTS.ADMIN_DASHBOARD}/booking`,
      file: `${ROOTS.ADMIN_DASHBOARD}/file`,
      course: `${ROOTS.ADMIN_DASHBOARD}/course`,
    },
    user: {
      root: `${ROOTS.ADMIN_DASHBOARD}/user`,
      new: `${ROOTS.ADMIN_DASHBOARD}/user/new`,
      list: `${ROOTS.ADMIN_DASHBOARD}/user/list`,
      cards: `${ROOTS.ADMIN_DASHBOARD}/user/cards`,
      profile: `${ROOTS.ADMIN_DASHBOARD}/user/profile`,
      account: `${ROOTS.ADMIN_DASHBOARD}/user/account`,
      edit: (id) => `${ROOTS.ADMIN_DASHBOARD}/user/${id}/edit`,
      demo: {
        edit: `${ROOTS.ADMIN_DASHBOARD}/user/${MOCK_ID}/edit`,
      },
    },
    product: {
      root: `${ROOTS.ADMIN_DASHBOARD}/product`,
      new: `${ROOTS.ADMIN_DASHBOARD}/product/new`,
      details: (id) => `${ROOTS.ADMIN_DASHBOARD}/product/${id}`,
      edit: (id) => `${ROOTS.ADMIN_DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.ADMIN_DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.ADMIN_DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    invoice: {
      root: `${ROOTS.ADMIN_DASHBOARD}/invoice`,
      new: `${ROOTS.ADMIN_DASHBOARD}/invoice/new`,
      details: (id) => `${ROOTS.ADMIN_DASHBOARD}/invoice/${id}`,
      edit: (id) => `${ROOTS.ADMIN_DASHBOARD}/invoice/${id}/edit`,
      demo: {
        details: `${ROOTS.ADMIN_DASHBOARD}/invoice/${MOCK_ID}`,
        edit: `${ROOTS.ADMIN_DASHBOARD}/invoice/${MOCK_ID}/edit`,
      },
    },
    post: {
      root: `${ROOTS.ADMIN_DASHBOARD}/post`,
      new: `${ROOTS.ADMIN_DASHBOARD}/post/new`,
      details: (title) => `${ROOTS.ADMIN_DASHBOARD}/post/${paramCase(title)}`,
      edit: (title) => `${ROOTS.ADMIN_DASHBOARD}/post/${paramCase(title)}/edit`,
      demo: {
        details: `${ROOTS.ADMIN_DASHBOARD}/post/${paramCase(MOCK_TITLE)}`,
        edit: `${ROOTS.ADMIN_DASHBOARD}/post/${paramCase(MOCK_TITLE)}/edit`,
      },
    },
    order: {
      root: `${ROOTS.ADMIN_DASHBOARD}/order`,
      details: (id) => `${ROOTS.ADMIN_DASHBOARD}/order/${id}`,
      demo: {
        details: `${ROOTS.ADMIN_DASHBOARD}/order/${MOCK_ID}`,
      },
    },
    job: {
      root: `${ROOTS.ADMIN_DASHBOARD}/job`,
      new: `${ROOTS.ADMIN_DASHBOARD}/job/new`,
      details: (id) => `${ROOTS.ADMIN_DASHBOARD}/job/${id}`,
      edit: (id) => `${ROOTS.ADMIN_DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.ADMIN_DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.ADMIN_DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    tour: {
      root: `${ROOTS.ADMIN_DASHBOARD}/tour`,
      new: `${ROOTS.ADMIN_DASHBOARD}/tour/new`,
      details: (id) => `${ROOTS.ADMIN_DASHBOARD}/tour/${id}`,
      edit: (id) => `${ROOTS.ADMIN_DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.ADMIN_DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.ADMIN_DASHBOARD}/tour/${MOCK_ID}/edit`,
      },
    },
  },
  lineManager: {
    root: `${ROOTS.LINE_MANAGER}`,
    teamRota: `${ROOTS.LINE_MANAGER}/team-rota`,
    leaveApproval: {
      root: `${ROOTS.LINE_MANAGER}/leave-approval`,
      detail: (id) => `${ROOTS.LINE_MANAGER}/leave-approval/${id}`,
    },
    teamAttendance: `${ROOTS.LINE_MANAGER}/team-attendance`,
    teamCompliance: `${ROOTS.LINE_MANAGER}/team-compliance`,
    teamComplianceDetail: (id) => `${ROOTS.LINE_MANAGER}/team-compliance/${id}`,
    supervision: `${ROOTS.LINE_MANAGER}/supervision`,
    supervisionDetail: (id) => `${ROOTS.LINE_MANAGER}/supervision/${id}`,
    supervisionSignOff: (id) => `${ROOTS.LINE_MANAGER}/supervision/${id}/sign-off`,
    appraisal: `${ROOTS.LINE_MANAGER}/appraisals`,
    appraisalDetail: (id) => `${ROOTS.LINE_MANAGER}/appraisals/${id}`,
    appraisalSignOff: (id) => `${ROOTS.LINE_MANAGER}/appraisals/${id}/sign-off`,
    training: `${ROOTS.LINE_MANAGER}/training`,
    requirements: `${ROOTS.LINE_MANAGER}/requirements`,
    photoApproval: `${ROOTS.LINE_MANAGER}/photo-approval`,
    feedback: `${ROOTS.LINE_MANAGER}/feedback`,
    messages: `${ROOTS.LINE_MANAGER}/messages`,
    fireDrills: `${ROOTS.LINE_MANAGER}/fire-drills`,
    residents: `${ROOTS.LINE_MANAGER}/residents`,
    residentsDetail: (id) => `${ROOTS.LINE_MANAGER}/residents/${id}`,
    documents: {
      root: `${ROOTS.LINE_MANAGER}/documents`,
      categories: `${ROOTS.LINE_MANAGER}/documents/categories`,
      detail: (id) => `${ROOTS.LINE_MANAGER}/documents/${id}`,
      acknowledgements: (id) => `${ROOTS.LINE_MANAGER}/documents/${id}/acknowledgements`,
    },
    tempyConnection: `${ROOTS.LINE_MANAGER}/tempy-connection`,
    familyEngagement: {
      root: `${ROOTS.LINE_MANAGER}/family-engagement`,
      overview: `${ROOTS.LINE_MANAGER}/family-engagement/overview`,
      moderation: `${ROOTS.LINE_MANAGER}/family-engagement/moderation`,
      communityWall: `${ROOTS.LINE_MANAGER}/family-engagement/community-wall`,
      newsletters: `${ROOTS.LINE_MANAGER}/family-engagement/newsletters`,
      gazettes: `${ROOTS.LINE_MANAGER}/family-engagement/gazettes`,
      familyGroups: `${ROOTS.LINE_MANAGER}/family-engagement/family-groups`,
      memberships: {
        root: `${ROOTS.LINE_MANAGER}/family-engagement/memberships`,
        invitations: {
          root: `${ROOTS.LINE_MANAGER}/family-engagement/memberships/invitations`,
          new: `${ROOTS.LINE_MANAGER}/family-engagement/memberships/invitations/new`,
          detail: (id) => `${ROOTS.LINE_MANAGER}/family-engagement/memberships/invitations/${id}`,
          edit: (id) => `${ROOTS.LINE_MANAGER}/family-engagement/memberships/invitations/${id}/edit`,
        },
        members: {
          root: `${ROOTS.LINE_MANAGER}/family-engagement/memberships/members`,
          detail: (id) => `${ROOTS.LINE_MANAGER}/family-engagement/memberships/members/${id}`,
          edit: (id) => `${ROOTS.LINE_MANAGER}/family-engagement/memberships/members/${id}/edit`,
        },
      },
    },
    account: `${ROOTS.LINE_MANAGER}/account`,
    profile: `${ROOTS.LINE_MANAGER}/account`,
  },
  // ADMIN (SUPER ADMIN) DASHBOARD
  adminDashboard: {
    root: `${ROOTS.ADMIN_DASHBOARD}`,
    fireDrills: `${ROOTS.ADMIN_DASHBOARD}/fire-drills`,
    dataUsage: {
      root: `${ROOTS.ADMIN_DASHBOARD}/data-usage`,
      detail: (id) => `${ROOTS.ADMIN_DASHBOARD}/data-usage/${id}`,
    },
    documents: {
      root: `${ROOTS.ADMIN_DASHBOARD}/documents`,
      detail: (id) => `${ROOTS.ADMIN_DASHBOARD}/documents/${id}`,
    },
  },
  // ORGANIZATION OWNER DASHBOARD
  owner: {
    familyEngagement: {
      root: `${ROOTS.OWNER_DASHBOARD}/family-engagement`,
      overview: `${ROOTS.OWNER_DASHBOARD}/family-engagement/overview`,
      moderation: `${ROOTS.OWNER_DASHBOARD}/family-engagement/moderation`,
      communityWall: `${ROOTS.OWNER_DASHBOARD}/family-engagement/community-wall`,
      newsletters: `${ROOTS.OWNER_DASHBOARD}/family-engagement/newsletters`,
      gazettes: `${ROOTS.OWNER_DASHBOARD}/family-engagement/gazettes`,
      familyGroups: `${ROOTS.OWNER_DASHBOARD}/family-engagement/family-groups`,
      memberships: {
        root: `${ROOTS.OWNER_DASHBOARD}/family-engagement/memberships`,
        invitations: {
          root: `${ROOTS.OWNER_DASHBOARD}/family-engagement/memberships/invitations`,
          new: `${ROOTS.OWNER_DASHBOARD}/family-engagement/memberships/invitations/new`,
          detail: (id) => `${ROOTS.OWNER_DASHBOARD}/family-engagement/memberships/invitations/${id}`,
          edit: (id) => `${ROOTS.OWNER_DASHBOARD}/family-engagement/memberships/invitations/${id}/edit`,
        },
        members: {
          root: `${ROOTS.OWNER_DASHBOARD}/family-engagement/memberships/members`,
          detail: (id) => `${ROOTS.OWNER_DASHBOARD}/family-engagement/memberships/members/${id}`,
          edit: (id) => `${ROOTS.OWNER_DASHBOARD}/family-engagement/memberships/members/${id}/edit`,
        },
      },
    },
    root: `${ROOTS.OWNER_DASHBOARD}`,
    departments: {
      root: `${ROOTS.OWNER_DASHBOARD}/departments`,
      detail: (id) => `${ROOTS.OWNER_DASHBOARD}/departments/${id}`,
    },
    jobTitles: {
      root: `${ROOTS.OWNER_DASHBOARD}/job-titles`,
      detail: (id) => `${ROOTS.OWNER_DASHBOARD}/job-titles/${id}`,
    },
    // Renamed Branch -> Site in the UI. API endpoints are unchanged (still
    // /admin/.../branches); this is the frontend route + label only.
    sites: {
      root: `${ROOTS.OWNER_DASHBOARD}/sites`,
      new: `${ROOTS.OWNER_DASHBOARD}/sites/new`,
      detail: (id) => `${ROOTS.OWNER_DASHBOARD}/sites/${id}`,
      edit: (id) => `${ROOTS.OWNER_DASHBOARD}/sites/${id}/edit`,
    },
    staffProfiles: {
      root: `${ROOTS.OWNER_DASHBOARD}/staff-profiles`,
      new: `${ROOTS.OWNER_DASHBOARD}/staff-profiles/new`,
      detail: (id) => `${ROOTS.OWNER_DASHBOARD}/staff-profiles/${id}`,
      edit: (id) => `${ROOTS.OWNER_DASHBOARD}/staff-profiles/${id}/edit`,
    },
    dataUsage: {
      root: `${ROOTS.OWNER_DASHBOARD}/billing-and-usage`,
      detail: (id) => `${ROOTS.OWNER_DASHBOARD}/billing-and-usage/${id}`,
    },
    billingAndUsage: {
      root: `${ROOTS.OWNER_DASHBOARD}/billing-and-usage`,
      detail: (id) => `${ROOTS.OWNER_DASHBOARD}/billing-and-usage/${id}`,
    },
    directory: {
      root: `${ROOTS.OWNER_DASHBOARD}/directory`,
      visitorInvitation: `${ROOTS.OWNER_DASHBOARD}/directory/visitor-invitation`,
      visitSessions: `${ROOTS.OWNER_DASHBOARD}/directory/visit-sessions`,
      appAccounts: `${ROOTS.OWNER_DASHBOARD}/directory/app-accounts`,
      detail: (id) => `${ROOTS.OWNER_DASHBOARD}/directory/${id}`,
    },
    residents: {
      root: `${ROOTS.OWNER_DASHBOARD}/residents`,
      detail: (id) => `${ROOTS.OWNER_DASHBOARD}/residents/${id}`,
    },
    rotaManagement: {
      root: `${ROOTS.OWNER_DASHBOARD}/rota-management`
    },
    kiosk: `${ROOTS.OWNER_DASHBOARD}/kiosk`,
    kioskDetail: (id) => `${ROOTS.OWNER_DASHBOARD}/kiosk/${id}`,
    PEEPandFloorPlan: `${ROOTS.OWNER_DASHBOARD}/peep-and-floor-plan`,
    peepAndFloorPlans: {
      // Main listing page (Org Rollup / All sites)
      root: `${ROOTS.OWNER_DASHBOARD}/peep-and-floor-plan`,
      site: (siteId) => `${ROOTS.OWNER_DASHBOARD}/peep-and-floor-plan/site/${siteId}`,
      map: (siteId) => `${ROOTS.OWNER_DASHBOARD}/peep-and-floor-plan/site/${siteId}/map`,
      addPin: (siteId) => `${ROOTS.OWNER_DASHBOARD}/peep-and-floor-plan/site/${siteId}/map/add-pin`,
      records: {
        root: `${ROOTS.OWNER_DASHBOARD}/peep-and-floor-plan/peep-records`,
        bySite: (siteId) => `${ROOTS.OWNER_DASHBOARD}/peep-and-floor-plan/site/${siteId}/peep-records`,
        new: `${ROOTS.OWNER_DASHBOARD}/peep-and-floor-plan/peep-records/new`,
        detail: (id) => `${ROOTS.OWNER_DASHBOARD}/peep-and-floor-plan/peep-records/${id}`,
        edit: (id) => `${ROOTS.OWNER_DASHBOARD}/peep-and-floor-plan/peep-records/${id}/edit`,
      },
      floorPlans: {
        root: `${ROOTS.OWNER_DASHBOARD}/peep-and-floor-plan/floor-plans`,
        bySite: (siteId) => `${ROOTS.OWNER_DASHBOARD}/peep-and-floor-plan/site/${siteId}/floor-plans`,
      },
      orgRollup: {
        root: `${ROOTS.OWNER_DASHBOARD}/peep-and-floor-plan`,
      },
    },
    documents: {
      root: `${ROOTS.OWNER_DASHBOARD}/documents`,
      categories: `${ROOTS.OWNER_DASHBOARD}/documents/categories`,
      detail: (id) => `${ROOTS.OWNER_DASHBOARD}/documents/${id}`,
      acknowledgements: (id) => `${ROOTS.OWNER_DASHBOARD}/documents/${id}/acknowledgements`,
    },
    supervision: `${ROOTS.OWNER_DASHBOARD}/supervision`,
    supervisionDetail: (id) => `${ROOTS.OWNER_DASHBOARD}/supervision/${id}`,
    supervisionSignOff: (id) => `${ROOTS.OWNER_DASHBOARD}/supervision/${id}/sign-off`,
    appraisal: `${ROOTS.OWNER_DASHBOARD}/appraisals`,
    appraisalDetail: (id) => `${ROOTS.OWNER_DASHBOARD}/appraisals/${id}`,
    appraisalSignOff: (id) => `${ROOTS.OWNER_DASHBOARD}/appraisals/${id}/sign-off`,
    teamCompliance: `${ROOTS.OWNER_DASHBOARD}/team-compliance`,
    teamComplianceDetail: (id) => `${ROOTS.OWNER_DASHBOARD}/team-compliance/${id}`,
    training: `${ROOTS.OWNER_DASHBOARD}/training`,
    requirements: `${ROOTS.OWNER_DASHBOARD}/requirements`,
    reports: `${ROOTS.OWNER_DASHBOARD}/reports`,
    messages: `${ROOTS.OWNER_DASHBOARD}/messages`,
    acknowledgements: (id) => `${ROOTS.OWNER_DASHBOARD}/documents/${id}/acknowledgements`,
    statistics: `${ROOTS.OWNER_DASHBOARD}/statistics`,
    tempyConnection: `${ROOTS.OWNER_DASHBOARD}/tempy-connection`,
    staffDashboardSettings: `${ROOTS.OWNER_DASHBOARD}/staff-dashboard-settings`,
    configuration: `${ROOTS.OWNER_DASHBOARD}/configuration`,
    settings: `${ROOTS.OWNER_DASHBOARD}/settings`,
    fireDrills: `${ROOTS.OWNER_DASHBOARD}/fire-drills`,

    rota: {
      root: `${ROOTS.OWNER_DASHBOARD}/rota`,
    },
    shifts: {
      root: `${ROOTS.OWNER_DASHBOARD}/shifts`,
      new: `${ROOTS.OWNER_DASHBOARD}/shifts/new`,
      detail: (id) => `${ROOTS.OWNER_DASHBOARD}/shifts/${id}`,
      edit: (id) => `${ROOTS.OWNER_DASHBOARD}/shifts/${id}/edit`,
    },
    shiftClaims: {
      root: `${ROOTS.OWNER_DASHBOARD}/shift-claims`,
      detail: (id) => `${ROOTS.OWNER_DASHBOARD}/shift-claims/${id}`,
    },
    leaveRequests: {
      root: `${ROOTS.OWNER_DASHBOARD}/leave-requests`,
      detail: (id) => `${ROOTS.OWNER_DASHBOARD}/leave-requests/${id}`,
    },
    attendance: {
      root: `${ROOTS.OWNER_DASHBOARD}/attendance`,
    },
    memberships: {
      root: `${ROOTS.OWNER_DASHBOARD}/memberships`,
      invitations: {
        root: `${ROOTS.OWNER_DASHBOARD}/memberships/invitations`,
        new: `${ROOTS.OWNER_DASHBOARD}/memberships/invitations/new`,
        detail: (id) => `${ROOTS.OWNER_DASHBOARD}/memberships/invitations/${id}`,
        edit: (id) => `${ROOTS.OWNER_DASHBOARD}/memberships/invitations/${id}/edit`,
      },
      members: {
        root: `${ROOTS.OWNER_DASHBOARD}/memberships/members`,
        detail: (id) => `${ROOTS.OWNER_DASHBOARD}/memberships/members/${id}`,
        edit: (id) => `${ROOTS.OWNER_DASHBOARD}/memberships/members/${id}/edit`,
      },
    },
    account: `${ROOTS.OWNER_DASHBOARD}/account`,
    profile: `${ROOTS.OWNER_DASHBOARD}/account`,
  },
  staff: {
    root: ROOTS.STAFF,
    dashboard: `${ROOTS.STAFF}/dashboard`,
    account: `${ROOTS.STAFF}/account`,
    profile: `${ROOTS.STAFF}/account`,
    familyEngagement: {
      root: `${ROOTS.STAFF}/family-engagement`,
      myResidents: `${ROOTS.STAFF}/family-engagement/my-residents`,
      myResidentDetail: (id) => `${ROOTS.STAFF}/family-engagement/my-residents/${id}`,
      photoUploads: `${ROOTS.STAFF}/family-engagement/photo-uploads`,
      communityWall: `${ROOTS.STAFF}/family-engagement/community-wall`,
      gazettes: `${ROOTS.STAFF}/family-engagement/gazettes`,
    },
    rota: `${ROOTS.STAFF}/rota`,
    attendance: `${ROOTS.STAFF}/attendance`,
    shifts: `${ROOTS.STAFF}/shifts`,
    competencies: `${ROOTS.STAFF}/competencies`,
    supervision: `${ROOTS.STAFF}/supervision`,
    supervisionDetail: (id) => `${ROOTS.STAFF}/supervision/${id}`,
    appraisal: `${ROOTS.STAFF}/appraisals`,
    appraisalDetail: (id) => `${ROOTS.STAFF}/appraisals/${id}`,
    training: `${ROOTS.STAFF}/training`,
    leaveRequests: `${ROOTS.STAFF}/leave-requests`,
    documents: {
      root: `${ROOTS.STAFF}/documents`,
      detail: (id) => `${ROOTS.STAFF}/documents/${id}`,
    },
  },
};