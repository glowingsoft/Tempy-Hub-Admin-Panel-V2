// Mock organizations response (shape mirrors GET /organizations API).
// Replace with the real RTK Query slice when the endpoint is wired up.
export const mockOrganizationsResponse = {
  message: 'Data fetched successfully',
  data: [
    {
      _id: '6a9579204f38edb8df1640b6',
      name: 'Willow Care Group',
      ownerUserId: '6a9579584f38edb8df1640c2',
      status: 'active',
      moduleAccess: [
        {
          moduleSlug: 'leave',
          enabled: true,
          purchasedAt: '2026-08-31T12:50:11.487Z',
          expiresAt: '2026-09-30T12:50:11.487Z',
        },
      ],
      settings: { emergencyNotifyOffsite: false },
      // createdAt: '2026-08-31T12:52:48.257Z',
      updatedAt: '2026-08-31T12:57:59.426Z',
      nameKey: 'willow care group',
      __v: 0,
    },
    {
      _id: '6a9576de4f38edb8df164091',
      name: 'Demo Care Group',
      ownerUserId: '6a9576de4f38edb8df16408d',
      status: 'active',
      moduleAccess: [
        { moduleSlug: 'signInAttendance', enabled: true, purchasedAt: '2026-08-31T12:43:10.784Z', expiresAt: null },
        { moduleSlug: 'rotaScheduling', enabled: true, purchasedAt: '2026-08-31T12:43:10.784Z', expiresAt: null },
        { moduleSlug: 'fireDrillEvacuation', enabled: true, purchasedAt: '2026-08-31T12:43:10.784Z', expiresAt: null },
        { moduleSlug: 'peepFloorPlan', enabled: true, purchasedAt: '2026-08-31T12:43:10.784Z', expiresAt: null },
        { moduleSlug: 'documentsEsign', enabled: true, purchasedAt: '2026-08-31T12:43:10.784Z', expiresAt: null },
        { moduleSlug: 'leave', enabled: true, purchasedAt: '2026-08-31T12:43:10.784Z', expiresAt: null },
        { moduleSlug: 'shiftBidding', enabled: true, purchasedAt: '2026-08-31T12:43:10.784Z', expiresAt: null },
        { moduleSlug: 'competencySupervisionAppraisal', enabled: true, purchasedAt: '2026-08-31T12:43:10.784Z', expiresAt: null },
        { moduleSlug: 'onboardingDbs', enabled: true, purchasedAt: '2026-08-31T12:43:10.784Z', expiresAt: null },
        { moduleSlug: 'payrollForecasting', enabled: true, purchasedAt: '2026-08-31T12:43:10.784Z', expiresAt: null },
        { moduleSlug: 'visitorComms', enabled: true, purchasedAt: '2026-08-31T12:43:10.784Z', expiresAt: null },
        { moduleSlug: 'agencyShiftBids', enabled: true, purchasedAt: '2026-08-31T12:43:10.784Z', expiresAt: null },
      ],
      settings: { emergencyNotifyOffsite: false },
      createdAt: '2026-08-31T12:43:10.801Z',
      updatedAt: '2026-08-31T12:43:10.801Z',
      nameKey: 'demo care group',
      __v: 0,
    },
  ],
  meta: { currentPage: 1, totalPages: 1, totalRecords: 2, limit: 10 },
};

export const mockOrganizations = mockOrganizationsResponse.data;

// ----------------------------------------------------------------------
// "Organizational Overview" radar — compares each organization's footprint
// across the core entities of the platform hierarchy:
//   Organization -> Sites -> (Site Managers / Line Managers) -> Staff / Residents
// plus the number of purchased modules. Values are a relative index (0–100)
// so the radar shape reflects scale, not absolute head-count.
export const ORGANIZATION_METRICS = [
  'Sites',
  'Site Managers',
  'Line Managers',
  'Staff',
  'Residents',
  'Modules',
];

export const mockOrganizationFootprint = [
  { name: 'Willow Care Group', data: [15, 15, 20, 25, 20, 8] },
  { name: 'Demo Care Group', data: [90, 85, 80, 95, 88, 100] },
];
