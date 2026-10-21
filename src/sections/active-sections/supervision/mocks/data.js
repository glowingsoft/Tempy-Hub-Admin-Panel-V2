import dayjs from 'dayjs';

export const _teamSupervision = [];

// Mirrors the staff-side session model (src/sections/staff/supervision/mocks/data.js):
// each logged session keeps its own action points, and each action point is
// signed off individually rather than the whole session at once.
export const _teamSupervisionSessions = [];

export function signOffTeamActionPoint(sessionId, actionPointId) {
  const session = _teamSupervisionSessions.find((item) => item._id === sessionId);
  const actionPoint = session?.actionPoints?.find((item) => item.id === actionPointId);
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