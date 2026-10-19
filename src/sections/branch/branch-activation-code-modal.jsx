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

import { useCreateBranchActivationCodeMutation } from 'src/store/Reducer/branches-api';

// ----------------------------------------------------------------------

const MAX_EXPIRES_IN_HOURS = 120;

function getLastExpiresInHours(branch) {
  const activationCode = branch?.activationCode;
  if (!activationCode?.expiresAt || !activationCode?.createdAt) {
    return '';
  }

  const createdAt = new Date(activationCode.createdAt).getTime();
  const expiresAt = new Date(activationCode.expiresAt).getTime();

  if (!Number.isFinite(createdAt) || !Number.isFinite(expiresAt) || expiresAt <= createdAt) {
    return '';
  }

  const hours = Math.round((expiresAt - createdAt) / (1000 * 60 * 60));
  if (hours < 1) {
    return '';
  }

  return String(Math.min(hours, MAX_EXPIRES_IN_HOURS));
}

const ActivationCodeSchema = zod.object({
  expiresInHours: zod
    .string()
    .trim()
    .min(1, { message: 'Expires in hours is required!' })
    .regex(/^\d+$/, { message: 'Expires in hours must be a number.' })
    .refine((value) => Number(value) >= 1, { message: 'Expires in hours must be at least 1.' })
    .refine((value) => Number(value) <= MAX_EXPIRES_IN_HOURS, {
      message: `Expires in hours cannot be more than ${MAX_EXPIRES_IN_HOURS}.`,
    }),
});

// ----------------------------------------------------------------------

export function BranchActivationCodeModal({ open, onClose, branch, organizationId }) {
  const [createActivationCode, { isLoading }] = useCreateBranchActivationCodeMutation();

  const defaultValues = useMemo(
    () => ({ expiresInHours: getLastExpiresInHours(branch) }),
    [branch]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(ActivationCodeSchema),
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
      const response = await createActivationCode({
        branchId: branch._id,
        organizationId,
        expiresInHours: Number(data.expiresInHours),
      }).unwrap();

      toast.success(response?.message || 'Activation code created successfully!');
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
        <DialogTitle sx={{ pb: 1 }}>Generate Activation Code</DialogTitle>

        <DialogContent>
          {branch?.name && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              {branch.name}
            </Typography>
          )}

          <Box sx={{ pt: 1 }}>
            <Field.Text
              name="expiresInHours"
              label="Expires in hours"
              helperText={`Maximum ${MAX_EXPIRES_IN_HOURS} hours`}
              inputProps={{
                inputMode: 'numeric',
                maxLength: 3,
                pattern: '[0-9]*',
                autoComplete: 'off',
              }}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, '').slice(0, 3);
                const nextValue =
                  digits && Number(digits) > MAX_EXPIRES_IN_HOURS ? String(MAX_EXPIRES_IN_HOURS) : digits;
                methods.setValue('expiresInHours', nextValue, { shouldDirty: true, shouldValidate: true });
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
            Generate
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
