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

import { mockStaffProfiles } from 'src/sections/staff-profile/mocks/data';

// import { useSetLeaveEntitlementMutation } from 'src/store/Reducer/leave-requests-api';
import {
  LEAVE_TYPE_OPTIONS,
  LEAVE_ENTITLEMENT_YEAR_OPTIONS,
  setMockLeaveEntitlement,
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
export function LeaveEntitlementModal({ open, onClose, organizationId, onSuccess }) {
  const staffOptions = useMemo(
    () =>
      mockStaffProfiles
        .filter((profile) => !organizationId || profile.organizationId === organizationId)
        .map((profile) => ({
          value: profile._id,
          label: profile.user?.name || profile.user?.email || profile._id,
        })),
    [organizationId]
  );

  const defaultValues = useMemo(
    () => ({
      staffId: '',
      year: LEAVE_ENTITLEMENT_YEAR_OPTIONS[1]?.value || LEAVE_ENTITLEMENT_YEAR_OPTIONS[0]?.value || '',
      leaveType: LEAVE_TYPE_OPTIONS[0]?.value || 'annual',
      entitlementDays: 24,
    }),
    []
  );

  const methods = useForm({
    resolver: zodResolver(LeaveEntitlementSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      methods.reset(defaultValues);
    }
  }, [open, defaultValues, methods]);

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
        entitlementDays: data.entitlementDays,
      };

      // TODO: replace with the real mutation once the endpoint is wired up.
      // await setLeaveEntitlement(payload).unwrap();

      const entitlement = setMockLeaveEntitlement(payload);
      onSuccess?.(entitlement);
      toast.success('Leave entitlement updated.');
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Something went wrong. Please try again.');
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 0 }}>Set Leave Entitlement</DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 3, gap: 2, display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)' }}>
            <Field.Select name="staffId" label="Staff">
              {staffOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="year" label="Year">
              {LEAVE_ENTITLEMENT_YEAR_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="leaveType" label="Leave Type">
              {LEAVE_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Text name="entitlementDays" label="Entitlement Days" type="number" />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={methods.formState.isSubmitting}
          >
            Save Entitlement
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
