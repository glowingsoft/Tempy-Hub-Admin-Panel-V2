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
import Typography from '@mui/material/Typography';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { useUpdateBranchMutation } from 'src/store/Reducer/branches-api';

// ----------------------------------------------------------------------

const EmergencyPinSchema = zod.object({
  emergencyPin: zod
    .string()
    .trim()
    .min(1, { message: 'Emergency PIN is required!' })
    .regex(/^\d{6}$/, { message: 'Emergency PIN must be 6 digits.' }),
});

// ----------------------------------------------------------------------

export function BranchEmergencyPinModal({ open, onClose, branch, organizationId }) {
  const [updateBranch, { isLoading }] = useUpdateBranchMutation();

  const defaultValues = useMemo(
    () => ({
      emergencyPin: branch?.emergencyPin ? String(branch.emergencyPin) : '',
    }),
    [branch]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(EmergencyPinSchema),
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
      await updateBranch({
        branchId: branch._id,
        organizationId,
        emergencyPin: data.emergencyPin.trim(),
      }).unwrap();

      toast.success('Emergency PIN updated successfully!');
      handleClose();
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.error ||
        error?.message ||
        'Something went wrong. Please try again.';
      toast.error(errorMessage);
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 1 }}>Set Emergency PIN</DialogTitle>

        <DialogContent>
          {branch?.name && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              {branch.name}
            </Typography>
          )}

          <Box sx={{ pt: 1 }}>
            <Field.Text
              name="emergencyPin"
              label="Emergency PIN"
              placeholder="334821"
              inputProps={{
                inputMode: 'numeric',
                maxLength: 6,
                pattern: '[0-9]*',
                autoComplete: 'off',
              }}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, '').slice(0, 6);
                methods.setValue('emergencyPin', digits, { shouldDirty: true, shouldValidate: true });
              }}
              onKeyDown={(event) => {
                if (event.key.length === 1 && !/[0-9]/.test(event.key) && !event.ctrlKey && !event.metaKey) {
                  event.preventDefault();
                }
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
            loading={methods.formState.isSubmitting || isLoading}
          >
            Save PIN
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
