// Mock visits + post-visit survey responses, keyed by the token encoded in
// the QR code shown on the kiosk at checkout. The public survey page looks
// up visit context by token (no auth), and submissions land here for the
// admin "Visitor Feedback" list.
// TODO: replace with a real public API endpoint once the backend exists.

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const mockVisitorVisits = {
  'demo-visit-1': {
    token: 'demo-visit-1',
    visitorName: 'Amara Nwosu',
    host: 'Ali Naveed',
    site: 'Willow House',
    checkInAt: daysAgo(0),
    checkOutAt: new Date().toISOString(),
  },
  'demo-visit-2': {
    token: 'demo-visit-2',
    visitorName: 'Sam Okafor',
    host: 'Bilal Ahmed',
    site: 'Rosewood Court',
    checkInAt: daysAgo(0),
    checkOutAt: new Date().toISOString(),
  },
};

export function getMockVisitorVisit(token) {
  return mockVisitorVisits[token] || null;
}

function visitDurationMinutes(visit) {
  const ms = new Date(visit.checkOutAt) - new Date(visit.checkInAt);
  return Math.max(1, Math.round(ms / 60000));
}

export const _visitorFeedback = [
  {
    id: 'vf-1',
    token: 'demo-visit-3',
    visitorName: 'Priya Nair',
    host: 'Sana Yousuf',
    site: 'Willow House',
    durationMinutes: 52,
    rating: 5,
    comment: 'Lovely visit, staff were very welcoming and mum was in great spirits.',
    submittedAt: daysAgo(1),
  },
  {
    id: 'vf-2',
    token: 'demo-visit-4',
    visitorName: 'Tom Alder',
    host: 'Bilal Ahmed',
    site: 'Rosewood Court',
    durationMinutes: 25,
    rating: 3,
    comment: 'Had to wait a while at reception before someone could sign me in.',
    submittedAt: daysAgo(3),
  },
];

export function submitMockVisitorFeedback(token, { rating, comment }) {
  const visit = getMockVisitorVisit(token);
  if (!visit) return null;

  const entry = {
    id: `vf-${_visitorFeedback.length + 1}`,
    token,
    visitorName: visit.visitorName,
    host: visit.host,
    site: visit.site,
    durationMinutes: visitDurationMinutes(visit),
    rating,
    comment: comment || '',
    submittedAt: new Date().toISOString(),
  };

  _visitorFeedback.push(entry);

  return entry;
}
