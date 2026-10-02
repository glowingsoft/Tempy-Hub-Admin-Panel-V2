import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import RotaShiftChip from 'src/sections/active-sections/rota/rota-shift-chip';

// ----------------------------------------------------------------------
// Client feedback: "Next Assigned shifts" should read like a horizontal rota
// (a day-by-day strip, scrollable week to week) rather than a bulleted list,
// with hours-per-week shown alongside. Reuses the same shift-block visual
// (`RotaShiftChip`) as the full team Rota screen — just laid out as a single
// row for one person. The full grid (`RotaScheduleGrid`, multi-staff,
// drag/drop) is built for team view and would be overkill for a dashboard card.
// ----------------------------------------------------------------------

// Monday-first week boundary — same (day() + 6) % 7 idiom already used for
// "Hours this week" on the dashboard, so no new dayjs plugin (e.g. isoWeek)
// is needed just for this.
function startOfWeek(date) {
  const mondayOffset = (date.day() + 6) % 7;
  return date.subtract(mondayOffset, 'day').startOf('day');
}

export function StaffShiftCalendarStrip({ title, shifts = [], sx, ...other }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => startOfWeek(dayjs().add(weekOffset, 'week')), [weekOffset]);

  const dayColumns = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = weekStart.add(index, 'day');
        const shift = shifts.find((item) => dayjs(item.startsAt).isSame(date, 'day'));

        return {
          key: date.format('YYYY-MM-DD'),
          weekday: date.format('ddd'),
          dayLabel: date.format('D MMM'),
          isToday: date.isSame(dayjs(), 'day'),
          shift,
        };
      }),
    [weekStart, shifts]
  );

  const weekHours = useMemo(
    () =>
      dayColumns.reduce((total, day) => {
        if (!day.shift) return total;
        return total + dayjs(day.shift.endsAt).diff(dayjs(day.shift.startsAt), 'hour', true);
      }, 0),
    [dayColumns]
  );

  const subheader = `${weekStart.format('D MMM')} – ${weekStart.add(6, 'day').format('D MMM')} · ${Math.round(weekHours * 10) / 10}h scheduled`;

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', ...sx }} {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => setWeekOffset((week) => week - 1)}>
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>
            <IconButton size="small" onClick={() => setWeekOffset((week) => week + 1)}>
              <Iconify icon="eva:arrow-ios-forward-fill" />
            </IconButton>
          </Stack>
        }
      />

      <Box sx={{ flexGrow: 1, overflowX: 'auto', px: 3, pb: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ minWidth: 'min-content' }}>
          {dayColumns.map((day) => (
            <Stack
              key={day.key}
              spacing={1}
              alignItems="center"
              sx={{
                width: 92,
                flexShrink: 0,
                p: 1,
                borderRadius: 1.5,
                bgcolor: day.isToday ? 'action.selected' : 'transparent',
              }}
            >
              <Stack alignItems="center" spacing={0}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {day.weekday}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {day.dayLabel}
                </Typography>
              </Stack>

              {day.shift ? (
                <Stack alignItems="center" spacing={0.5} sx={{ width: 1 }}>
                  <RotaShiftChip
                    shift={{
                      type: 'default',
                      start: fTime(day.shift.startsAt),
                      end: fTime(day.shift.endsAt),
                    }}
                  />
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ color: 'text.secondary', maxWidth: 1 }}
                  >
                    {day.shift.location}
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1 }}>
                  —
                </Typography>
              )}
            </Stack>
          ))}
        </Stack>
      </Box>
    </Card>
  );
}
