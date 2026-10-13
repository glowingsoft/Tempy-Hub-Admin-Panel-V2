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

import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from 'src/store/Reducer/departments-api';

// ----------------------------------------------------------------------

const DepartmentSchema = zod.object({
  name: zod.string().min(1, 'Department name is required'),
  sortOrder: zod.coerce
    .number({ invalid_type_error: 'Sort order must be a number' })
    .int('Sort order must be a whole number')
    .min(0, 'Sort order cannot be negative'),
  isActive: zod.boolean(),
  branchId: zod
    .object({ value: zod.string(), label: zod.string() })
    .nullable(),
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

  const { branchOptions, isBranchesFetching } = useOrganizationLookups({
    organizationId,
    branches: open && !!organizationId,
    jobTitles: false,
    departments: false,
    limit: 100,
  });

  const defaultValues = useMemo(
    () => ({
      name: currentDepartment?.name || '',
      sortOrder: currentDepartment?.sortOrder ?? 0,
      isActive: currentDepartment?.isActive ?? true,
      branchId: currentDepartment?.branchId
        ? {
          value: currentDepartment.branchId,
          label: currentDepartment.branch?.name || currentDepartment.branchId,
        }
        : null,
    }),
    [currentDepartment]
  );

  const methods = useForm({
    resolver: zodResolver(DepartmentSchema),
    defaultValues,
  });

  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();

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
      const payload = isEdit
        ? {
          organizationId,
          name: data.name,
          sortOrder: data.sortOrder,
          isActive: data.isActive,
          branchId: data.branchId?.value || null,
        }
        : { organizationId, name: data.name, sortOrder: data.sortOrder };

      if (!isEdit) {
        await createDepartment({
          organizationId,
          name: data.name,
          sortOrder: data.sortOrder,
        }).unwrap();
      } else {
        await updateDepartment({
          organizationId,
          departmentId: currentDepartment._id,
          name: data.name,
          sortOrder: data.sortOrder,
          isActive: data.isActive,
          branchId: data.branchId?.value || null,
        }).unwrap();
      }

      onSuccess?.(payload);
      toast.success(isEdit ? 'Department updated successfully!' : 'Department created successfully!');
      handleClose();
    } catch (error) {
      console.error(isEdit ? 'Update department error:' : 'Create department error:', error);
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

            <Field.Autocomplete
              name="branchId"
              label="Sites (optional)"
              placeholder={isBranchesFetching ? 'Loading sites...' : 'Search and select sites'}
              options={branchOptions}
              loading={isBranchesFetching}
              getOptionLabel={(option) => option.label || ''}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              helperText={isBranchesFetching ? 'Loading sites...' : undefined}
            />

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
            loading={methods.formState.isSubmitting || isCreating || isUpdating}
          >
            {isEdit ? 'Save Changes' : 'Create Department'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
