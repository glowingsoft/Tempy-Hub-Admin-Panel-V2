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
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetDepartmentsQuery } from 'src/store/Reducer/departments-api';
import { useGetJobTitlesQuery } from 'src/store/Reducer/job-titles-api';

import {
  useCreateInvitationMutation,
  useUpdateInvitationMutation,
  useGetGrantablePermissionsQuery,
} from 'src/store/Reducer/invitations-api';
import { MEMBERSHIP_ROLE_OPTIONS } from './mocks/data';

// ----------------------------------------------------------------------

const lookupOptionSchema = zod.object({
  value: zod.string().min(1),
  label: zod.string(),
});

export const MembershipSchema = zod
  .object({
    name: zod.string().min(1, { message: 'Name is required!' }),
    email: zod
      .string()
      .min(1, { message: 'Email is required!' })
      .email({ message: 'Enter a valid email address!' }),
    role: zod.string().min(1, { message: 'Role is required!' }),
    branchId: lookupOptionSchema.nullable().refine((value) => !!value?.value, {
      message: 'Site is required!',
    }),
    jobTitleId: lookupOptionSchema.nullable(),
    permissions: zod.array(zod.string()),
    departmentIds: zod.array(lookupOptionSchema),
    startDate: zod.union([zod.string(), zod.null()]),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'siteManager') return;
    if (!data.jobTitleId?.value) {
      ctx.addIssue({ code: 'custom', path: ['jobTitleId'], message: 'Job title is required!' });
    }
    if (!data.startDate) {
      ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'Start date is required!' });
    }
  });

const toTokenSource = (options) => {
  const labelById = Object.fromEntries(options.map((option) => [option.value, option.label]));
  return { ids: options.map((option) => option.value), labelById };
};

function toLookupOption(id, name) {
  if (!id) return null;
  return { value: id, label: name || id };
}

function mapLookupOption(item) {
  return {
    value: item._id,
    label: item.name,
  };
}

function lookupId(value) {
  if (!value) return '';
  if (typeof value === 'object') return value._id || value.value || '';
  return value;
}

function lookupName(value, fallback) {
  if (value && typeof value === 'object') return value.name || fallback || '';
  return fallback || '';
}

// ----------------------------------------------------------------------

export function MembershipNewEditForm({ organizationId, currentMembership }) {
  const router = useRouter();
  const { organizationId: currentOrgId } = useCurrentOrganization();

  const isEdit = !!currentMembership;
  const resolvedOrganizationId =
    organizationId || currentMembership?.organizationId || currentOrgId;

  const [createInvitation, { isLoading: isCreating }] = useCreateInvitationMutation();
  const [updateInvitation, { isLoading: isUpdating }] = useUpdateInvitationMutation();

  const lookupQueryArgs = useMemo(
    () => ({ organizationId: resolvedOrganizationId }),
    [resolvedOrganizationId]
  );

  const { data: grantablePermissions, isFetching: isFetchingPermissions } =
    useGetGrantablePermissionsQuery(
      { organizationId: resolvedOrganizationId },
      { skip: !resolvedOrganizationId }
    );

  const permissionTokens = useMemo(() => {
    const options = [...(grantablePermissions?.options ?? [])];
    (currentMembership?.permissions || []).forEach((key) => {
      if (!options.some((option) => option.value === key)) options.push({ value: key, label: key });
    });
    const moduleByKey = Object.fromEntries(options.map((option) => [option.value, option.moduleName]));
    return { ...toTokenSource(options), moduleByKey };
  }, [grantablePermissions, currentMembership]);

  const allPermissionIds = permissionTokens.ids;

  const permissionOptions = useMemo(() => {
    if (!allPermissionIds.length) return [];
    return ['all', ...allPermissionIds];
  }, [allPermissionIds]);

  const getPermissionLabel = useCallback(
    (id) => {
      if (id === 'all') return 'All';
      return permissionTokens.labelById[id] ?? id;
    },
    [permissionTokens]
  );

  const defaultValues = useMemo(
    () => ({
      name: currentMembership?.name || '',
      email: currentMembership?.email || '',
      role: currentMembership?.role || MEMBERSHIP_ROLE_OPTIONS[0]?.value || '',
      branchId: toLookupOption(
        lookupId(currentMembership?.branchId || currentMembership?.branch),
        lookupName(currentMembership?.branch, currentMembership?.branchName)
      ),
      jobTitleId: toLookupOption(
        lookupId(currentMembership?.jobTitleId || currentMembership?.jobTitle),
        lookupName(currentMembership?.jobTitle, currentMembership?.jobTitleName)
      ),
      permissions: currentMembership?.permissions || [],
      departmentIds: Array.isArray(currentMembership?.departments)
        ? currentMembership.departments
            .map((department) => toLookupOption(department?._id, department?.name))
            .filter(Boolean)
        : Array.isArray(currentMembership?.departmentIds)
          ? currentMembership.departmentIds
              .map((department) =>
                typeof department === 'object'
                  ? toLookupOption(department._id, department.name)
                  : toLookupOption(department, department)
              )
              .filter(Boolean)
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

  const role = watch('role');
  const selectedPermissions = watch('permissions') || [];
  const hideStaffDetails = role === 'siteManager';
  const hidePermissions = role === 'staff';

  const isAllSelected = useMemo(
    () =>
      allPermissionIds.length > 0 &&
      allPermissionIds.every((id) => selectedPermissions.includes(id)),
    [allPermissionIds, selectedPermissions]
  );

  const handleToggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      methods.setValue('permissions', [], { shouldValidate: true });
    } else {
      methods.setValue('permissions', allPermissionIds, { shouldValidate: true });
    }
  }, [isAllSelected, allPermissionIds, methods]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!resolvedOrganizationId) {
        toast.error('Unable to determine your organization. Please refresh and try again.');
        return;
      }

      let invitationId = currentMembership?._id;

      if (isEdit) {
        const res = await updateInvitation({
          invitationId: currentMembership._id,
          organizationId: resolvedOrganizationId,
          branchId: data.branchId?.value,
          permissions: data.permissions,
        }).unwrap();
        invitationId = res?.data?._id || res?._id || invitationId;
      } else {
        const payload = {
          email: data.email,
          name: data.name,
          role: data.role,
          branchId: data.branchId?.value,
          permissions: data.permissions,
          jobTitleId: data.jobTitleId?.value,
          departmentIds: (data.departmentIds || []).map((item) => item.value).filter(Boolean),
          startDate: data.startDate ? dayjs(data.startDate).toISOString() : undefined,
        };

        if (data.role === 'siteManager') {
          delete payload.jobTitleId;
          delete payload.departmentIds;
          delete payload.startDate;
        }
        if (data.role === 'staff') {
          delete payload.permissions;
        }

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
            <Field.Text
              name="name"
              label="Name"
              disabled={isEdit}
              sx={{ textTransform: 'capitalize' }}
            />
            <Field.Text name="email" label="Email" disabled={isEdit} />

            <Field.Select name="role" label="Role" disabled={isEdit}>
              {MEMBERSHIP_ROLE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ textTransform: 'capitalize' }}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.InfiniteAutocomplete
              name="branchId"
              label="Site"
              placeholder="Search sites"
              useQuery={useGetBranchesQuery}
              queryArgs={lookupQueryArgs}
              mapOption={mapLookupOption}
              enabled={!!resolvedOrganizationId}
            />

            {!hideStaffDetails && (
              <Field.InfiniteAutocomplete
                name="jobTitleId"
                label="Job title"
                placeholder="Search job titles"
                useQuery={useGetJobTitlesQuery}
                queryArgs={lookupQueryArgs}
                mapOption={mapLookupOption}
                enabled={!!resolvedOrganizationId}
                disabled={isEdit}
              />
            )}

            {!hideStaffDetails && (
              <Field.DatePicker name="startDate" label="Start date" disabled={isEdit} />
            )}
          </Box>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6">Access</Typography>
            {(!hidePermissions || isEdit) && allPermissionIds.length > 0 && (
              <Button
                size="small"
                variant="text"
                color={isAllSelected ? 'error' : 'primary'}
                onClick={handleToggleSelectAll}
                startIcon={
                  <Iconify
                    icon={isAllSelected ? 'solar:close-circle-bold' : 'solar:check-read-linear'}
                    width={18}
                  />
                }
              >
                {isAllSelected ? 'Deselect all' : 'Select all'}
              </Button>
            )}
          </Stack>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            {(!hidePermissions || isEdit) && (
              <Field.Autocomplete
                multiple
                disableCloseOnSelect
                name="permissions"
                label="Permissions"
                placeholder="Search permissions"
                loading={isFetchingPermissions}
                options={permissionOptions}
                groupBy={(option) =>
                  option === 'all' ? 'All' : permissionTokens.moduleByKey[option] || 'Other'
                }
                slotProps={{
                  popper: {
                    placement: 'bottom-start',
                    modifiers: [{ name: 'flip', enabled: false }],
                  },
                }}
                ListboxProps={{ style: { maxHeight: 320 } }}
                getOptionLabel={getPermissionLabel}
                isOptionEqualToValue={(option, value) => option === value}
                onChange={(event, newValue) => {
                  if (newValue.some((item) => item === 'all')) {
                    if (isAllSelected) {
                      methods.setValue('permissions', [], { shouldValidate: true });
                    } else {
                      methods.setValue('permissions', allPermissionIds, { shouldValidate: true });
                    }
                  } else {
                    methods.setValue(
                      'permissions',
                      newValue.filter((item) => item !== 'all'),
                      { shouldValidate: true }
                    );
                  }
                }}
                renderOption={(props, option) => (
                  <li
                    {...props}
                    key={option}
                    aria-selected={option === 'all' ? isAllSelected : props['aria-selected']}
                  >
                    {getPermissionLabel(option)}
                  </li>
                )}
                renderTags={(selected, getTagProps) =>
                  selected
                    .filter((option) => option !== 'all')
                    .map((option, index) => (
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

            {(!hideStaffDetails || isEdit) && (
              <Field.InfiniteAutocomplete
                multiple
                disableCloseOnSelect
                name="departmentIds"
                label="Departments"
                placeholder="Search departments"
                useQuery={useGetDepartmentsQuery}
                queryArgs={lookupQueryArgs}
                mapOption={mapLookupOption}
                enabled={!!resolvedOrganizationId}
                disabled={isEdit}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.value}
                      size="small"
                      variant="soft"
                      label={option.label}
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

          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isSubmitting || isCreating || isUpdating}
          >
            {isEdit ? 'Save changes' : 'Send invitation'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
