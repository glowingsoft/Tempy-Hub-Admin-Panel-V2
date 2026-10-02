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

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { useCreateOrganizationMutation, useUpdateOrganizationMutation } from 'src/store/Reducer/organizations-api';

// ----------------------------------------------------------------------

const makeOrganizationSchema = (isEdit) =>
  zod.object({
    name: zod.string().min(1, 'Organization name is required'),
    ownerName: isEdit
      ? zod.string().optional()
      : zod.string().min(1, 'Owner name is required'),
    ownerEmail: isEdit
      ? zod.string().optional()
      : zod
          .string()
          .min(1, 'Owner email is required')
          .email('Owner email must be a valid email address'),
    emergencyNotifyOffsite: zod.boolean(),
  });

// ----------------------------------------------------------------------

export function OrganizationCreateEditModal({ open, onClose, currentOrganization, onSuccess }) {
  const isEdit = !!currentOrganization;

  const defaultValues = useMemo(
    () => ({
      name: currentOrganization?.name || '',
      ownerName: currentOrganization?.owner?.name || '',
      ownerEmail: currentOrganization?.owner?.email || '',
      emergencyNotifyOffsite: currentOrganization?.settings?.emergencyNotifyOffsite ?? false,
    }),
    [currentOrganization]
  );

  const methods = useForm({
    resolver: zodResolver(makeOrganizationSchema(isEdit)),
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

  const [createOrganization, { isLoading: isCreating }] = useCreateOrganizationMutation();
  const [updateOrganization, { isLoading: isUpdating }] = useUpdateOrganizationMutation();

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      let response = null;
      if (isEdit) {
        const organizationId = currentOrganization?._id || currentOrganization?.id;
        const payload = {
          name: data.name,
          settings: {
            emergencyNotifyOffsite: data.emergencyNotifyOffsite,
          },
        };
        response = await updateOrganization({ organizationId, ...payload }).unwrap();
      } else {
        const payload = {
          name: data.name,
          ownerName: data.ownerName,
          ownerEmail: data.ownerEmail,
          settings: {
            emergencyNotifyOffsite: data.emergencyNotifyOffsite,
          },
        };
        response = await createOrganization(payload).unwrap();
      }

      onSuccess?.(response ?? data);
      toast.success(isEdit ? 'Organization updated successfully!' : 'Organization created successfully!');
      handleClose();
    } catch (error) {
      console.error(isEdit ? 'Update organization error:' : 'Create organization error:', error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.msg ||
        error?.data?.error ||
        error?.error ||
        error?.message ||
        'Something went wrong. Please try again.';
      toast.error(errorMessage);
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 0 }}>
          {isEdit ? 'Edit Organization' : 'Create Organization'}
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              mt: 3,
              gap: 2,
              display: 'grid',
              gridTemplateColumns: 'repeat(1, 1fr)',
            }}
          >
            <Field.Text name="name" label="Organization Name" />
            <Field.Text
              name="ownerName"
              label="Owner Name"
              disabled={isEdit}
              helperText={isEdit ? 'Owner cannot be modified' : undefined}
            />
            <Field.Text
              name="ownerEmail"
              label="Owner Email"
              disabled={isEdit}
              helperText={isEdit ? 'Owner cannot be modified' : undefined}
            />

            <Field.Switch
              name="emergencyNotifyOffsite"
              label="Notify off-site members during emergencies"
              helperText="When on, off-site staff also receive emergency notifications."
            />
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
            loading={isCreating || isUpdating || methods.formState.isSubmitting}
          >
            {isEdit ? 'Save Changes' : 'Create Organization'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
