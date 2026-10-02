// Mock Tempy agency-connection data. Tempy is the agency staffing marketplace
// this Hub is meant to integrate with: once connected, a manager can send an
// open shift to Tempy for an agency to fill, and see what that's costing.
//
// The "connected" gate mirrors the `agencyShiftBids` module already defined
// in the platform's module catalog (see src/sections/organization/mocks/data.js
// MODULE_CATALOG) — that module was cataloged but never wired to a real
// feature; this is that feature.
//
// TODO: replace with a real API/RTK Query slice once the Tempy integration
// (OAuth-style connect + shift-request endpoints) is available. Shape below
// is a reasonable guess at what that response would look like.

export const TEMPY_MODULE_SLUG = 'agencyShiftBids';

export const tempyConnectionState = {
  connected: false,
  connectedAt: null,
  agencyName: 'Tempy Agency Network',
};

export const TEMPY_REQUEST_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending agency response', color: 'warning' },
  { value: 'filled', label: 'Filled by agency', color: 'success' },
  { value: 'declined', label: 'Declined', color: 'error' },
];

export const getTempyRequestStatusMeta = (value) =>
  TEMPY_REQUEST_STATUS_OPTIONS.find((option) => option.value === value) || {
    value,
    label: value || '—',
    color: 'default',
  };

const daysFromNow = (days, hour = 9) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

// Mutable (reassigned, not mutated-in-place) so `getTempyRequestsSnapshot`
// below can hand React a new array reference whenever it changes — required
// for `useSyncExternalStore` to detect the update. Not exported directly;
// go through `getTempyRequestsSnapshot` / `requestShiftViaTempyMock`.
let tempyRequestsList = [
  {
    _id: 'tempy-req-1',
    site: 'Willow House',
    role: 'Care assistant',
    startsAt: daysFromNow(1, 9),
    endsAt: daysFromNow(1, 17),
    status: 'filled',
    cost: 168,
    urgentCover: true,
    requestedAt: daysFromNow(-2, 11),
  },
  {
    _id: 'tempy-req-2',
    site: 'Rosewood Court',
    role: 'Senior carer',
    startsAt: daysFromNow(3, 20),
    endsAt: daysFromNow(4, 8),
    status: 'pending',
    cost: 210,
    urgentCover: false,
    requestedAt: daysFromNow(0, 9),
  },
  {
    _id: 'tempy-req-3',
    site: 'Oakfield Lodge',
    role: 'Care assistant',
    startsAt: daysFromNow(-4, 9),
    endsAt: daysFromNow(-4, 17),
    status: 'declined',
    cost: 0,
    urgentCover: false,
    requestedAt: daysFromNow(-6, 14),
  },
];

// Headline usage/cost figures for the "connected" summary + usage page.
export const tempyUsageSummary = {
  spendThisMonth: 3420,
  spendLastMonth: 2760,
  shiftsRequested: 18,
  shiftsFilled: 14,
  avgCostPerShift: 187,
};

export const tempyCostTrend = {
  categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  series: [{ name: 'Agency spend (£)', data: [1840, 2210, 1950, 2680, 2760, 3420] }],
};

// ----------------------------------------------------------------------
// Tiny external store so every `useTempyConnection()` call — the connect
// card, the usage page, the shift-claims "send to Tempy" action — reacts to
// the same connect/request state, no matter which component triggered the
// change. Paired with React's `useSyncExternalStore` in use-tempy-connection.js.
// ----------------------------------------------------------------------

const listeners = new Set();

function emitTempyChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeToTempyChanges(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTempyConnectionSnapshot() {
  return tempyConnectionState.connected;
}

export function getTempyRequestsSnapshot() {
  return tempyRequestsList;
}

// ----------------------------------------------------------------------
// Prototype mutators — no backend yet, so mutate the in-memory mocks so every
// subscribed component reflects the change immediately.
// ----------------------------------------------------------------------

export function connectToTempyMock() {
  tempyConnectionState.connected = true;
  tempyConnectionState.connectedAt = new Date().toISOString();
  emitTempyChange();
  return { ...tempyConnectionState };
}

export function requestShiftViaTempyMock({ site, role, startsAt, endsAt, urgentCover = false, notes }) {
  const request = {
    _id: `tempy-req-${Date.now()}`,
    site,
    role,
    startsAt,
    endsAt,
    urgentCover,
    notes: notes || null,
    status: 'pending',
    cost: null,
    requestedAt: new Date().toISOString(),
  };
  tempyRequestsList = [request, ...tempyRequestsList];
  tempyUsageSummary.shiftsRequested += 1;
  emitTempyChange();
  return request;
}
