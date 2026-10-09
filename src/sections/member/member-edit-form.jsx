import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockJobTitles } from 'src/sections/job-title/mocks/data';
import { mockDepartments } from 'src/sections/department/mocks/data';

import { useUpdateMembershipMutation } from 'src/store/Reducer/members-api';
import { MEMBER_ROLE_OPTIONS, MEMBER_PERMISSION_OPTIONS } from './mocks/data';

// ----------------------------------------------------------------------

export const MemberUpdateSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  role: zod.string().min(1, { message: 'Role is required!' }),
  branchId: zod.string().min(1, { message: 'Site is required!' }),
  jobTitleId: zod.string().min(1, { message: 'Job title is required!' }),
  permissions: zod.array(zod.string()),
  departmentIds: zod.array(zod.string()),
  startDate: zod
    .union([zod.string(), zod.null()])
    .refine((value) => !!value, { message: 'Start date is required!' }),
});

// ----------------------------------------------------------------------

export function MemberEditForm({ organizationId, currentMember }) {
  const router = useRouter();

  const membershipId = currentMember?.membershipId ?? currentMember?._id;

  const [updateMembership, { isLoading: isUpdating }] = useUpdateMembershipMutation();

  const branchOptions = useMemo(
    () =>
      mockBranches
        .filter((branch) => !organizationId || branch.organizationId === organizationId)
        .map((branch) => ({ value: branch._id, label: branch.name })),
    [organizationId]
  );

  const jobTitleOptions = useMemo(
    () =>
      mockJobTitles
        .filter((jt) => !organizationId || jt.organizationId === organizationId)
        .map((jt) => ({ value: jt._id, label: jt.name })),
    [organizationId]
  );

  const departmentOptions = useMemo(
    () =>
      mockDepartments
        .filter((dep) => !organizationId || dep.organizationId === organizationId)
        .map((dep) => ({ value: dep._id, label: dep.name })),
    [organizationId]
  );

  const defaultValues = useMemo(
    () => ({
      name: currentMember?.name || '',
      role: currentMember?.role || MEMBER_ROLE_OPTIONS[0]?.value || '',
      branchId: currentMember?.branchId || '',
      jobTitleId: currentMember?.jobTitleId || '',
      permissions: currentMember?.permissions || [],
      departmentIds: currentMember?.departmentIds || [],
      startDate: currentMember?.startDate || null,
    }),
    [currentMember]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(MemberUpdateSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        name: data.name,
        role: data.role,
        branchId: data.branchId,
        permissions: data.permissions,
        jobTitleId: data.jobTitleId,
        departmentIds: data.departmentIds,
        startDate: data.startDate ? dayjs(data.startDate).toISOString() : undefined,
      };

      await updateMembership({ membershipId, organizationId, ...payload }).unwrap();

      toast.success('Membership updated successfully!');
      router.push(paths.owner.memberships.members.detail(membershipId));
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Something went wrong. Please try again.');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Member details
          </Typography>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <Field.Text name="name" label="Name" />

            {/* Email identifies the user account and is not editable here. */}
            <TextField
              label="Email"
              value={currentMember?.email || ''}
              disabled
              InputLabelProps={{ shrink: true }}
            />

            <Field.Select name="role" label="Role">
              {MEMBER_ROLE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="branchId" label="Site">
              {branchOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="jobTitleId" label="Job title">
              {jobTitleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.DatePicker name="startDate" label="Start date" />
          </Box>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Access
          </Typography>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <Field.MultiSelect
              chip
              checkbox
              fullWidth
              name="permissions"
              label="Permissions"
              placeholder="Select permissions"
              options={MEMBER_PERMISSION_OPTIONS}
            />

            <Field.MultiSelect
              chip
              checkbox
              fullWidth
              name="departmentIds"
              label="Departments"
              placeholder="Select departments"
              options={departmentOptions}
            />
          </Box>
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button
            color="inherit"
            onClick={() => router.push(paths.owner.memberships.members.detail(membershipId))}
          >
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting || isUpdating}>
            Save changes
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
