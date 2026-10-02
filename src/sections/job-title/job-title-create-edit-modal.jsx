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
import { mockDepartments } from 'src/sections/department/mocks/data';

// import { useCreateJobTitleMutation, useUpdateJobTitleMutation } from 'src/store/Reducer/job-titles-api';
import { JOB_TITLE_LEVEL_OPTIONS } from './mocks/data';

// ----------------------------------------------------------------------

const JobTitleSchema = zod.object({
  name: zod.string().min(1, 'Job title name is required'),
  level: zod.string().min(1, 'Level is required'),
  active: zod.boolean(),
  branchId: zod.string().optional(),
  departmentId: zod.string().optional(),
});

// ----------------------------------------------------------------------

// `organizationId` comes from the authenticated owner (set on the user at login),
// not from a form field.
export function JobTitleCreateEditModal({
  open,
  onClose,
  organizationId,
  currentJobTitle,
  onSuccess,
}) {
  const isEdit = !!currentJobTitle;

  // Optional branch scope — branches for the owner's organization.
  const branchOptions = useMemo(
    () =>
      mockBranches
        .filter((branch) => !organizationId || branch.organizationId === organizationId)
        .map((branch) => ({ value: branch._id, label: branch.name })),
    [organizationId]
  );

  const departmentOptions = useMemo(
    () =>
      mockDepartments
        .filter((department) => !organizationId || department.organizationId === organizationId)
        .map((department) => ({ value: department._id, label: department.name })),
    [organizationId]
  );

  const defaultValues = useMemo(
    () => ({
      name: currentJobTitle?.name || '',
      level: currentJobTitle?.level || JOB_TITLE_LEVEL_OPTIONS[0]?.value || '',
      active: currentJobTitle?.active ?? true,
      branchId: currentJobTitle?.branchId || (currentJobTitle?.siteScope === 'none' ? '__none__' : '__all_sites__'),
      departmentId: currentJobTitle?.departmentId || currentJobTitle?.department?._id || '',
    }),
    [currentJobTitle]
  );

  const methods = useForm({
    resolver: zodResolver(JobTitleSchema),
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
      // `{ name, level, branchId? }` for the body and `organizationId` for the URL.
      const payload = {
        organizationId,
        name: data.name,
        level: data.level,
        active: data.active,
        branchId:
          data.branchId && data.branchId !== '__all_sites__' && data.branchId !== '__none__'
            ? data.branchId
            : null,
        siteScope:
          data.branchId === '__none__'
            ? 'none'
            : data.branchId === '__all_sites__'
              ? 'all'
              : 'branch',
        departmentId: data.departmentId || null,
      };

      // TODO: replace with the real mutation once the endpoint is wired up.
      // if (isEdit) {
      //   await updateJobTitle({ jobTitleId: currentJobTitle._id, ...payload }).unwrap();
      // } else {
      //   await createJobTitle(payload).unwrap();
      // }

      onSuccess?.(payload);
      toast.success(isEdit ? 'Job title updated successfully!' : 'Job title created successfully!');
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Something went wrong. Please try again.');
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 0 }}>
          {isEdit ? 'Edit Job Title' : 'Create Job Title'}
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

            <Field.Select name="level" label="Level">
              {JOB_TITLE_LEVEL_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="branchId" label="Site (optional)">
              <MenuItem value="__all_sites__">All sites</MenuItem>
              <MenuItem value="__none__">None</MenuItem>
              {branchOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="departmentId" label="Department (optional)">
              <MenuItem value="">None</MenuItem>
              {departmentOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Switch name="active" label="Active" />
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
            {isEdit ? 'Save Changes' : 'Create Job Title'}
          </LoadingButton>
        </DialogActions>
      </Form>

    </Dialog>
  );
}
