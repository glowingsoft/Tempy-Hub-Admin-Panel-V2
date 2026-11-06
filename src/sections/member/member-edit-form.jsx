import { z as zod } from 'zod';
import { useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Avatar from '@mui/material/Avatar';
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
import { Label } from 'src/components/label';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useUpdateMembershipMutation } from 'src/store/Reducer/members-api';
import { useGetGrantablePermissionsQuery } from 'src/store/Reducer/invitations-api';
import { getMemberRoleLabel, MEMBER_STATUS_OPTIONS } from './mocks/data';

// ----------------------------------------------------------------------

export const MemberUpdateSchema = zod.object({
  status: zod.enum(['active', 'inactive'], { message: 'Status is required!' }),
  permissions: zod.array(zod.string()),
});

const toTokenSource = (options) => {
  const labelById = Object.fromEntries(options.map((option) => [option.value, option.label]));
  return { ids: options.map((option) => option.value), labelById };
};

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

// ----------------------------------------------------------------------

export function MemberEditForm({ organizationId, currentMember }) {
  const router = useRouter();
  const { organizationId: currentOrgId } = useCurrentOrganization();

  const resolvedOrganizationId =
    organizationId || currentMember?.organizationId || currentOrgId;

  const membershipId = currentMember?.membershipId ?? currentMember?._id;

  const [updateMembership, { isLoading: isUpdating }] = useUpdateMembershipMutation();

  const { data: grantablePermissions, isFetching: isFetchingPermissions } =
    useGetGrantablePermissionsQuery(
      { organizationId: resolvedOrganizationId },
      { skip: !resolvedOrganizationId }
    );

  const permissionTokens = useMemo(() => {
    const options = [...(grantablePermissions?.options ?? [])];
    (currentMember?.permissions || []).forEach((key) => {
      if (!options.some((option) => option.value === key)) options.push({ value: key, label: key });
    });
    const moduleByKey = Object.fromEntries(
      options.map((option) => [option.value, option.moduleName])
    );
    return { ...toTokenSource(options), moduleByKey };
  }, [grantablePermissions, currentMember]);

  const allPermissionIds = permissionTokens.ids;
  const isLineManager = currentMember?.role === 'lineManager';
  const showSelectAll = !isLineManager;

  const permissionOptions = useMemo(() => {
    if (!allPermissionIds.length) return [];
    if (!showSelectAll) return allPermissionIds;
    return ['all', ...allPermissionIds];
  }, [allPermissionIds, showSelectAll]);

  const getPermissionLabel = useCallback(
    (id) => {
      if (id === 'all') return 'All';
      return permissionTokens.labelById[id] ?? id;
    },
    [permissionTokens]
  );

  const defaultValues = useMemo(
    () => ({
      status: currentMember?.status === 'inactive' ? 'inactive' : 'active',
      permissions: currentMember?.permissions || [],
    }),
    [currentMember]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(MemberUpdateSchema),
    defaultValues,
    values: defaultValues,
  });

  const {
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const selectedPermissions = watch('permissions') || [];

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
      await updateMembership({
        membershipId,
        organizationId: resolvedOrganizationId,
        status: data.status,
        permissions: data.permissions,
      }).unwrap();

      toast.success('Membership updated successfully!');
      router.push(paths.owner.memberships.members.detail(membershipId));
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Something went wrong. Please try again.');
    }
  });

  const name = currentMember?.name || currentMember?.user?.name || '—';
  const email = currentMember?.email || currentMember?.user?.email || '';
  const roleLabel = getMemberRoleLabel(currentMember?.role);
  const siteName = currentMember?.branch?.name || '—';

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Card sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Avatar
              alt={name}
              src={currentMember?.user?.profileIcon || undefined}
              sx={{ width: 56, height: 56, typography: 'h6', bgcolor: 'primary.main', color: 'white' }}
            >
              {getInitials(name)}
            </Avatar>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                {name}
              </Typography>
              {email && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {email}
                </Typography>
              )}
            </Box>

            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
              <Label variant="soft" color="default" sx={{ textTransform: 'capitalize' }}>
                {roleLabel}
              </Label>
              <Label variant="soft" color="info" sx={{ textTransform: 'capitalize' }}>
                {siteName}
              </Label>
            </Stack>
          </Stack>
        </Card>

        <Card sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography variant="h6">Access</Typography>
            {showSelectAll && allPermissionIds.length > 0 && (
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
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
            Update this member’s status and the modules they can access.
          </Typography>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: '280px 1fr' }}
            sx={{ mb: 3 }}
          >
            <Field.Select name="status" label="Status">
              {MEMBER_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ textTransform: 'capitalize' }}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>
          </Box>

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
                    color="primary"
                    label={getPermissionLabel(option)}
                  />
                ))
            }
          />
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button
            color="inherit"
            onClick={() => router.push(paths.owner.memberships.members.detail(membershipId))}
          >
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isSubmitting || isUpdating}
          >
            Save changes
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
