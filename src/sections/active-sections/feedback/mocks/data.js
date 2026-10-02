// Mock client feedback data — feedback submitted by residents/families about
// care, reviewed and responded to by the line manager.
// TODO: replace with a real API/RTK Query slice once the endpoint exists.

export const FEEDBACK_CATEGORY_OPTIONS = [
  'Care quality',
  'Food',
  'Communication',
  'Facilities',
  'Staff conduct',
  'Other',
];

export const FEEDBACK_STATUS_OPTIONS = [
  { value: 'open', label: 'Awaiting response', color: 'warning' },
  { value: 'resolved', label: 'Resolved', color: 'success' },
];

export const getFeedbackStatusMeta = (value) =>
  FEEDBACK_STATUS_OPTIONS.find((option) => option.value === value) || {
    value,
    label: value || '—',
    color: 'default',
  };

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const _clientFeedback = [
  {
    id: 'fb1',
    residentName: 'Eleanor Whitfield',
    submittedBy: 'Margaret Whitfield (daughter)',
    site: 'Willow House',
    category: 'Care quality',
    message:
      "Mum's been really well looked after this month, the staff on the morning shift especially have been wonderful with her mobility exercises.",
    submittedAt: daysAgo(2),
    status: 'open',
    response: null,
    respondedAt: null,
  },
  {
    id: 'fb2',
    residentName: 'Harold Jennings',
    submittedBy: 'David Jennings (son)',
    site: 'Rosewood Court',
    category: 'Food',
    message:
      'Dad mentioned the evening meals have been quite repetitive the last couple of weeks. Could the menu be varied a bit more?',
    submittedAt: daysAgo(5),
    status: 'open',
    response: null,
    respondedAt: null,
  },
  {
    id: 'fb3',
    residentName: 'Ivy Robertson',
    submittedBy: 'Ivy Robertson (resident)',
    site: 'Willow House',
    category: 'Communication',
    message: "I'd like a call back before any changes are made to my visiting schedule next time.",
    submittedAt: daysAgo(9),
    status: 'resolved',
    response: 'Spoke with Ivy directly and updated her file so the front desk always confirms with her first.',
    respondedAt: daysAgo(7),
  },
  {
    id: 'fb4',
    residentName: 'Norman Field',
    submittedBy: 'Susan Field (wife)',
    site: 'Oakfield Lodge',
    category: 'Facilities',
    message: 'The reading lamp in his room has been flickering for a week now, could someone take a look?',
    submittedAt: daysAgo(1),
    status: 'open',
    response: null,
    respondedAt: null,
  },
];

// ----------------------------------------------------------------------
// Prototype mutator — no backend yet, so mutate the in-memory list so the
// list view reflects the response immediately.
// ----------------------------------------------------------------------

export function respondToMockFeedback(id, response) {
  const item = _clientFeedback.find((entry) => entry.id === id);
  if (!item) return null;

  item.response = response;
  item.status = 'resolved';
  item.respondedAt = new Date().toISOString();

  return item;
}
