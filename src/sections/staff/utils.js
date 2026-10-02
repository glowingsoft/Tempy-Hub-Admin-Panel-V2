// Shared helpers for the Staff (Employee) Dashboard.

// ----------------------------------------------------------------------
// Compliance urgency
// ----------------------------------------------------------------------

export const COMPLIANCE_URGENCY_LABEL = {
  overdue: 'Overdue',
  dueSoon: 'Due soon',
};

export const getComplianceUrgencyLabel = (urgency) =>
  COMPLIANCE_URGENCY_LABEL[urgency] || urgency || '';

/**
 * % of required items that are up to date — total minus whatever's currently
 * flagged as overdue/due soon for that category. Returns null when there's no
 * total to score against (nothing to divide by).
 */
export function getComplianceScore(needsActionCount, total) {
  if (!total) return null;
  return Math.round(((total - needsActionCount) / total) * 100);
}

// ----------------------------------------------------------------------
// Duration
// ----------------------------------------------------------------------

/** 205 -> "3h 25m", 0 -> "0m" */
export function fDurationFromMinutes(totalMinutes) {
  const safe = Math.max(0, Math.round(totalMinutes || 0));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;

  if (!hours) return `${minutes}m`;
  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

// ----------------------------------------------------------------------
// Live on-site time
// ----------------------------------------------------------------------

/**
 * Minutes worked so far today from the clock state — elapsed time since
 * clock-in, minus every break (including one still open). `nowTs` is passed in
 * so the caller can drive a live-updating value from a timer.
 */
export function getWorkedMinutes(clock, nowTs = Date.now()) {
  if (!clock?.clockInAt) return 0;

  const start = new Date(clock.clockInAt).getTime();
  const end = clock.clockOutAt ? new Date(clock.clockOutAt).getTime() : nowTs;

  const breakMs = (clock.breaks || []).reduce((total, entry) => {
    if (!entry.startedAt) return total;
    const breakStart = new Date(entry.startedAt).getTime();
    const breakEnd = entry.endedAt ? new Date(entry.endedAt).getTime() : nowTs;
    return total + Math.max(0, breakEnd - breakStart);
  }, 0);

  return Math.max(0, (end - start - breakMs) / 60000);
}

// ----------------------------------------------------------------------
// Break entitlement
// ----------------------------------------------------------------------

/**
 * How many minutes of unpaid break a shift of `shiftHours` earns, per the
 * site's `breakRules` (same shape as the Site settings form). The longest
 * shift that still qualifies wins — a 12h shift matches both a 12h and a 6h
 * rule, but the 12h one applies.
 */
export function getBreakEntitlementMinutes(shiftHours, rules = []) {
  const applicable = rules
    .filter((rule) => shiftHours >= rule.minHours)
    .sort((a, b) => b.minHours - a.minHours)[0];

  return applicable?.unpaidMinutes || 0;
}
