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
import { useBookSupervisionMutation } from 'src/store/Reducer/supervision-api';

// ----------------------------------------------------------------------

function mapStaffOption(item) {
  const name =
    item?.userId?.name ||
    item?.user?.name ||
    item?.name ||
    item?.employeeCode ||
    item?._id;
  const email = item?.userId?.email || item?.user?.email || item?.email || '';
  const label = email ? `${name} (${email})` : name;
  return {
    value: item?._id,
    label,
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

  const today = dayjs().startOf('day');

  const queryArgs = useMemo(() => ({ organizationId }), [organizationId]);

  useEffect(() => {
    if (open) {
      if (row) {
        setSelectedStaff({
          value: row._id || row.id,
          label: row.name || row.employeeCode || row.id,
          raw: row,
        });
      } else {
        setSelectedStaff(null);
      }
      setScheduledDateTime(dayjs());
      setLocationLabel('Office');
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

      const res = await bookSupervision(payload).unwrap();

      const message = res?.message || res?.msg || 'Supervision saved';
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
      console.error('Book supervision error:', err);
      const errorMessage =
        err?.data?.message || err?.data?.msg || err?.message || 'Failed to book supervision session';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">Book session</Typography>
          {selectedStaff && (
            <Typography variant="caption" color="text.secondary">
              {selectedStaff.label}
            </Typography>
          )}
        </Stack>
        <IconButton onClick={onClose} size="small" disabled={isBooking}>
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
            onChange={(event, newValue) => setSelectedStaff(newValue)}
            useQuery={useGetStaffProfilesQuery}
            queryArgs={queryArgs}
            mapOption={mapStaffOption}
            enabled={open}
            disabled={isBooking}
          />

          {/* Scheduled Date and Time */}
          <MobileDateTimePicker
            label="Scheduled date & time"
            value={scheduledDateTime}
            minDate={today}
            disabled={isBooking}
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
            disabled={isBooking}
            onChange={(e) => setLocationLabel(e.target.value)}
            placeholder="Office"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose} disabled={isBooking}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          color="primary"
          onClick={handleSave}
          loading={isBooking}
        >
          Book session
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