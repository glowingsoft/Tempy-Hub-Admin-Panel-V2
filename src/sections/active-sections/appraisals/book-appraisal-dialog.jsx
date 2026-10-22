import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
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
import { useBookAppraisalMutation } from 'src/store/Reducer/appraisals-api';

// ----------------------------------------------------------------------

export const AppraisalKind = {
  ANNUAL: 'annual',
  OTHER: 'other',
};

const KIND_OPTIONS = [
  { value: AppraisalKind.ANNUAL, label: 'Annual' },
  { value: AppraisalKind.OTHER, label: 'Other' },
];

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

export function BookAppraisalDialog({ open, row, organizationId, branchId, onClose, onSave }) {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [scheduledDateTime, setScheduledDateTime] = useState(dayjs());
  const [kind, setKind] = useState('annual');
  const [periodLabel, setPeriodLabel] = useState(`Annual Review ${new Date().getFullYear()}`);
  const [error, setError] = useState('');

  const [bookAppraisal, { isLoading: isBooking }] = useBookAppraisalMutation();

  const today = dayjs().startOf('day');

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
      } else {
        setSelectedStaff(null);
      }
      setScheduledDateTime(dayjs());
      setKind('annual');
      setPeriodLabel(`Annual Review ${new Date().getFullYear()}`);
      setError('');
    }
  }, [open, row]);

  const handleKindChange = (event) => {
    const nextKind = event.target.value;
    setKind(nextKind);
    const year = scheduledDateTime?.isValid() ? scheduledDateTime.year() : new Date().getFullYear();
    if (nextKind === AppraisalKind.ANNUAL) {
      setPeriodLabel(`Annual Review ${year}`);
    } else {
      setPeriodLabel(`Other Review ${year}`);
    }
  };

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

    setError('');

    try {
      const payload = {
        organizationId,
        staffId,
        kind,
        status: 'scheduled',
        scheduledAt: scheduledDateTime.format('YYYY-MM-DDTHH:mm:ss'),
        periodLabel: periodLabel.trim() || `Annual Review ${new Date().getFullYear()}`,
      };

      const res = await bookAppraisal(payload).unwrap();

      const message = res?.message || res?.msg || 'Appraisal booked successfully';
      toast.success(message);

      onSave?.({
        staffId,
        staffName: selectedStaff?.label,
        kind,
        status: 'scheduled',
        scheduledAt: scheduledDateTime.toISOString(),
        periodLabel: payload.periodLabel,
        data: res?.data || res,
      });

      onClose();
    } catch (err) {
      console.error('Book appraisal error:', err);
      const errorMessage =
        err?.data?.message || err?.data?.msg || err?.message || 'Failed to book appraisal';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">Book Appraisal</Typography>
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
            onChange={(newValue) => setSelectedStaff(newValue)}
            useQuery={useGetStaffProfilesQuery}
            queryArgs={queryArgs}
            mapOption={mapStaffOption}
            enabled={open}
            disabled={isBooking}
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

          {/* Appraisal Kind */}
          <TextField
            select
            fullWidth
            label="Review Type"
            value={kind}
            disabled={isBooking}
            onChange={handleKindChange}
          >
            {KIND_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Period Label */}
          <TextField
            fullWidth
            label="Period Label"
            value={periodLabel}
            disabled={isBooking}
            onChange={(e) => setPeriodLabel(e.target.value)}
            placeholder="e.g. Annual Review 2026"
            helperText="Label representing this appraisal review period"
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
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} disabled={isBooking}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          color="primary"
          onClick={handleSave}
          loading={isBooking}
          startIcon={<Iconify icon="solar:calendar-add-bold" />}
        >
          Book Appraisal
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

BookAppraisalDialog.propTypes = {
  open: PropTypes.bool,
  row: PropTypes.object,
  organizationId: PropTypes.string,
  branchId: PropTypes.string,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
};

export default BookAppraisalDialog;