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

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';

import {
  useCreateInvitationMutation,
  useUpdateInvitationMutation,
  useGetGrantablePermissionsQuery,
} from 'src/store/Reducer/invitations-api';
import {
  MEMBERSHIP_ROLE_OPTIONS,
  createMockInvitation,
  updateMockInvitation,
} from './mocks/data';

// ----------------------------------------------------------------------

export const MembershipSchema = zod
  .object({
    name: zod.string().min(1, { message: 'Name is required!' }),
    email: zod
      .string()
      .min(1, { message: 'Email is required!' })
      .email({ message: 'Enter a valid email address!' }),
    role: zod.string().min(1, { message: 'Role is required!' }),
    branchId: zod.string().min(1, { message: 'Site is required!' }),
    jobTitleId: zod.string(),
    permissions: zod.array(zod.string()),
    departmentIds: zod.array(zod.string()),
    startDate: zod.union([zod.string(), zod.null()]),
  })
  // Job title and start date are hidden (and not required) for Site Managers.
  .superRefine((data, ctx) => {
    if (data.role === 'siteManager') return;
    if (!data.jobTitleId) {
      ctx.addIssue({ code: 'custom', path: ['jobTitleId'], message: 'Job title is required!' });
    }
    if (!data.startDate) {
      ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'Start date is required!' });
    }
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
  const { organizationId: currentOrgId } = useCurrentOrganization();

  const isEdit = !!currentMembership;
  const resolvedOrganizationId =
    organizationId || currentMembership?.organizationId || currentOrgId;

  const [createInvitation, { isLoading: isCreating }] = useCreateInvitationMutation();
  const [updateInvitation, { isLoading: isUpdating }] = useUpdateInvitationMutation();

  const { branchOptions, jobTitleOptions, departmentOptions } = useOrganizationLookups({
    organizationId: resolvedOrganizationId,
    branches: true,
    jobTitles: true,
    departments: true,
    limit: 100,
  });

  const { data: grantablePermissions, isFetching: isFetchingPermissions } =
    useGetGrantablePermissionsQuery(
      { organizationId: resolvedOrganizationId },
      { skip: !resolvedOrganizationId }
    );

  // Token Autocomplete sources for the multi-value "Access" fields.
  // Values are permission keys (sent to the API); labels come from grantable-permissions.
  // Permissions already on the invitation stay selectable even if no longer grantable.
  const permissionTokens = useMemo(() => {
    const options = [...(grantablePermissions?.options ?? [])];
    (currentMembership?.permissions || []).forEach((key) => {
      if (!options.some((option) => option.value === key)) options.push({ value: key, label: key });
    });
    const moduleByKey = Object.fromEntries(options.map((option) => [option.value, option.moduleName]));
    return { ...toTokenSource(options), moduleByKey };
  }, [grantablePermissions, currentMembership]);
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
      branchId:
        currentMembership?.branchId ||
        (typeof currentMembership?.branch === 'string'
          ? currentMembership.branch
          : currentMembership?.branch?._id) ||
        '',
      jobTitleId:
        currentMembership?.jobTitleId ||
        (typeof currentMembership?.jobTitle === 'string'
          ? currentMembership.jobTitle
          : currentMembership?.jobTitle?._id) ||
        '',
      permissions: currentMembership?.permissions || [],
      departmentIds:
        Array.isArray(currentMembership?.departmentIds) && currentMembership.departmentIds.length > 0
          ? currentMembership.departmentIds
          : Array.isArray(currentMembership?.departments)
            ? currentMembership.departments.map((d) => (typeof d === 'string' ? d : d?._id)).filter(Boolean)
            : [],
      startDate: currentMembership?.startDate || null,
    }),
    [currentMembership]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(MembershipSchema),
    defaultValues,
    values: defaultValues,
  });

  const {
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Fields shown depend on the selected role.
  const role = watch('role');
  const hideStaffDetails = role === 'siteManager';
  const hidePermissions = role === 'staff';

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!resolvedOrganizationId) {
        toast.error('Unable to determine your organization. Please refresh and try again.');
        return;
      }

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

      // Don't send values for fields hidden by the selected role.
      if (data.role === 'siteManager') {
        delete payload.jobTitleId;
        delete payload.departmentIds;
        delete payload.startDate;
      }
      if (data.role === 'staff') {
        delete payload.permissions;
      }

      let invitationId = currentMembership?._id;

      if (isEdit) {
        try {
          const res = await updateInvitation({
            invitationId: currentMembership._id,
            organizationId: resolvedOrganizationId,
            ...payload,
          }).unwrap();
          invitationId = res?.data?._id || res?._id || invitationId;
        } catch {
          updateMockInvitation(currentMembership._id, payload);
        }
      } else {
        const res = await createInvitation({
          organizationId: resolvedOrganizationId,
          ...payload,
        }).unwrap();
        invitationId = res?.data?._id || res?._id;
      }

      toast.success(isEdit ? 'Invitation updated successfully!' : 'Invitation sent successfully!');
      router.push(paths.owner.memberships.invitations.detail(invitationId));
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

            {!hideStaffDetails && (
              <Field.Select name="jobTitleId" label="Job title">
                {jobTitleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>
            )}

            {!hideStaffDetails && <Field.DatePicker name="startDate" label="Start date" />}
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
            {!hidePermissions && (
              <Field.Autocomplete
                multiple
                disableCloseOnSelect
                name="permissions"
                label="Permissions"
                placeholder="Search permissions"
                loading={isFetchingPermissions}
                options={permissionTokens.ids}
                groupBy={(option) => permissionTokens.moduleByKey[option] || 'Other'}
                // Always open below the field; cap the list so it fits under it.
                slotProps={{
                  popper: {
                    placement: 'bottom-start',
                    modifiers: [{ name: 'flip', enabled: false }],
                  },
                }}
                ListboxProps={{ style: { maxHeight: 320 } }}
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
            )}

            {!hideStaffDetails && (
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
            )}
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

          <LoadingButton type="submit" variant="contained" loading={isSubmitting || isCreating || isUpdating}>
            {isEdit ? 'Save changes' : 'Send invitation'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
