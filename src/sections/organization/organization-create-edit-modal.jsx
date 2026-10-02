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

// import { useCreateOrganizationMutation, useUpdateOrganizationMutation } from 'src/store/Reducer/organizations-api';

// ----------------------------------------------------------------------

const OrganizationSchema = zod.object({
  name: zod.string().min(1, 'Organization name is required'),
  ownerName: zod.string().min(1, 'Owner name is required'),
  ownerEmail: zod
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
    resolver: zodResolver(OrganizationSchema),
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
        name: data.name,
        ownerName: data.ownerName,
        ownerEmail: data.ownerEmail,
        settings: {
          emergencyNotifyOffsite: data.emergencyNotifyOffsite,
        },
      };

      // TODO: replace with the real mutation once the endpoint is wired up.
      // if (isEdit) {
      //   await updateOrganization({ id: currentOrganization._id, ...payload }).unwrap();
      // } else {
      //   await createOrganization(payload).unwrap();
      // }

      onSuccess?.(payload);
      toast.success(isEdit ? 'Organization updated successfully!' : 'Organization created successfully!');
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Something went wrong. Please try again.');
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
            <Field.Text name="ownerName" label="Owner Name" />
            <Field.Text name="ownerEmail" label="Owner Email" />

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
            loading={methods.formState.isSubmitting}
          >
            {isEdit ? 'Save Changes' : 'Create Organization'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
