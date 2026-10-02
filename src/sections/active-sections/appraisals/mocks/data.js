import dayjs from 'dayjs';

export const _mockAppraisals = [
  {
    id: 'ap1',
    name: 'Amara Nwosu',
    role: 'Care Assistant',
    department: 'Care',
    avatar: 'https://i.pravatar.cc/150?img=5',
    period: 'Annual Review 2026',
    startDate: '2023-04-12',
    lastReview: '2025-09-15',
    nextDue: '2026-09-15',
    status: 'due_soon',
  },
  {
    id: 'ap2',
    name: 'Priya Nair',
    role: 'Senior Carer',
    department: 'Care',
    avatar: 'https://i.pravatar.cc/150?img=32',
    period: 'Mid-Year Review 2026',
    startDate: '2022-08-01',
    lastReview: '2026-03-10',
    nextDue: '2026-09-30',
    status: 'scheduled',
  },
  {
    id: 'ap3',
    name: 'Sam Okafor',
    role: 'Senior Carer',
    department: 'Nursing',
    avatar: 'https://i.pravatar.cc/150?img=51',
    period: 'Annual Review 2025',
    startDate: '2021-11-15',
    lastReview: '2025-06-01',
    nextDue: '2026-06-01',
    status: 'overdue',
  },
  {
    id: 'ap4',
    name: 'Grace Obi',
    role: 'Care Assistant',
    department: 'Care',
    avatar: 'https://i.pravatar.cc/150?img=44',
    period: 'Probation Review',
    startDate: '2025-07-01',
    lastReview: '2026-01-15',
    nextDue: '2026-07-15',
    status: 'completed',
  },
];

// Historical appraisal sessions
export const _mockAppraisalSessions = [
  {
    _id: 'app-sess-001',
    staffId: 'ap1',
    sessionDate: '2025-09-15T00:00:00.000Z',
    period: 'Annual Review 2025',
    status: 'completed',
    conductedBy: 'Philip (Site Lead)',
    notes: 'Amara consistently displays high care standards and excellent rapport with dementia residents. Punctuality and shift handover notes have improved noticeably.',
    document: { name: 'Signed Appraisal Record — Amara Nwosu 2025.pdf', size: '240 KB', fileType: 'pdf' },
    actionPoints: [
      { id: 'ap-act-001', text: 'Enroll in Dementia Care Level 3 Certificate', signedOff: true },
      { id: 'ap-act-002', text: 'Shadow senior carer on complex medication rounds', signedOff: false },
    ],
  },
  {
    _id: 'app-sess-002',
    staffId: 'ap2',
    sessionDate: '2026-03-10T00:00:00.000Z',
    period: 'Mid-Year Review 2026',
    status: 'completed',
    conductedBy: 'Line Manager',
    notes: 'Priya continues to lead the senior carer team with distinction. Feedback from families at Florence House has been exceptionally positive.',
    document: { name: 'Priya Nair — Mid-Year Appraisal 2026.pdf', size: '185 KB', fileType: 'pdf' },
    actionPoints: [
      { id: 'ap-act-003', text: 'Deliver peer mentoring for new night-shift care assistants', signedOff: true },
    ],
  },
  {
    _id: 'app-sess-003',
    staffId: 'ap3',
    sessionDate: '2025-06-01T00:00:00.000Z',
    period: 'Annual Review 2025',
    status: 'completed',
    conductedBy: 'Line Manager',
    notes: 'Clinical knowledge is strong. Action plan agreed to address documentation completion timeliness during peak handover periods.',
    document: null,
    actionPoints: [
      { id: 'ap-act-004', text: 'Complete Digital Care Planning refresher module', signedOff: false },
      { id: 'ap-act-005', text: 'Participate in monthly resident medication audits', signedOff: false },
    ],
  },
  {
    _id: 'app-sess-004',
    staffId: 'ap4',
    sessionDate: '2026-01-15T00:00:00.000Z',
    period: 'Probation Review',
    status: 'completed',
    conductedBy: 'Line Manager',
    notes: 'Successfully completed 6-month probation. Demonstrates dependable empathy, reliability, and safe moving-and-handling practice.',
    document: { name: 'Grace Obi — Probation Sign-off.pdf', size: '310 KB', fileType: 'pdf' },
    actionPoints: [
      { id: 'ap-act-006', text: 'Complete Safeguarding Adults refresher', signedOff: true },
    ],
  },
];

export function logTeamAppraisalReview(staffId, reviewData) {
  const newSession = {
    _id: `app-sess-${Date.now()}`,
    staffId,
    sessionDate: reviewData.dateHeld || new Date().toISOString(),
    period: reviewData.period || 'Annual Review 2026',
    status: reviewData.status || 'completed',
    conductedBy: reviewData.conductedBy || 'Line Manager',
    notes: reviewData.notes || '',
    document: reviewData.document || null,
    actionPoints: reviewData.actionPoints || [],
  };

  _mockAppraisalSessions.unshift(newSession);

  // Update staff summary
  const staff = _mockAppraisals.find((s) => s.id === staffId);
  if (staff) {
    staff.lastReview = dayjs(reviewData.dateHeld).format('YYYY-MM-DD');
    staff.nextDue = dayjs(reviewData.nextDue).format('YYYY-MM-DD');
    staff.status = reviewData.status || 'completed';
    staff.period = reviewData.period || staff.period;
  }

  return newSession;
}

export function signOffAppraisalActionPoint(sessionId, actionPointId) {
  const session = _mockAppraisalSessions.find((s) => s._id === sessionId);
  if (session && session.actionPoints) {
    const point = session.actionPoints.find((p) => p.id === actionPointId);
    if (point) {
      point.signedOff = !point.signedOff;
    }
  }
}
