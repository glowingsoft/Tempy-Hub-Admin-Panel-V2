import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import DayCell from './day-cell';

// ----------------------------------------------------------------------

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Each cell: { label, muted, selected, dotted, outlined }
const DEFAULT_WEEKS = [
  [
    { label: '', muted: true },
    { label: '', muted: true },
    { label: '1' },
    { label: '2', outlined: true, dotted: true },
    { label: '3' },
    { label: '4' },
    { label: '5' },
  ],
  [
    { label: '6', selected: true },
    { label: '7', outlined: true, dotted: true },
    { label: '8' },
    { label: '9' },
    { label: '10', outlined: true, dotted: true },
    { label: '11' },
    { label: '12' },
  ],
  [
    { label: '13' },
    { label: '14' },
    { label: '15' },
    { label: '16' },
    { label: '17' },
    { label: '18' },
    { label: '19' },
  ],
  [
    { label: '20' },
    { label: '21' },
    { label: '22' },
    { label: '23' },
    { label: '24' },
    { label: '25' },
    { label: '26' },
  ],
];

// ----------------------------------------------------------------------

export default function MiniCalendar({
  month = 'Aug 2025',
  weeks = DEFAULT_WEEKS,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
  sx,
  ...other
}) {
  return (
    <Card sx={{ p: 3, maxWidth: 380, ...sx }} {...other}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Typography variant="h6">{month}</Typography>

        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={onPrevMonth} sx={{ border: (theme) => `solid 1px ${theme.palette.divider}` }}>
            <Iconify icon="eva:arrow-ios-back-fill" width={16} />
          </IconButton>

          <IconButton size="small" onClick={onNextMonth} sx={{ border: (theme) => `solid 1px ${theme.palette.divider}` }}>
            <Iconify icon="eva:arrow-ios-forward-fill" width={16} />
          </IconButton>
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
        {DAY_LABELS.map((day, index) => (
          <Typography
            key={`${day}-${index}`}
            variant="caption"
            sx={{ textAlign: 'center', color: 'text.disabled', fontWeight: 'fontWeightMedium' }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {weeks.map((week, weekIndex) =>
          week.map((cell, dayIndex) => (
            <DayCell key={`${weekIndex}-${dayIndex}`} cell={cell} onSelect={onSelectDay} />
          ))
        )}
      </Box>
    </Card>
  );
}

MiniCalendar.propTypes = {
  month: PropTypes.string,
  weeks: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        muted: PropTypes.bool,
        selected: PropTypes.bool,
        outlined: PropTypes.bool,
        dotted: PropTypes.bool,
      })
    )
  ),
  onPrevMonth: PropTypes.func,
  onNextMonth: PropTypes.func,
  onSelectDay: PropTypes.func,
  sx: PropTypes.object,
};