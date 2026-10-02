import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const SHIFT_TYPES = [
  { value: 'default', label: 'Regular Shift', icon: 'solar:clock-circle-bold' },
  { value: 'sleepover', label: 'Sleepover', icon: 'solar:moon-bold' },
  { value: 'on-call', label: 'On Call', icon: 'solar:phone-calling-bold' },
];

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '08:30', '09:00', '09:30', '10:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00', '22:00', '23:00',
];

function formatTimeDisplay(timeStr) {
  if (!timeStr) return '';
  const [hours, mins] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'p' : 'a';
  const displayHours = hours % 12 || 12;
  const displayMins = mins ? `:${mins < 10 ? '0' : ''}${mins}` : '';
  return `${displayHours}${displayMins}${period}`;
}

export default function RotaBookShiftDialog({
  open,
  onClose,
  cellData,
  onSubmit,
}) {
  const staff = cellData?.staff;
  const day = cellData?.day;

  const [shiftType, setShiftType] = useState('default');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setShiftType('default');
      setStartTime('09:00');
      setEndTime('17:00');
      setNote('');
      setError('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (shiftType !== 'sleepover') {
      if (!startTime || !endTime) {
        setError('Start time and end time are required.');
        return;
      }
    }

    const formattedStart = formatTimeDisplay(startTime);
    const formattedEnd = formatTimeDisplay(endTime);

    // Calculate approximate duration in hours
    let hoursDiff = 8;
    if (startTime && endTime) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
      if (totalMinutes > 0) {
        hoursDiff = Math.round((totalMinutes / 60) * 10) / 10;
      }
    }

    const shiftPayload = {
      type: shiftType,
      start: formattedStart,
      end: formattedEnd,
      hours: hoursDiff,
      note: note.trim(),
    };

    onSubmit({
      staffId: staff?.id,
      date: day?.date,
      shift: shiftPayload,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ pb: 1 }}>Book Shift</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {/* Staff Info Banner */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              p: 1.5,
              borderRadius: 1.25,
              bgcolor: (theme) => `${theme.palette.grey[500]}12`,
            }}
          >
            <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.darker', fontWeight: 700, width: 36, height: 36 }}>
              {staff?.name
                ? staff.name
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                : 'S'}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                {staff?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {day?.label || day?.date}
              </Typography>
            </Box>
          </Stack>

          {/* Shift Type */}
          <TextField
            select
            label="Shift Type"
            value={shiftType}
            onChange={(e) => setShiftType(e.target.value)}
            fullWidth
            size="small"
          >
            {SHIFT_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value} sx={{ display: 'flex', gap: 1.25 }}>
                <Iconify icon={type.icon} width={18} />
                {type.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Times */}
          {shiftType !== 'sleepover' && (
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Start Time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setError('');
                }}
                fullWidth
                size="small"
              >
                {TIME_SLOTS.map((time) => (
                  <MenuItem key={time} value={time}>
                    {time} ({formatTimeDisplay(time)})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="End Time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setError('');
                }}
                fullWidth
                size="small"
              >
                {TIME_SLOTS.map((time) => (
                  <MenuItem key={time} value={time}>
                    {time} ({formatTimeDisplay(time)})
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}

          {/* Optional Note */}
          <TextField
            label="Notes / Role (optional)"
            placeholder="e.g. Care floor, Kitchen"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            size="small"
          />

          {error && <FormHelperText error>{error}</FormHelperText>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} startIcon={<Iconify icon="solar:calendar-add-bold" />}>
          Book Shift
        </Button>
      </DialogActions>
    </Dialog>
  );
}

RotaBookShiftDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  cellData: PropTypes.object,
  onSubmit: PropTypes.func,
};
