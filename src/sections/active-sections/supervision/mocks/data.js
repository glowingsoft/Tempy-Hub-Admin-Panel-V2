import dayjs from 'dayjs';

export const _teamSupervision = [
  {
    id: 's1',
    name: 'Amara Nwosu',
    role: 'Care assistant',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastSession: '2026-06-12',
    nextDue: '6 Aug',
    overdueDays: 22,
    status: 'overdue',
  },
  {
    id: 's2',
    name: 'Sam Okafor',
    role: 'Senior carer',
    avatar: 'https://i.pravatar.cc/150?img=51',
    lastSession: '2026-07-15',
    nextDue: '12 Sep',
    status: 'due_soon',
  },
  {
    id: 's3',
    name: 'Grace Obi',
    role: 'Care assistant, nights',
    avatar: 'https://i.pravatar.cc/150?img=44',
    lastSession: '2026-05-03',
    nextDue: '4 Sep',
    status: 'booked',
  },
  {
    id: 's4',
    name: 'Priya Nair',
    role: 'Senior carer',
    avatar: 'https://i.pravatar.cc/150?img=32',
    lastSession: '2026-08-01',
    nextDue: '9 Oct',
    status: 'booked',
  },
];

// Mirrors the staff-side session model (src/sections/staff/supervision/mocks/data.js):
// each logged session keeps its own action points, and each action point is
// signed off individually rather than the whole session at once.
export const _teamSupervisionSessions = [
  {
    _id: 'tsup-001',
    staffId: 's1',
    sessionDate: '2026-06-12T00:00:00.000Z',
    topics: ['Wellbeing', 'Caseload'],
    notes: 'Discussed workload balance after the recent shift changes.',
    actionPoints: [
      { id: 'tap-001', text: 'Review rota fairness for weekend shifts', signedOff: true },
      { id: 'tap-002', text: 'Book safeguarding refresher', signedOff: false },
    ],
  },
  {
    _id: 'tsup-002',
    staffId: 's2',
    sessionDate: '2026-07-15T00:00:00.000Z',
    topics: ['Training needs'],
    notes: 'Keen to progress toward senior carer competencies.',
    actionPoints: [
      { id: 'tap-003', text: 'Enrol on medication administration course', signedOff: true },
    ],
  },
  {
    _id: 'tsup-003',
    staffId: 's3',
    sessionDate: '2026-05-03T00:00:00.000Z',
    topics: ['Performance', 'Wellbeing'],
    notes: 'Positive session, no concerns raised.',
    actionPoints: [],
  },
];

export function signOffTeamActionPoint(sessionId, actionPointId) {
  const session = _teamSupervisionSessions.find((item) => item._id === sessionId);
  const actionPoint = session?.actionPoints.find((item) => item.id === actionPointId);
  if (!actionPoint) return null;

  actionPoint.signedOff = !actionPoint.signedOff;
  return actionPoint;
}

// Turns the dialog's free-typed "one action per line" text into the same
// { id, text, signedOff } shape the history view expects.
export function logTeamSupervisionSession(staffId, { dateHeld, topics, actionsNeeded, notes }) {
  const actionPoints = (actionsNeeded || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text, index) => ({ id: `tap-${Date.now()}-${index}`, text, signedOff: false }));

  const session = {
    _id: `tsup-${Date.now()}`,
    staffId,
    sessionDate: dayjs(dateHeld).toISOString(),
    topics,
    notes,
    actionPoints,
  };

  _teamSupervisionSessions.unshift(session);
  return session;
}