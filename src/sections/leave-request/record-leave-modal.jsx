import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { z as zod } from 'zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import LoadingButton from '@mui/lab/LoadingButton';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetStaffProfilesQuery } from 'src/store/Reducer/staff-profiles-api';
import { useRecordLeaveRequestMutation } from 'src/store/Reducer/leave-requests-api';

// ----------------------------------------------------------------------

const LEAVE_TYPE_RECORD_OPTIONS = [
  { value: 'sick', label: 'Sickness' },
  { value: 'absence', label: 'Time Off / Absence' },
];

const mapBranchOption = (branch) => ({
  value: branch._id || branch.id,
  label: branch.name,
});

const mapStaffOption = (staff) => {
  const name =
    staff.userId?.name ||
    staff.user?.name ||
    staff.employeeCode ||
    staff.name ||
    staff._id;
  const email = staff.userId?.email || staff.user?.email || staff.email || '';
  return {
    value: staff._id || staff.id,
    label: email ? `${name} (${email})` : name,
    name,
    email,
  };
};

const RecordLeaveSchema = zod.object({
  branchId: zod
    .object({ value: zod.string(), label: zod.string() })
    .nullable()
    .refine((val) => Boolean(val?.value), { message: 'Site is required' }),
  staffId: zod
    .object({ value: zod.string(), label: zod.string() })
    .nullable()
    .refine((val) => Boolean(val?.value), { message: 'Staff member is required' }),
  leaveType: zod.enum(['sick', 'absence'], { required_error: 'Leave type is required' }),
  totalDays: zod.coerce
    .number({ invalid_type_error: 'Total days must be a number' })
    .min(0.5, 'Total days must be at least 0.5'),
  reason: zod.string().optional(),
});

// ----------------------------------------------------------------------

export function RecordLeaveModal({
  open,
  onClose,
  organizationId,
  defaultBranchId,
  defaultBranchName,
  ownerDashboard = false,
  onSuccess,
}) {
  const [recordLeaveRequest, { isLoading: isRecording }] = useRecordLeaveRequestMutation();
  const {
    data: branchesData,
    isFetching: isBranchesFetching,
  } = useGetBranchesQuery(
    { organizationId, page: 1, limit: 1000 },
    {
      skip:
        ownerDashboard ||
        !open ||
        !organizationId ||
        !defaultBranchId ||
        Boolean(defaultBranchName),
    }
  );

  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [dateError, setDateError] = useState('');

  const resolvedBranchName =
    defaultBranchName ||
    branchesData?.data?.find((branch) => (branch._id || branch.id) === defaultBranchId)?.name;

  const defaultBranchOption = useMemo(() => {
    if (!ownerDashboard && defaultBranchId) {
      return {
        value: defaultBranchId,
        label: defaultBranchName || 'Loading site...',
      };
    }
    return null;
  }, [ownerDashboard, defaultBranchId, defaultBranchName]);

  const defaultValues = useMemo(
    () => ({
      branchId: defaultBranchOption,
      staffId: null,
      leaveType: 'sick',
      totalDays: 1,
      reason: '',
    }),
    [defaultBranchOption]
  );

  const methods = useForm({
    resolver: zodResolver(RecordLeaveSchema),
    defaultValues,
  });

  const selectedBranch = useWatch({ control: methods.control, name: 'branchId' });
  const selectedBranchId = selectedBranch?.value;

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      methods.reset(defaultValues);
      const now = dayjs();
      setStartDate(now);
      setEndDate(now);
      setDateError('');
    }
  }, [open, defaultValues, methods, organizationId]);

  useEffect(() => {
    if (ownerDashboard || !open || !defaultBranchId || isBranchesFetching) return;

    methods.setValue('branchId', {
      value: defaultBranchId,
      label: resolvedBranchName || 'Site name unavailable',
    });
  }, [
    defaultBranchId,
    isBranchesFetching,
    methods,
    open,
    ownerDashboard,
    resolvedBranchName,
  ]);

  const updateTotalDays = (nextStartDate, nextEndDate) => {
    if (!nextStartDate?.isValid() || !nextEndDate?.isValid()) {
      methods.setValue('totalDays', 0);
      return;
    }

    const days = nextEndDate.startOf('day').diff(nextStartDate.startOf('day'), 'day');
    if (days < 0) {
      setDateError('End date cannot be earlier than start date');
      methods.setValue('totalDays', 0);
      return;
    }

    methods.setValue('totalDays', days + 1);
  };

  const handleStartDateChange = (val) => {
    setStartDate(val);
    setDateError('');
    updateTotalDays(val, endDate);
  };

  const handleEndDateChange = (val) => {
    setEndDate(val);
    setDateError('');
    updateTotalDays(startDate, val);
  };

  const handleClose = () => {
    onClose();
    methods.reset(defaultValues);
    setDateError('');
  };

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!startDate || !endDate) {
      setDateError('Please select both start and end dates');
      return;
    }
    if (endDate.diff(startDate, 'day') < 0) {
      setDateError('End date cannot be earlier than start date');
      return;
    }

    try {
      const payload = {
        organizationId,
        staffId: data.staffId?.value,
        leaveType: data.leaveType,
        startDate: `${startDate.format('YYYY-MM-DD')}T00:00:00.000Z`,
        endDate: `${endDate.format('YYYY-MM-DD')}T00:00:00.000Z`,
        totalDays: endDate.startOf('day').diff(startDate.startOf('day'), 'day') + 1,
        reason: data.reason?.trim() || undefined,
      };

      const res = await recordLeaveRequest(payload).unwrap();
      toast.success(res?.message || 'Leave recorded successfully.');
      onSuccess?.(res?.data || res);
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Failed to record leave.');
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 0 }}>Add Leave</DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2.5, width: 1 }}>
            {/* 1. Site / Branch Selection */}
            <Field.InfiniteAutocomplete
              name="branchId"
              label="Site"
              placeholder="Search site..."
              useQuery={useGetBranchesQuery}
              queryArgs={{ organizationId, page: 1, limit: 100 }}
              mapOption={mapBranchOption}
              enabled={open && Boolean(organizationId) && ownerDashboard}
              disabled={!ownerDashboard}
              helperText={!ownerDashboard ? 'Locked to your current site' : undefined}
              onChange={(newValue) => {
                methods.setValue('branchId', newValue);
                methods.setValue('staffId', null);
              }}
            />

            {/* 2. Staff Member Selection */}
            <Field.InfiniteAutocomplete
              key={`${organizationId || 'no-organization'}-${selectedBranchId || 'no-site'}`}
              name="staffId"
              label="Staff member"
              placeholder={selectedBranchId ? 'Search staff...' : 'Select site first...'}
              useQuery={useGetStaffProfilesQuery}
              queryArgs={{
                organizationId,
                branchId: selectedBranchId,
                page: 1,
                limit: 100,
              }}
              mapOption={mapStaffOption}
              renderOption={(props, option) => (
                <li {...props} key={option.value}>
                  <Typography variant="body2">
                    <Box component="span" sx={{ textTransform: 'capitalize' }}>
                      {option.name}
                    </Box>
                    {option.email ? (
                      <>
                        {' ('}
                        <Box component="span" sx={{ textTransform: 'none' }}>
                          {option.email}
                        </Box>
                        {')'}
                      </>
                    ) : null}
                  </Typography>
                </li>
              )}
              enabled={open && Boolean(organizationId) && Boolean(selectedBranchId)}
              disabled={!selectedBranchId}
              helperText={
                !selectedBranchId && ownerDashboard
                  ? 'Please select a site to load staff members'
                  : 'Required'
              }
            />

            {/* 3. Leave Type */}
            <Field.Select name="leaveType" label="Leave Type" fullWidth>
              {LEAVE_TYPE_RECORD_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Field.Select>

            {/* 4. Dates: Start Date & End Date */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={handleStartDateChange}
                slotProps={{ textField: { fullWidth: true, size: 'medium' } }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={handleEndDateChange}
                slotProps={{ textField: { fullWidth: true, size: 'medium' } }}
              />
            </Stack>

            {dateError && (
              <Typography variant="caption" sx={{ color: 'error.main', mt: -1.5 }}>
                {dateError}
              </Typography>
            )}

            {/* 5. Total Days */}
            <Field.Text
              name="totalDays"
              label="Total Days"
              type="number"
              inputProps={{ min: 1, step: 1, readOnly: true }}
              fullWidth
            />

            {/* 6. Reason */}
            <Field.Text
              name="reason"
              label="Reason (optional)"
              placeholder="e.g. Flu, Medical appointment, Family emergency"
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={methods.formState.isSubmitting || isRecording}
          >
            Add Leave
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

RecordLeaveModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  organizationId: PropTypes.string,
  defaultBranchId: PropTypes.string,
  defaultBranchName: PropTypes.string,
  ownerDashboard: PropTypes.bool,
  onSuccess: PropTypes.func,
};
