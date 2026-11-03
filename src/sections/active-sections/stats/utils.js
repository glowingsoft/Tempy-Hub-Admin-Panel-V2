export const PERIOD_OPTIONS = ['This month', 'This quarter', 'This year'];

export const PERIOD_TO_API = {
  'This month': 'thisMonth',
  'This quarter': 'thisQuarter',
  'This year': 'thisYear',
};

export const ROLE_CHART_COLORS = [
  '#5054E8',
  '#8E33FF',
  '#00B8D9',
  '#22C55E',
  '#FFAB00',
  '#FF5630',
  '#8B8FF2',
  '#C684FF',
  '#61F3F3',
  '#77ED8B',
  '#FFD666',
  '#FFAC82',
  '#3B3EB5',
  '#5119B7',
];

export function formatRoleLabel(label) {
  if (!label) return '';
  return String(label).replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

export function getYearOptions(currentYear = new Date().getFullYear()) {
  return Array.from({ length: 5 }, (_, index) => String(currentYear - (4 - index)));
}

export function mapWorkforceMovement(movement = {}) {
  const pick = (metric) => ({
    value: metric?.value ?? 0,
    change: metric?.change ?? 0,
  });

  return {
    retentionRate: pick(movement.retentionRate),
    newStarters: pick(movement.newStarters),
    leavers: pick(movement.leavers),
  };
}
