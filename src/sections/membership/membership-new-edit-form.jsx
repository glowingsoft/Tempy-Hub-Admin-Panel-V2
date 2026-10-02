import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockJobTitles } from 'src/sections/job-title/mocks/data';
import { mockDepartments } from 'src/sections/department/mocks/data';

// import { useCreateInvitationMutation, useUpdateInvitationMutation } from 'src/store/Reducer/invitations-api';
import {
  MEMBERSHIP_ROLE_OPTIONS,
  MEMBERSHIP_PERMISSION_OPTIONS,
  createMockInvitation,
  updateMockInvitation,
} from './mocks/data';

// ----------------------------------------------------------------------

export const MembershipSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Enter a valid email address!' }),
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
// `[{ value, label }]` -> the `{ ids, getLabel }` pair a token Autocomplete needs.
// The RHF field value stays a string[] of ids; the Autocomplete resolves labels.
const toTokenSource = (options) => {
  const labelById = Object.fromEntries(options.map((option) => [option.value, option.label]));
  return { ids: options.map((option) => option.value), labelById };
};

// ----------------------------------------------------------------------

export function MembershipNewEditForm({ organizationId, currentMembership }) {
  const router = useRouter();

  const isEdit = !!currentMembership;

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

  // Token Autocomplete sources for the multi-value "Access" fields.
  const permissionTokens = useMemo(() => toTokenSource(MEMBERSHIP_PERMISSION_OPTIONS), []);
  const departmentTokens = useMemo(() => toTokenSource(departmentOptions), [departmentOptions]);

  const getPermissionLabel = useCallback(
    (id) => permissionTokens.labelById[id] ?? id,
    [permissionTokens]
  );
  const getDepartmentLabel = useCallback(
    (id) => departmentTokens.labelById[id] ?? id,
    [departmentTokens]
  );

  const defaultValues = useMemo(
    () => ({
      name: currentMembership?.name || '',
      email: currentMembership?.email || '',
      role: currentMembership?.role || MEMBERSHIP_ROLE_OPTIONS[0]?.value || '',
      branchId: currentMembership?.branchId || '',
      jobTitleId: currentMembership?.jobTitleId || '',
      permissions: currentMembership?.permissions || [],
      departmentIds: currentMembership?.departmentIds || [],
      startDate: currentMembership?.startDate || null,
    }),
    [currentMembership]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(MembershipSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        email: data.email,
        name: data.name,
        role: data.role,
        branchId: data.branchId,
        permissions: data.permissions,
        jobTitleId: data.jobTitleId,
        departmentIds: data.departmentIds,
        startDate: data.startDate ? dayjs(data.startDate).toISOString() : undefined,
      };

      // TODO: replace with the real mutation once the endpoints are wired up.
      // if (isEdit) {
      //   await updateInvitation({ invitationId: currentMembership._id, organizationId, ...payload }).unwrap();
      // } else {
      //   await createInvitation({ organizationId, ...payload }).unwrap();
      // }

      let invitationId = currentMembership?._id;

      if (isEdit) {
        updateMockInvitation(currentMembership._id, payload);
      } else {
        // Invitation-based → the new membership starts as a Pending Invitation.
        const created = createMockInvitation({ organizationId, ...payload });
        invitationId = created._id;
      }

      toast.success(isEdit ? 'Invitation updated successfully!' : 'Invitation sent successfully!');
      router.push(paths.owner.memberships.invitations.detail(invitationId));
    } catch (error) {
      toast.error(error?.data?.message || 'Something went wrong. Please try again.');
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
            <Field.Text name="email" label="Email" />

            <Field.Select name="role" label="Role">
              {MEMBERSHIP_ROLE_OPTIONS.map((option) => (
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
            <Field.Autocomplete
              multiple
              disableCloseOnSelect
              name="permissions"
              label="Permissions"
              placeholder="Search permissions"
              options={permissionTokens.ids}
              getOptionLabel={getPermissionLabel}
              isOptionEqualToValue={(option, value) => option === value}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {getPermissionLabel(option)}
                </li>
              )}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    size="small"
                    variant="soft"
                    label={getPermissionLabel(option)}
                  />
                ))
              }
            />

            <Field.Autocomplete
              multiple
              disableCloseOnSelect
              name="departmentIds"
              label="Departments"
              placeholder="Search departments"
              options={departmentTokens.ids}
              getOptionLabel={getDepartmentLabel}
              isOptionEqualToValue={(option, value) => option === value}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {getDepartmentLabel(option)}
                </li>
              )}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    size="small"
                    variant="soft"
                    label={getDepartmentLabel(option)}
                  />
                ))
              }
            />
          </Box>
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button
            color="inherit"
            onClick={() =>
              router.push(
                isEdit
                  ? paths.owner.memberships.invitations.detail(currentMembership._id)
                  : paths.owner.memberships.invitations.root
              )
            }
          >
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Send invitation'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
