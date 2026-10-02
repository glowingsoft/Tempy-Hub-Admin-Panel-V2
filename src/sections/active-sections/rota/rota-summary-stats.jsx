import { Divider } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------
// Small reusable "label + value" stat block, reused for hours / cost / shifts.
// Swap `formatCurrency` for your project's fCurrency() util (src/utils/format-number)
// once this is wired to real data.
// ----------------------------------------------------------------------

// function formatCurrency(value) {
//   return new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(value);
// }

function StatItem({ value, label, last = false }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="h5">{value}</Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>

      {/* No divider after the last item — was leaving a dangling rule above
          empty sidebar space. */}
      {!last && <Divider sx={{ mt: 0.5 }} />}
    </Stack>
  );
}

// `earnings` is optional — only passed (and only then shown) when viewing
// your own rota and an hourly rate is set, same convention as the Staff
// Dashboard's "Earned this week" card.
export default function RotaSummaryStats({ totalHours, totalCost, totalShifts, showTotalCost = true, earnings }) {
  const items = [
    { key: 'hours', value: `${totalHours}h`, label: 'Total Hours' },
    showTotalCost && { key: 'cost', value: fCurrency(totalCost, { code: 'en-GB', currency: 'GBP' }), label: 'Total Cost' },
    { key: 'shifts', value: totalShifts, label: 'Total Shifts' },
    earnings != null && { key: 'earnings', value: fCurrency(earnings, { code: 'en-GB', currency: 'GBP' }), label: 'Money Earnt' },
  ].filter(Boolean);

  return (
    <Stack spacing={2}>
      {items.map((item, index) => (
        <StatItem key={item.key} value={item.value} label={item.label} last={index === items.length - 1} />
      ))}
    </Stack>
  );
}
