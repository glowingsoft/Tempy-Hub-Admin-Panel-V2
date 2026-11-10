import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';

import { Field, Form } from 'src/components/hook-form';
import { useGetStaffProfilesQuery } from 'src/store/Reducer/staff-profiles-api';

// ----------------------------------------------------------------------

export const ShiftSchema = zod
  .object({
    branchId: zod.string().min(1, { message: 'Site is required!' }),
    staffId: zod.string().optional(),
    startsAt: zod
      .union([zod.string(), zod.null()])
      .refine((value) => Boolean(value && dayjs(value).isValid()), {
        message: 'Start date and time is required!',
      }),
    endsAt: zod
      .union([zod.string(), zod.null()])
      .refine((value) => Boolean(value && dayjs(value).isValid()), {
        message: 'End date and time is required!',
      }),
  })
  .refine(
    (values) => {
      if (!values.startsAt || !values.endsAt) return true;
      const start = dayjs(values.startsAt);
      const end = dayjs(values.endsAt);
      return start.isValid() && end.isValid() && end.isAfter(start);
    },
    { path: ['endsAt'], message: 'End date and time must be after the start!' }
  );

// ----------------------------------------------------------------------

function parseShiftInterval(shift, dateStr) {
  let start = null;
  let end = null;

  if (shift?.raw?.startsAt && dayjs(shift.raw.startsAt).isValid()) {
    start = dayjs(shift.raw.startsAt);
  } else if (shift?.startsAt && dayjs(shift.startsAt).isValid()) {
    start = dayjs(shift.startsAt);
  }

  if (shift?.raw?.endsAt && dayjs(shift.raw.endsAt).isValid()) {
    end = dayjs(shift.raw.endsAt);
  } else if (shift?.endsAt && dayjs(shift.endsAt).isValid()) {
    end = dayjs(shift.endsAt);
  }

  if (!start && shift?.start) {
    const s = dayjs(`${dateStr} ${shift.start}`);
    if (s.isValid()) start = s;
  }
  if (!end && shift?.end) {
    const e = dayjs(`${dateStr} ${shift.end}`);
    if (e.isValid()) end = e;
  }

  return {
    start,
    end,
    label: shift?.label || `${shift?.start || ''} – ${shift?.end || ''}`.trim(),
  };
}

// ----------------------------------------------------------------------

export default function RotaBookShiftDialog({
  open,
  onClose,
  cellData,
  organizationId,
  branchId: activeBranchId,
  selectedBranch,
  onSubmit,
}) {
  const staff = cellData?.staff;
  const day = cellData?.day;

  // Use selected branch directly from Rota view without making extra branches/job-titles/departments API calls
  const branchOptions = useMemo(() => {
    if (selectedBranch?.value) {
      return [selectedBranch];
    }
    if (activeBranchId) {
      return [{ value: activeBranchId, label: 'Current Site' }];
    }
    return [];
  }, [selectedBranch, activeBranchId]);

  // Only fetch staff profiles if modal is opened
  const { data: staffData } = useGetStaffProfilesQuery(
    { organizationId, limit: 100 },
    { skip: !organizationId || !open }
  );

  const staffProfiles = useMemo(() => staffData?.data || [], [staffData]);

  const staffOptions = useMemo(() => {
    const list = staffProfiles.map((p) => {
      const name = p.userId?.name || p.user?.name || p.employeeCode || p._id;
      const email = p.userId?.email || p.user?.email || '';
      return {
        value: p._id,
        name,
        email,
        label: email ? `${name} (${email})` : name,
      };
    });

    if (staff) {
      const match = list.find(
        (o) =>
          o.value === staff.id ||
          o.value === staff.staffId
      );
      if (!match) {
        list.unshift({
          value: staff.id || staff.staffId,
          name: staff.name,
          email: staff.email || '',
          label: staff.email ? `${staff.name} (${staff.email})` : staff.name,
        });
      }
    }

    return list;
  }, [staffProfiles, staff]);

  const resolvedStaffId = useMemo(() => {
    if (!staff) return '';
    const match = staffProfiles.find(
      (p) =>
        p._id === staff.id ||
        p._id === staff.staffId ||
        p.userId?._id === staff.id ||
        p.user?._id === staff.id ||
        p.staffId === staff.id
    );
    return match ? match._id : (staff.id || staff.staffId || '');
  }, [staff, staffProfiles]);

  const cellDate = useMemo(() => {
    if (day?.date && dayjs(day.date).isValid()) {
      return dayjs(day.date).format('YYYY-MM-DD');
    }
    return dayjs().format('YYYY-MM-DD');
  }, [day]);

  const existingShifts = useMemo(() => {
    return cellData?.shifts || (staff?.shifts?.[cellDate]) || [];
  }, [cellData?.shifts, staff, cellDate]);

  // Determine non-overlapping initial default start/end times on cellDate
  const defaultTimes = useMemo(() => {
    if (!existingShifts.length) {
      return {
        startsAt: dayjs(`${cellDate}T09:00:00`).format(),
        endsAt: dayjs(`${cellDate}T17:00:00`).format(),
      };
    }

    let latestEnd = null;
    existingShifts.forEach((s) => {
      const { end } = parseShiftInterval(s, cellDate);
      if (end && (!latestEnd || end.isAfter(latestEnd))) {
        latestEnd = end;
      }
    });

    if (latestEnd && latestEnd.isValid()) {
      const nextStart = latestEnd.add(1, 'hour');
      const nextEnd = nextStart.add(4, 'hour');
      if (nextStart.isSame(dayjs(cellDate), 'day')) {
        return {
          startsAt: nextStart.format(),
          endsAt: (nextEnd.isSame(dayjs(cellDate), 'day') ? nextEnd : dayjs(`${cellDate}T23:59:00`)).format(),
        };
      }
    }

    return {
      startsAt: dayjs(`${cellDate}T09:00:00`).format(),
      endsAt: dayjs(`${cellDate}T17:00:00`).format(),
    };
  }, [existingShifts, cellDate]);

  // Determine minDate so it doesn't flag clicked past cells as invalid, while preventing selection of dates before cell
  const minAllowedDate = useMemo(() => {
    if (cellDate && dayjs(cellDate).isValid() && dayjs(cellDate).isBefore(dayjs().startOf('day'))) {
      return dayjs(cellDate).startOf('day');
    }
    return dayjs().startOf('day');
  }, [cellDate]);

  const defaultValues = useMemo(() => {
    return {
      branchId: activeBranchId || branchOptions[0]?.value || '',
      staffId: resolvedStaffId || '',
      startsAt: defaultTimes.startsAt,
      endsAt: defaultTimes.endsAt,
    };
  }, [activeBranchId, branchOptions, resolvedStaffId, defaultTimes]);

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(ShiftSchema),
    defaultValues,
  });

  const startsAtValue = methods.watch('startsAt');

  useEffect(() => {
    if (open) {
      methods.reset({
        branchId: activeBranchId || branchOptions[0]?.value || '',
        staffId: resolvedStaffId || '',
        startsAt: defaultTimes.startsAt,
        endsAt: defaultTimes.endsAt,
      });
    }
  }, [open, activeBranchId, branchOptions, resolvedStaffId, defaultTimes, methods]);

  const handleClose = () => {
    onClose();
    methods.reset(defaultValues);
  };

  const onFormSubmit = methods.handleSubmit(async (data) => {
    const start = dayjs(data.startsAt);
    const end = dayjs(data.endsAt);

    // Overlap validation for the same staff member
    if (existingShifts.length > 0) {
      const conflict = existingShifts.find((s) => {
        const { start: existStart, end: existEnd } = parseShiftInterval(s, cellDate);
        if (!existStart || !existEnd) return false;
        return start.isBefore(existEnd) && end.isAfter(existStart);
      });

      if (conflict) {
        const { label } = parseShiftInterval(conflict, cellDate);
        methods.setError('endsAt', {
          type: 'manual',
          message: `Shift time overlaps with an existing shift (${label || 'scheduled'}) for this staff member.`,
        });
        return;
      }
    }

    const payload = {
      branchId: data.branchId,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      ...(data.staffId ? { staffId: data.staffId } : {}),
    };

    await onSubmit(payload);
    handleClose();
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onFormSubmit}>
        <DialogTitle sx={{ pb: 0 }}>Shift details</DialogTitle>

        <DialogContent>
          {/* 4 Inputs stacked 100% width each */}
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              width: 1,
            }}
          >
            {/* 1. Site (100% width) */}
            <Field.Select
              name="branchId"
              label="Site"
              fullWidth
              SelectProps={{ sx: { textTransform: 'capitalize' } }}
            >
              {branchOptions.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ textTransform: 'capitalize' }}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            {/* 2. Staff (100% width, required, disabled when adding shift for selected staff, exact email casing) */}
            <Field.Select
              name="staffId"
              label="Staff"
              fullWidth
              disabled={Boolean(staff)}
              SelectProps={{
                renderValue: (selectedId) => {
                  const opt = staffOptions.find((o) => o.value === selectedId);
                  if (!opt) return '';
                  return (
                    <Box component="span">
                      <Box component="span" sx={{ textTransform: 'capitalize' }}>
                        {opt.name}
                      </Box>
                      {opt.email ? (
                        <Box component="span" sx={{ textTransform: 'none', color: 'text.secondary' }}>
                          {` (${opt.email})`}
                        </Box>
                      ) : null}
                    </Box>
                  );
                },
              }}
            >
              {staffOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box component="span" sx={{ textTransform: 'capitalize' }}>
                    {option.name}
                  </Box>
                  {option.email ? (
                    <Box component="span" sx={{ textTransform: 'none', color: 'text.secondary' }}>
                      {` (${option.email})`}
                    </Box>
                  ) : null}
                </MenuItem>
              ))}
            </Field.Select>

            {/* 3. Start date & time (100% width, clean without disablePast so morning hours do not turn red) */}
            <Field.MobileDateTimePicker
              name="startsAt"
              label="Start date & time"
              minDate={minAllowedDate}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />

            {/* 4. End date & time (100% width) */}
            <Field.MobileDateTimePicker
              name="endsAt"
              label="End date & time"
              minDate={
                startsAtValue && dayjs(startsAtValue).isValid()
                  ? dayjs(startsAtValue)
                  : minAllowedDate
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="primary" onClick={handleClose}>
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={methods.formState.isSubmitting}
          >
            Create Shift
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

RotaBookShiftDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  cellData: PropTypes.object,
  organizationId: PropTypes.string,
  branchId: PropTypes.string,
  selectedBranch: PropTypes.object,
  onSubmit: PropTypes.func,
};
