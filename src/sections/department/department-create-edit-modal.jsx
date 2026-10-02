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

import { mockBranches } from 'src/sections/branch/mocks/data';

// import { useCreateDepartmentMutation, useUpdateDepartmentMutation } from 'src/store/Reducer/departments-api';

// ----------------------------------------------------------------------

const DepartmentSchema = zod.object({
  name: zod.string().min(1, 'Department name is required'),
  sortOrder: zod.coerce
    .number({ invalid_type_error: 'Sort order must be a number' })
    .int('Sort order must be a whole number')
    .min(0, 'Sort order cannot be negative'),
  isActive: zod.boolean(),
  branchId: zod.string().optional(),
});

// ----------------------------------------------------------------------

// `organizationId` comes from the authenticated owner (set on the user at login),
// not from a form field.
export function DepartmentCreateEditModal({
  open,
  onClose,
  organizationId,
  currentDepartment,
  onSuccess,
}) {
  const isEdit = !!currentDepartment;

  // Optional branch scope — branches for the owner's organization.
  const branchOptions = useMemo(
    () =>
      mockBranches
        .filter((branch) => !organizationId || branch.organizationId === organizationId)
        .map((branch) => ({ value: branch._id, label: branch.name })),
    [organizationId]
  );

  const defaultValues = useMemo(
    () => ({
      name: currentDepartment?.name || '',
      sortOrder: currentDepartment?.sortOrder ?? 0,
      isActive: currentDepartment?.isActive ?? true,
      branchId: currentDepartment?.branchId || '',
    }),
    [currentDepartment]
  );

  const methods = useForm({
    resolver: zodResolver(DepartmentSchema),
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
      // Payload kept decoupled from the wire format. The API slice picks
      // `{ name, sortOrder, branchId? }` for the body and `organizationId` for the URL.
      const payload = {
        organizationId,
        name: data.name,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        branchId: data.branchId || null,
      };

      // TODO: replace with the real mutation once the endpoint is wired up.
      // if (isEdit) {
      //   await updateDepartment({ departmentId: currentDepartment._id, ...payload }).unwrap();
      // } else {
      //   await createDepartment(payload).unwrap();
      // }

      onSuccess?.(payload);
      toast.success(isEdit ? 'Department updated successfully!' : 'Department created successfully!');
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Something went wrong. Please try again.');
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 0 }}>
          {isEdit ? 'Edit Department' : 'Create Department'}
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
            <Field.Text name="name" label="Name" />

            <Field.Text name="sortOrder" label="Sort Order" type="number" />

            <Field.Select name="branchId" label="Site (optional)">
              <MenuItem value="">None</MenuItem>
              {branchOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Switch name="isActive" label="Active" />
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
            {isEdit ? 'Save Changes' : 'Create Department'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
