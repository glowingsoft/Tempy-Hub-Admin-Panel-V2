import dayjs from 'dayjs';

export const _mockAppraisals = [];

// Historical appraisal sessions
export const _mockAppraisalSessions = [];

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
