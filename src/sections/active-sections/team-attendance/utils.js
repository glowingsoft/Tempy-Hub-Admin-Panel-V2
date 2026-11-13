// Shared by the Team Attendance page (table + shift grid + summary tiles)
// and the Line Manager Dashboard — same derivation, one place, so the
// numbers can never disagree between screens.

export function getPunctualityLabel(status) {
  if (status === 'onTime') return 'On time';
  if (status === 'unscheduled') return 'Unscheduled';
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getAttendanceSummary(records) {
  const safeRecords = Array.isArray(records) ? records : [];
  const onTime = safeRecords.filter((row) => row?.punctualityStatus === 'onTime').length;
  const late = safeRecords.filter((row) => row?.punctualityStatus === 'late').length;
  const total = safeRecords.length;
  const attendanceRate = total ? Math.round((onTime / total) * 100) : null;

  return { total, onTime, late, attendanceRate };
}