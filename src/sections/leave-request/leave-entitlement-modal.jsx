import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { useGetStaffProfilesQuery } from 'src/store/Reducer/staff-profiles-api';
import { useSetLeaveEntitlementMutation } from 'src/store/Reducer/leave-requests-api';
import {
  LEAVE_TYPE_OPTIONS,
  LEAVE_ENTITLEMENT_YEAR_OPTIONS,
} from './mocks/data';

// ----------------------------------------------------------------------

const LeaveEntitlementSchema = zod.object({
  staffId: zod.string().min(1, 'Staff is required'),
  year: zod.string().min(1, 'Year is required'),
  leaveType: zod.string().min(1, 'Leave type is required'),
  entitlementDays: zod.coerce
    .number({ invalid_type_error: 'Entitlement days must be a number' })
    .min(0, 'Entitlement days cannot be negative')
    .max(366, 'Entitlement days looks too large'),
});

// ----------------------------------------------------------------------

// `organizationId` comes from the authenticated owner (set on the user at login),
// not from a form field.
export function LeaveEntitlementModal({ open, onClose, organizationId, initialStaffId, onSuccess }) {
  const [setLeaveEntitlement, { isLoading: isSubmittingEntitlement }] = useSetLeaveEntitlementMutation();

  const { data: staffData } = useGetStaffProfilesQuery(
    { organizationId, limit: 100 },
    { skip: !organizationId || !open }
  );

  const staffProfiles = useMemo(() => staffData?.data || [], [staffData]);

  const resolvedStaffId = useMemo(() => {
    if (!initialStaffId) return '';
    const match = staffProfiles.find(
      (p) =>
        p._id === initialStaffId ||
        p.userId?._id === initialStaffId ||
        p.user?._id === initialStaffId ||
        p.staffId === initialStaffId
    );
    return match ? match._id : initialStaffId;
  }, [initialStaffId, staffProfiles]);

  const staffOptions = useMemo(
    () =>
      staffProfiles.map((p) => {
        const name = p.userId?.name || p.user?.name || p.employeeCode || p._id;
        const email = p.userId?.email || p.user?.email || '';
        return {
          value: p._id,
          name,
          email,
          label: email ? `${name} (${email})` : name,
        };
      }),
    [staffProfiles]
  );

  const defaultValues = useMemo(
    () => ({
      staffId: resolvedStaffId || '',
      year: LEAVE_ENTITLEMENT_YEAR_OPTIONS[1]?.value || LEAVE_ENTITLEMENT_YEAR_OPTIONS[0]?.value || '',
      leaveType: LEAVE_TYPE_OPTIONS[0]?.value || 'annual',
      entitlementDays: 24,
    }),
    [resolvedStaffId]
  );

  const methods = useForm({
    resolver: zodResolver(LeaveEntitlementSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      methods.reset({
        ...defaultValues,
        staffId: resolvedStaffId || '',
      });
    }
  }, [open, defaultValues, resolvedStaffId, methods]);

  const handleClose = () => {
    onClose();
    methods.reset(defaultValues);
  };

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      const payload = {
        organizationId,
        staffId: data.staffId,
        year: data.year,
        leaveType: data.leaveType,
        entitlementDays: Number(data.entitlementDays),
      };

      const res = await setLeaveEntitlement(payload).unwrap();

      onSuccess?.(res?.data || res);
      toast.success('Leave entitlement updated.');
      handleClose();
    } catch (error) {
      if (!error?.status) {
        toast.error(error?.message || 'Something went wrong. Please try again.');
      }
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 0 }}>Set Leave Entitlement</DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2.5, width: 1 }}>
            {/* 1. Staff (Disabled when pre-selected from Rota, original uncapitalized email) */}
            <Field.Select
              name="staffId"
              label="Staff"
              fullWidth
              disabled={Boolean(initialStaffId)}
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

            {/* 2. Year (100% width) */}
            <Field.Select name="year" label="Year" fullWidth>
              {LEAVE_ENTITLEMENT_YEAR_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            {/* 3. Leave Type (100% width) */}
            <Field.Select name="leaveType" label="Leave Type" fullWidth>
              {LEAVE_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            {/* 4. Entitlement Days (100% width) */}
            <Field.Text name="entitlementDays" label="Entitlement Days" type="number" fullWidth />
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
            loading={methods.formState.isSubmitting || isSubmittingEntitlement}
          >
            Save Entitlement
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
