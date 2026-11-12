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

import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetDepartmentsQuery } from 'src/store/Reducer/departments-api';
import {
  useCreateJobTitleMutation,
  useUpdateJobTitleMutation,
} from 'src/store/Reducer/job-titles-api';

import { JOB_TITLE_LEVEL_OPTIONS, JobTitleLevel } from './mocks/data';

export { JobTitleLevel };

// ----------------------------------------------------------------------

const JobTitleSchema = zod.object({
  name: zod.string().min(1, 'Job title name is required'),
  level: zod.string().min(1, 'Level is required'),
  active: zod.boolean(),
  branchId: zod
    .object({ value: zod.string(), label: zod.string() })
    .nullable(),
  departmentId: zod
    .object({ value: zod.string(), label: zod.string() })
    .nullable(),
});

const ALL_SITES_OPTION = { value: '__all_sites__', label: 'All sites' };
const NONE_SITE_OPTION = { value: '__none__', label: 'None' };
const SITE_EXTRA_OPTIONS = [ALL_SITES_OPTION, NONE_SITE_OPTION];

const mapLookupOption = (item) => ({
  value: item._id,
  label: item.name,
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

  const lookupQueryArgs = useMemo(() => ({ organizationId }), [organizationId]);

  const defaultValues = useMemo(() => {
    const department =
      currentJobTitle?.department ??
      currentJobTitle?.departments?.[0] ??
      (currentJobTitle?.departmentId
        ? { _id: currentJobTitle.departmentId, name: currentJobTitle.departmentId }
        : null);

    const branchOption = currentJobTitle?.branchId
      ? {
          value: currentJobTitle.branchId,
          label: currentJobTitle.branch?.name || currentJobTitle.branchId,
        }
      : currentJobTitle?.siteScope === 'none'
        ? NONE_SITE_OPTION
        : ALL_SITES_OPTION;

    return {
      name: currentJobTitle?.name || '',
      level: currentJobTitle?.level || JOB_TITLE_LEVEL_OPTIONS[0]?.value || '',
      active: currentJobTitle?.active ?? true,
      branchId: branchOption,
      departmentId: department
        ? { value: department._id, label: department.name || department._id }
        : null,
    };
  }, [currentJobTitle]);

  const methods = useForm({
    resolver: zodResolver(JobTitleSchema),
    defaultValues,
  });

  const [createJobTitle, { isLoading: isCreating }] = useCreateJobTitleMutation();
  const [updateJobTitle, { isLoading: isUpdating }] = useUpdateJobTitleMutation();

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
        name: data.name,
        level: data.level,
        active: data.active,
        branchId:
          data.branchId?.value &&
          data.branchId.value !== '__all_sites__' &&
          data.branchId.value !== '__none__'
            ? data.branchId.value
            : null,
        siteScope:
          data.branchId?.value === '__none__'
            ? 'none'
            : data.branchId?.value === '__all_sites__'
              ? 'all'
              : 'branch',
        departmentId: data.departmentId?.value || null,
      };

      const result = isEdit
        ? await updateJobTitle({
          organizationId,
          jobTitleId: currentJobTitle._id,
          name: data.name,
          level: data.level,
          active: data.active,
          branchId: payload.branchId,
          departmentId: payload.departmentId,
        }).unwrap()
        : await createJobTitle({
          organizationId,
          name: data.name,
          level: data.level,
          branchId: payload.branchId,
          departmentId: payload.departmentId,
        }).unwrap();

      onSuccess?.(isEdit ? payload : result);
      toast.success(isEdit ? 'Job title updated successfully!' : 'Job title created successfully!');
      handleClose();
    } catch (error) {
      console.error(isEdit ? 'Update job title error:' : 'Create job title error:', error);
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

            <Field.InfiniteAutocomplete
              name="branchId"
              label="Site (optional)"
              placeholder="Search sites"
              useQuery={useGetBranchesQuery}
              queryArgs={lookupQueryArgs}
              mapOption={mapLookupOption}
              extraOptions={SITE_EXTRA_OPTIONS}
              enabled={open && !!organizationId}
            />

            <Field.InfiniteAutocomplete
              name="departmentId"
              label="Department (optional)"
              placeholder="Search departments"
              useQuery={useGetDepartmentsQuery}
              queryArgs={lookupQueryArgs}
              mapOption={mapLookupOption}
              enabled={open && !!organizationId}
            />

            <Field.Switch name="active" label="Active" />
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
            loading={methods.formState.isSubmitting || isCreating || isUpdating}
          >
            {isEdit ? 'Save Changes' : 'Create Job Title'}
          </LoadingButton>
        </DialogActions>
      </Form>

    </Dialog>
  );
}
