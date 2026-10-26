import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { useGetStaffProfilesQuery } from 'src/store/Reducer/staff-profiles-api';
import { useBookSupervisionMutation, useRescheduleSupervisionMutation } from 'src/store/Reducer/supervision-api';

// ----------------------------------------------------------------------

function mapStaffOption(item) {
  const name =
    item?.user?.name ||
    item?.userId?.name ||
    item?.name ||
    item?.employeeCode ||
    item?._id;
  const email = item?.user?.email || item?.userId?.email || item?.email || '';
  const label = email ? `${name} (${email})` : name;
  return {
    value: item?._id,
    label,
    name,
    email,
    raw: item,
  };
}

// ----------------------------------------------------------------------

function LogSessionDialog({ open, row, organizationId, onClose, onSave }) {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [scheduledDateTime, setScheduledDateTime] = useState(dayjs());
  const [locationLabel, setLocationLabel] = useState('Office');
  const [error, setError] = useState('');

  const [bookSupervision, { isLoading: isBooking }] = useBookSupervisionMutation();
  const [rescheduleSupervision, { isLoading: isRescheduling }] = useRescheduleSupervisionMutation();
  const isSubmitting = isBooking || isRescheduling;

  const today = dayjs().startOf('day');

  // Determine if this is a reschedule action for an existing supervision
  const existingSupervisionId = row?.upcoming?._id || row?.supervisionId || (row?.status === 'scheduled' ? row?._id : null);
  const isReschedule = Boolean(existingSupervisionId);

  const queryArgs = useMemo(
    () => ({ organizationId, role: 'staff' }),
    [organizationId]
  );

  useEffect(() => {
    if (open) {
      if (row) {
        const staffObj =
          (typeof row.staff === 'object' ? row.staff : null) ||
          (typeof row.staffProfile === 'object' ? row.staffProfile : null) ||
          (typeof row.staffId === 'object' ? row.staffId : null) ||
          (typeof row.user === 'object' ? row.user : null) ||
          (typeof row.userId === 'object' ? row.userId : null) ||
          {};

        const staffUser =
          (typeof staffObj.user === 'object' ? staffObj.user : null) ||
          (typeof staffObj.userId === 'object' ? staffObj.userId : null) ||
          {};

        const staffId =
          (typeof row.staffId === 'string' ? row.staffId : null) ||
          staffObj._id ||
          staffObj.id ||
          row._id ||
          row.id;

        const isMongoId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);

        const rawStaffName =
          row.name ||
          row.staffName ||
          staffObj.name ||
          staffUser.name ||
          (typeof row.userId === 'object' ? row.userId?.name : null) ||
          (typeof row.user === 'object' ? row.user?.name : null);

        const staffName =
          rawStaffName && !isMongoId(rawStaffName)
            ? rawStaffName
            : staffObj.employeeCode || row.employeeCode || staffId;

        const staffEmail =
          staffObj.email ||
          staffUser.email ||
          row.email ||
          '';

        const label = staffEmail ? `${staffName} (${staffEmail})` : staffName;

        setSelectedStaff({
          value: staffId,
          label,
          name: staffName,
          email: staffEmail,
          raw: row,
        });

        const scheduledTime = row.upcoming?.scheduledAt || row.nextDueAt || row.scheduledAt;
        if (scheduledTime) {
          const parsed = dayjs(scheduledTime);
          if (parsed.isValid()) {
            setScheduledDateTime(parsed);
          } else {
            setScheduledDateTime(dayjs());
          }
        } else {
          setScheduledDateTime(dayjs());
        }

        if (row.upcoming?.locationLabel || row.locationLabel) {
          setLocationLabel(row.upcoming?.locationLabel || row.locationLabel);
        } else {
          setLocationLabel('Office');
        }
      } else {
        setSelectedStaff(null);
        setScheduledDateTime(dayjs());
        setLocationLabel('Office');
      }
      setError('');
    }
  }, [open, row]);

  const handleSave = async () => {
    const staffId = selectedStaff?.value;
    if (!staffId) {
      setError('Please select a staff member');
      return;
    }
    if (!scheduledDateTime || !scheduledDateTime.isValid()) {
      setError('Please select a valid scheduled date and time');
      return;
    }
    if (scheduledDateTime.isBefore(today)) {
      setError('Scheduled date must be today or an upcoming date');
      return;
    }

    try {
      const payload = {
        organizationId,
        staffId,
        status: 'scheduled',
        scheduledAt: scheduledDateTime.toISOString(),
        locationLabel: locationLabel.trim() || 'Office',
      };

      let res;
      if (isReschedule) {
        res = await rescheduleSupervision({
          organizationId,
          supervisionId: existingSupervisionId,
          ...payload,
        }).unwrap();
      } else {
        res = await bookSupervision(payload).unwrap();
      }

      const message =
        res?.message ||
        res?.msg ||
        (isReschedule ? 'Supervision rescheduled successfully' : 'Supervision booked successfully');
      toast.success(message);

      onSave?.({
        staffId,
        staffName: selectedStaff?.label,
        scheduledDateTime,
        dateHeld: scheduledDateTime,
        nextDue: scheduledDateTime,
        data: res?.data || res,
      });

      onClose();
    } catch (err) {
      console.error('Supervision save error:', err);
      const errorMessage =
        err?.data?.message || err?.data?.msg || err?.message || 'Failed to save supervision session';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1">
          {isReschedule ? 'Reschedule supervision' : 'Book supervision'}
        </Typography>
        <IconButton onClick={onClose} size="small" disabled={isSubmitting}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Staff Member Selection via InfiniteAutocomplete */}
          <InfiniteAutocomplete
            label="Staff member"
            placeholder="Search staff..."
            value={selectedStaff}
            onChange={(newValue) => setSelectedStaff(newValue)}
            useQuery={useGetStaffProfilesQuery}
            queryArgs={queryArgs}
            mapOption={mapStaffOption}
            enabled={open}
            disabled={isSubmitting}
            renderOption={(props, option) => (
              <li {...props} key={option.value}>
                {option.email ? (
                  <Stack sx={{ typography: 'body2' }}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                      {option.name || option.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'none' }}>
                      {option.email}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ textTransform: 'none' }}>
                    {option.label}
                  </Typography>
                )}
              </li>
            )}
          />

          {/* Scheduled Date and Time */}
          <MobileDateTimePicker
            label="Scheduled date & time"
            value={scheduledDateTime}
            minDate={today}
            disabled={isSubmitting}
            onChange={(newVal) => setScheduledDateTime(newVal)}
            slotProps={{
              textField: {
                fullWidth: true,
                helperText: "Only today's and upcoming dates can be selected.",
              },
            }}
          />

          {/* Location */}
          <TextField
            fullWidth
            label="Location"
            value={locationLabel}
            disabled={isSubmitting}
            onChange={(e) => setLocationLabel(e.target.value)}
            placeholder="Office"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          color="primary"
          onClick={handleSave}
          loading={isSubmitting}
        >
          {isReschedule ? 'Reschedule' : 'Book supervision'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default LogSessionDialog;

LogSessionDialog.propTypes = {
  open: PropTypes.bool,
  row: PropTypes.object,
  organizationId: PropTypes.string,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
};