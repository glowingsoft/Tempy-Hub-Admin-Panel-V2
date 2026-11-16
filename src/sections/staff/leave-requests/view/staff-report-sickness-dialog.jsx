import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import LoadingButton from '@mui/lab/LoadingButton';

import { fDateTime } from 'src/utils/format-time';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetMyShiftsQuery } from 'src/store/Reducer/shifts-api';

// ----------------------------------------------------------------------

const getShiftId = (shift) => String(shift?._id || shift?.id || '');

const isShiftOnDate = (shift, targetDate) => {
  if (!targetDate || !dayjs(targetDate).isValid() || !shift?.startsAt) return false;
  const target = dayjs(targetDate).startOf('day');
  const start = dayjs(shift.startsAt);
  const end = shift.endsAt ? dayjs(shift.endsAt) : start;

  const startsOnDay = start.isSame(target, 'day');
  const endsOnDay = end.isSame(target, 'day');
  const coversDay = target.isAfter(start.startOf('day')) && target.isBefore(end.endOf('day'));

  return startsOnDay || endsOnDay || coversDay;
};

// ----------------------------------------------------------------------

export function StaffReportSicknessDialog({ open, onClose, onSubmit }) {
  const { organizationId } = useCurrentOrganization();

  const { data: myShiftsData, isLoading: isShiftsLoading } = useGetMyShiftsQuery(
    { organizationId, status: 'all' },
    { skip: !open || !organizationId }
  );

  const allShifts = useMemo(() => myShiftsData?.data ?? [], [myShiftsData]);

  // By default, no date is selected
  const [startDate, setStartDate] = useState(null);
  const [shiftId, setShiftId] = useState('');
  const [shiftDropdownOpen, setShiftDropdownOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shifts matching the currently selected date
  const shiftsOnSelectedDate = useMemo(() => {
    if (!startDate || !dayjs(startDate).isValid()) return [];
    return allShifts.filter((shift) => isShiftOnDate(shift, startDate));
  }, [allShifts, startDate]);

  // Reset form whenever modal opens
  useEffect(() => {
    if (open) {
      setStartDate(null);
      setShiftId('');
      setShiftDropdownOpen(false);
      setReason('');
      setError('');
      setFieldErrors({});
    }
  }, [open]);

  const handleDateChange = (newDate) => {
    setStartDate(newDate);
    setFieldErrors((prev) => ({ ...prev, startDate: '', shiftId: '' }));
    setError('');

    if (newDate && dayjs(newDate).isValid()) {
      const matching = allShifts.filter((s) => isShiftOnDate(s, newDate));
      if (matching.length > 0) {
        // Automatically select the shift on that date so it shows in the shift input
        setShiftId(getShiftId(matching[0]));
      } else {
        setShiftId('');
      }

      // Automatically open the shift dropdown once date is picked
      setTimeout(() => {
        setShiftDropdownOpen(true);
      }, 100);
    } else {
      setShiftId('');
      setShiftDropdownOpen(false);
    }
  };

  const handleShiftChange = (event) => {
    setShiftId(String(event.target.value));
    setShiftDropdownOpen(false);
    setFieldErrors((prev) => ({ ...prev, shiftId: '' }));
    setError('');
  };

  const handleReasonChange = (event) => {
    setReason(event.target.value);
    setFieldErrors((prev) => ({ ...prev, reason: '' }));
    setError('');
  };

  const handleSubmit = async () => {
    const isDateValid = startDate && dayjs(startDate).isValid();

    let shiftError = '';
    if (!isDateValid) {
      shiftError = '';
    } else if (shiftsOnSelectedDate.length === 0) {
      shiftError = 'No shift is scheduled on this date to report sickness against.';
    } else if (!shiftId) {
      shiftError = 'Please select the shift you are reporting sick for.';
    }

    const nextErrors = {
      startDate: isDateValid ? '' : 'Please select a start date.',
      shiftId: shiftError,
      reason: reason.trim() ? '' : 'Reason is required.',
    };

    if (Object.values(nextErrors).some(Boolean)) {
      setFieldErrors(nextErrors);
      setError('');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        startDate: dayjs(startDate).format('YYYY-MM-DD'),
        shiftId,
        reason: reason.trim(),
      });
      onClose();
    } catch (submitError) {
      setError(
        submitError?.data?.message ||
          submitError?.message ||
          'Unable to report sickness. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isShiftDisabled = !startDate || isShiftsLoading;

  const shiftHelperText = (() => {
    if (fieldErrors.shiftId) return fieldErrors.shiftId;
    if (!startDate) return 'Select a start date above to view scheduled shifts.';
    if (isShiftsLoading) return 'Loading scheduled shifts for this date...';
    if (shiftsOnSelectedDate.length === 0) return 'No shifts scheduled on this date.';
    return 'Select the scheduled shift affected by this sickness';
  })();

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Report Sickness</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Notify your management team of sickness absence for a scheduled shift.
          </Typography>

          <DatePicker
            label="Start date"
            value={startDate}
            onChange={handleDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                error: Boolean(fieldErrors.startDate),
                helperText: fieldErrors.startDate || 'The date your sickness absence begins',
              },
            }}
          />

          <TextField
            select
            label="Shift"
            required
            InputLabelProps={{ shrink: true }}
            error={Boolean(fieldErrors.shiftId)}
            helperText={shiftHelperText}
            value={shiftId}
            onChange={handleShiftChange}
            fullWidth
            disabled={isShiftDisabled}
            SelectProps={{
              open: shiftDropdownOpen,
              onOpen: () => setShiftDropdownOpen(true),
              onClose: () => setShiftDropdownOpen(false),
              displayEmpty: true,
              renderValue: (selected) => {
                if (!selected) {
                  if (!startDate) {
                    return (
                      <Typography color="text.disabled" variant="body2">
                        Select a start date first
                      </Typography>
                    );
                  }
                  if (shiftsOnSelectedDate.length === 0) {
                    return (
                      <Typography color="text.secondary" variant="body2">
                        {`No scheduled shifts found for ${dayjs(startDate).format('DD MMM YYYY')}.`}
                      </Typography>
                    );
                  }
                  return (
                    <Typography color="text.disabled" variant="body2">
                      Select a shift
                    </Typography>
                  );
                }

                const selectedStr = String(selected);
                const shift =
                  allShifts.find((s) => getShiftId(s) === selectedStr) ||
                  shiftsOnSelectedDate.find((s) => getShiftId(s) === selectedStr);

                if (!shift) {
                  return (
                    <Typography color="text.disabled" variant="body2">
                      Select a shift
                    </Typography>
                  );
                }

                const startFormatted = fDateTime(shift.startsAt);
                const endFormatted = fDateTime(shift.endsAt);
                const branchName = shift.branch?.name ? `(${shift.branch.name})` : '';
                return endFormatted
                  ? `${startFormatted} - ${endFormatted} ${branchName}`.trim()
                  : `${startFormatted} ${branchName}`.trim();
              },
            }}
          >
            {shiftsOnSelectedDate.length === 0 ? (
              <MenuItem value="" disabled sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                {startDate
                  ? `No scheduled shifts found for ${dayjs(startDate).format('DD MMM YYYY')}.`
                  : 'Select a start date first'}
              </MenuItem>
            ) : (
              shiftsOnSelectedDate.map((shift) => {
                const sid = getShiftId(shift);
                const startFormatted = fDateTime(shift.startsAt);
                const endFormatted = fDateTime(shift.endsAt);
                const branchName = shift.branch?.name ? `(${shift.branch.name})` : '';
                const shiftLabel = endFormatted
                  ? `${startFormatted} - ${endFormatted} ${branchName}`.trim()
                  : `${startFormatted} ${branchName}`.trim();

                return (
                  <MenuItem key={sid} value={sid}>
                    {shiftLabel}
                  </MenuItem>
                );
              })
            )}
          </TextField>

          <TextField
            label="Reason"
            placeholder="e.g. Flu, fever, unwell, medical appointment..."
            value={reason}
            onChange={handleReasonChange}
            required
            error={Boolean(fieldErrors.reason)}
            helperText={fieldErrors.reason}
            multiline
            minRows={3}
            fullWidth
          />

          {error && <FormHelperText error>{error}</FormHelperText>}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <LoadingButton
          color="error"
          variant="contained"
          onClick={handleSubmit}
          loading={isSubmitting}
        >
          Report Sickness
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

StaffReportSicknessDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};
