import dayjs from 'dayjs';

export const staffSupervisionSummary = {
    supervision: {
        frequency: 'Every 3 months',
        expectedThisYear: 4,
        completedThisYear: 3,
        lastCompletedAt: '2026-07-18T00:00:00.000Z',
        nextDueAt: '2026-10-18T00:00:00.000Z',
        status: 'current',
    },
    appraisal: {
        frequency: 'Once per year',
        expectedThisYear: 1,
        completedThisYear: 0,
        lastCompletedAt: '2025-08-28T00:00:00.000Z',
        nextDueAt: '2026-08-28T00:00:00.000Z',
        status: 'overdue',
    },
};

// Client feedback: History should support an attached document plus separate
// action points that can each be signed off individually — a single "notes"
// string wasn't enough. `document` is optional (not every past session has
// one on file); `actionPoints` defaults to an empty array.
export const staffSupervisionSessions = [
    {
        _id: 'staff-session-001',
        type: 'supervision',
        sessionDate: '2026-07-18T00:00:00.000Z',
        conductedBy: 'Priya Shah',
        status: 'completed',
        notes: 'Notes available',
        document: { name: 'Supervision record — 18 Jul 2026', fileType: 'pdf' },
        actionPoints: [
            { id: 'ap-001', text: 'Complete Moving & Handling refresher', signedOff: true },
            { id: 'ap-002', text: 'Shadow a senior carer on medication rounds', signedOff: false },
        ],
    },
    {
        _id: 'staff-session-002',
        type: 'appraisal',
        sessionDate: '2025-08-28T00:00:00.000Z',
        conductedBy: 'Priya Shah',
        status: 'completed',
        notes: 'Objectives set',
        document: { name: 'Appraisal record — 28 Aug 2025', fileType: 'pdf' },
        actionPoints: [
            { id: 'ap-003', text: 'Enrol on the Senior Carer pathway course', signedOff: true },
        ],
    },
    {
        _id: 'staff-session-003',
        type: 'supervision',
        sessionDate: '2026-04-21T00:00:00.000Z',
        conductedBy: 'Priya Shah',
        status: 'completed',
        notes: 'Notes available',
        document: null,
        actionPoints: [],
    },
];

export function signOffMockActionPoint(sessionId, actionPointId) {
    const session = staffSupervisionSessions.find((item) => item._id === sessionId);
    const actionPoint = session?.actionPoints.find((item) => item.id === actionPointId);
    if (!actionPoint) return null;

    actionPoint.signedOff = !actionPoint.signedOff;
    return actionPoint;
}

export const staffUpcomingSupervision = {
    _id: 'staff-session-upcoming-001',
    type: 'supervision',
    sessionDate: '2026-10-18T11:00:00.000Z',
    conductedBy: 'Priya Shah',
    location: 'Room 2',
    status: 'upcoming',
};

export function getStaffSupervisionStatus(nextDueAt, today = dayjs()) {
    const daysUntilDue = dayjs(nextDueAt).diff(today, 'day');
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 30) return 'dueSoon';
    return 'current';
}
