/**
 * Mock data shaped like the fireDrillEvacuation admin APIs.
 * Swap these helpers for RTK Query / axios later — see api-endpoints.js.
 */

import { mockBranches } from 'src/sections/branch/mocks/data';

export const EVACUATION_TYPE_OPTIONS = [
  { value: 'mock', label: 'Mock drill', color: 'info' },
  { value: 'real', label: 'Real emergency', color: 'error' },
];

export const EVACUATION_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active', color: 'error' },
  { value: 'closed', label: 'Closed', color: 'default' },
];

export const EVAC_CHECK_STATUS = {
  safe: { label: 'Safe', color: 'success' },
  missing: { label: 'Missing', color: 'error' },
  unknown: { label: 'Not yet', color: 'warning' },
};

export const getEvacuationTypeMeta = (type) =>
  EVACUATION_TYPE_OPTIONS.find((o) => o.value === type) || {
    value: type,
    label: type || '—',
    color: 'default',
  };

const [WILLOW_HOUSE, ROSEWOOD_COURT] = mockBranches;

const hoursAgo = (hours) => {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
};

const minutesAgo = (mins) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - mins);
  return d.toISOString();
};

/** GET .../evacuations/on-site-summary?branchId= */
export const mockOnSiteSummary = {
  branchId: WILLOW_HOUSE._id,
  branchName: WILLOW_HOUSE.name,
  assemblyPoint: 'Rear garden gate',
  counts: {
    staff: 12,
    residents: 28,
    visitors: 3,
    contractors: 1,
    total: 44,
  },
};

/** GET .../evacuations/active?branchId= — null when none */
export let mockActiveEvacuation = {
  _id: 'evac-active-1',
  branchId: WILLOW_HOUSE._id,
  branchName: WILLOW_HOUSE.name,
  type: 'mock',
  status: 'active',
  startedAt: minutesAgo(8),
  closedAt: null,
  startedByName: 'Priya Shah',
  assemblyPoint: 'Rear garden gate',
  stats: {
    total: 44,
    safe: 31,
    missing: 2,
    unknown: 11,
    byKind: {
      staff: { total: 12, safe: 10, missing: 0, unknown: 2 },
      resident: { total: 28, safe: 18, missing: 2, unknown: 8 },
      visitor: { total: 3, safe: 2, missing: 0, unknown: 1 },
      contractor: { total: 1, safe: 1, missing: 0, unknown: 0 },
    },
  },
};

/** GET .../organizations/:orgId/evacuations */
export const mockEvacuations = [
  mockActiveEvacuation,
  {
    _id: 'evac-2',
    branchId: WILLOW_HOUSE._id,
    branchName: WILLOW_HOUSE.name,
    type: 'mock',
    status: 'closed',
    startedAt: hoursAgo(72),
    closedAt: hoursAgo(71.5),
    startedByName: 'Ali Naveed',
    assemblyPoint: 'Rear garden gate',
    stats: {
      total: 40,
      safe: 40,
      missing: 0,
      unknown: 0,
    },
  },
  {
    _id: 'evac-3',
    branchId: ROSEWOOD_COURT._id,
    branchName: ROSEWOOD_COURT.name,
    type: 'real',
    status: 'closed',
    startedAt: hoursAgo(240),
    closedAt: hoursAgo(239),
    startedByName: 'Sana Yousuf',
    assemblyPoint: 'Front car park',
    stats: {
      total: 36,
      safe: 35,
      missing: 1,
      unknown: 0,
    },
  },
];

/** GET .../evacuations/:id/checks */
export const mockEvacChecksByEventId = {
  'evac-active-1': [
    {
      _id: 'chk-1',
      personKind: 'staff',
      personName: 'Amara Nwosu',
      status: 'safe',
      locationLabel: 'Assembly point',
      markedAt: minutesAgo(5),
    },
    {
      _id: 'chk-2',
      personKind: 'resident',
      personName: 'Room 12 — E. Khan',
      status: 'missing',
      locationLabel: '',
      markedAt: minutesAgo(3),
    },
    {
      _id: 'chk-3',
      personKind: 'visitor',
      personName: 'Walk-in Visitor',
      status: 'unknown',
      locationLabel: '',
      markedAt: null,
    },
    {
      _id: 'chk-4',
      personKind: 'contractor',
      personName: 'Site Works Ltd',
      status: 'safe',
      locationLabel: 'Car park',
      markedAt: minutesAgo(4),
    },
  ],
  'evac-2': [],
  'evac-3': [],
};

export function getMockEvacuations({ branchId, status = 'all' } = {}) {
  return mockEvacuations.filter((row) => {
    const matchBranch = !branchId || row.branchId === branchId;
    const matchStatus = status === 'all' || row.status === status;
    return matchBranch && matchStatus;
  });
}

export function getMockOnSiteSummary(branchId) {
  if (branchId && branchId !== mockOnSiteSummary.branchId) {
    const site = mockBranches.find((b) => b._id === branchId);
    return {
      ...mockOnSiteSummary,
      branchId: branchId || mockOnSiteSummary.branchId,
      branchName: site?.name || 'Site',
      counts: { staff: 0, residents: 0, visitors: 0, contractors: 0, total: 0 },
    };
  }
  return mockOnSiteSummary;
}

export function getMockActiveEvacuation(branchId) {
  if (!mockActiveEvacuation) return null;
  if (branchId && mockActiveEvacuation.branchId !== branchId) return null;
  return mockActiveEvacuation;
}

/** POST .../evacuations — mock start */
export function mockStartEvacuation({ branchId, type }) {
  const site = mockBranches.find((b) => b._id === branchId) || WILLOW_HOUSE;
  const event = {
    _id: `evac-${Date.now()}`,
    branchId: site._id,
    branchName: site.name,
    type,
    status: 'active',
    startedAt: new Date().toISOString(),
    closedAt: null,
    startedByName: 'You',
    assemblyPoint: site.name === WILLOW_HOUSE.name ? 'Rear garden gate' : 'Front car park',
    stats: {
      total: mockOnSiteSummary.counts.total,
      safe: 0,
      missing: 0,
      unknown: mockOnSiteSummary.counts.total,
      byKind: {
        staff: { total: 12, safe: 0, missing: 0, unknown: 12 },
        resident: { total: 28, safe: 0, missing: 0, unknown: 28 },
        visitor: { total: 3, safe: 0, missing: 0, unknown: 3 },
        contractor: { total: 1, safe: 0, missing: 0, unknown: 1 },
      },
    },
  };
  mockActiveEvacuation = event;
  mockEvacuations.unshift(event);
  mockEvacChecksByEventId[event._id] = [];
  return event;
}

/** POST .../evacuations/:id/close */
export function mockCloseEvacuation(eventId) {
  const event = mockEvacuations.find((e) => e._id === eventId);
  if (!event) return null;
  event.status = 'closed';
  event.closedAt = new Date().toISOString();
  if (mockActiveEvacuation?._id === eventId) mockActiveEvacuation = null;
  return event;
}

/** POST .../evacuations/:id/checks */
export function mockUpsertEvacCheck(eventId, { checkId, status }) {
  const list = mockEvacChecksByEventId[eventId] || [];
  const row = list.find((c) => c._id === checkId);
  if (!row) return null;
  row.status = status;
  row.markedAt = new Date().toISOString();
  return row;
}
