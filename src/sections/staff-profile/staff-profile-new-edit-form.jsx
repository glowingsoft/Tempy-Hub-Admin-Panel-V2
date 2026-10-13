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
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import { mockOrganizations } from 'src/sections/organization/mocks/data';

import {
  useCreateStaffProfileMutation,
  useUpdateStaffProfileMutation,
} from 'src/store/Reducer/staff-profiles-api';
import {
  mockStaffUsers,
  createMockStaffProfile,
  updateMockStaffProfile,
} from './mocks/data';

// ----------------------------------------------------------------------

export const StaffProfileSchema = zod.object({
  organizationId: zod.string().optional(),
  userId: zod.string().min(1, { message: 'User is required!' }),
  branchId: zod.string().min(1, { message: 'Site is required!' }),
  jobTitleId: zod.string().min(1, { message: 'Job title is required!' }),
  departmentIds: zod.array(zod.string()),
  startDate: zod
    .union([zod.string(), zod.null()])
    .refine((value) => !!value, { message: 'Start date is required!' }),
  pin: zod
    .string()
    .optional()
    .refine((value) => !value || /^\d{4,6}$/.test(value), {
      message: 'PIN must be 4 to 6 digits.',
    }),
  // Optional — used to show earnings alongside worked hours on the Staff Dashboard.
  hourlyRate: zod
    .string()
    .optional()
    .refine((value) => !value || /^\d+(\.\d{1,2})?$/.test(value), {
      message: 'Enter a valid amount (e.g. 12.50)',
    }),
});

// ----------------------------------------------------------------------

export function StaffProfileNewEditForm({
  organizationId,
  currentStaffProfile,
  pathsConfig,
} = {}) {
  const router = useRouter();
  const { organizationId: currentOrgId, isOwner } = useCurrentOrganization(organizationId);

  const resolvedPaths = useMemo(
    () => ({
      dashboardRoot: isOwner ? paths.owner.root : paths.dashboard.root,
      root: isOwner ? paths.owner.staffProfiles.root : paths.dashboard.staffProfiles.root,
      detail: (id) =>
        isOwner ? paths.owner.staffProfiles.detail(id) : paths.dashboard.staffProfiles.detail(id),
      ...pathsConfig,
    }),
    [isOwner, pathsConfig]
  );

  const isEdit = !!currentStaffProfile;
  const staffProfileId = currentStaffProfile?._id;

  const defaultValues = useMemo(
    () => ({
      organizationId:
        (typeof currentStaffProfile?.organizationId === 'object'
          ? currentStaffProfile.organizationId._id
          : currentStaffProfile?.organizationId) ||
        organizationId ||
        mockOrganizations[0]?._id ||
        '',
      userId:
        (typeof currentStaffProfile?.userId === 'object'
          ? currentStaffProfile.userId._id
          : currentStaffProfile?.userId) || '',
      branchId:
        (typeof currentStaffProfile?.branchId === 'object'
          ? currentStaffProfile.branchId._id
          : currentStaffProfile?.branchId) || '',
      jobTitleId:
        (typeof currentStaffProfile?.jobTitleId === 'object'
          ? currentStaffProfile.jobTitleId._id
          : currentStaffProfile?.jobTitleId) || '',
      departmentIds: Array.isArray(currentStaffProfile?.departmentIds)
        ? currentStaffProfile.departmentIds.map((d) => (typeof d === 'object' ? d._id : d))
        : [],
      startDate: currentStaffProfile?.startDate || null,
      pin: currentStaffProfile?.pin || '',
      hourlyRate:
        currentStaffProfile?.hourlyRate != null ? String(currentStaffProfile.hourlyRate) : '',
    }),
    [currentStaffProfile, organizationId]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(StaffProfileSchema),
    defaultValues,
  });

  const {
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const watchedOrgId = watch('organizationId');
  const activeOrgId = organizationId || watchedOrgId || currentOrgId || mockOrganizations[0]?._id;

  const [createStaffProfile, { isLoading: isCreating }] = useCreateStaffProfileMutation();
  const [updateStaffProfile, { isLoading: isUpdating }] = useUpdateStaffProfileMutation();

  const userOptions = useMemo(() => {
    const list = [...mockStaffUsers.filter((u) => !activeOrgId || u.organizationId === activeOrgId)];
    const currentUserId =
      typeof currentStaffProfile?.userId === 'object'
        ? currentStaffProfile.userId._id
        : currentStaffProfile?.userId;
    const currentUserName =
      typeof currentStaffProfile?.userId === 'object'
        ? `${currentStaffProfile.userId.name} (${currentStaffProfile.userId.email})`
        : currentStaffProfile?.user?.name || currentStaffProfile?.userName;

    if (currentUserId && !list.some((u) => u._id === currentUserId)) {
      list.unshift({
        _id: currentUserId,
        name: currentUserName || currentUserId,
        email: '',
      });
    }

    return list.map((u) => ({
      value: u._id,
      label: u.email ? `${u.name} (${u.email})` : u.name,
    }));
  }, [activeOrgId, currentStaffProfile]);

  const {
    branchOptions: rawBranchOptions,
    jobTitleOptions: rawJobTitleOptions,
    departmentOptions: rawDepartmentOptions,
  } = useOrganizationLookups({
    organizationId: activeOrgId,
    limit: 100,
  });

  const branchOptions = useMemo(() => {
    const list = [...rawBranchOptions];
    const branchId =
      typeof currentStaffProfile?.branchId === 'object'
        ? currentStaffProfile.branchId._id
        : currentStaffProfile?.branchId;
    const branchName =
      (typeof currentStaffProfile?.branchId === 'object' && currentStaffProfile.branchId.name) ||
      currentStaffProfile?.branch?.name;
    if (branchId && !list.some((b) => b.value === branchId)) {
      list.unshift({ value: branchId, label: branchName || branchId });
    }
    return list;
  }, [rawBranchOptions, currentStaffProfile]);

  const jobTitleOptions = useMemo(() => {
    const list = [...rawJobTitleOptions];
    const jobTitleId =
      typeof currentStaffProfile?.jobTitleId === 'object'
        ? currentStaffProfile.jobTitleId._id
        : currentStaffProfile?.jobTitleId;
    const jobTitleName =
      (typeof currentStaffProfile?.jobTitleId === 'object' && currentStaffProfile.jobTitleId.name) ||
      currentStaffProfile?.jobTitle?.name;
    if (jobTitleId && !list.some((j) => j.value === jobTitleId)) {
      list.unshift({ value: jobTitleId, label: jobTitleName || jobTitleId });
    }
    return list;
  }, [rawJobTitleOptions, currentStaffProfile]);

  const departmentOptions = useMemo(() => {
    const list = [...rawDepartmentOptions];
    const rawDeps = Array.isArray(currentStaffProfile?.departmentIds)
      ? currentStaffProfile.departmentIds
      : [];
    rawDeps.forEach((dep) => {
      const depId = typeof dep === 'object' ? dep._id : dep;
      const depName = typeof dep === 'object' ? dep.name : dep;
      if (depId && !list.some((d) => d.value === depId)) {
        list.push({ value: depId, label: depName || depId });
      }
    });
    return list;
  }, [rawDepartmentOptions, currentStaffProfile]);

  // `departmentIds` stays a string[] — the Autocomplete works on id strings and
  // resolves labels through this map.
  const departmentIds = useMemo(() => departmentOptions.map((dep) => dep.value), [departmentOptions]);
  const departmentLabelById = useMemo(
    () => Object.fromEntries(departmentOptions.map((dep) => [dep.value, dep.label])),
    [departmentOptions]
  );
  const getDepartmentLabel = useCallback(
    (id) => departmentLabelById[id] ?? id,
    [departmentLabelById]
  );

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        branchId: data.branchId,
        jobTitleId: data.jobTitleId,
        departmentIds: data.departmentIds,
        startDate: data.startDate ? dayjs(data.startDate).toISOString() : undefined,
        ...(data.pin ? { pin: data.pin } : {}),
        ...(data.hourlyRate ? { hourlyRate: Number(data.hourlyRate) } : {}),
      };

      let profileId = staffProfileId;
      const targetOrgId = organizationId || data.organizationId || activeOrgId;

      if (isEdit) {
        await updateStaffProfile({
          staffProfileId,
          organizationId: targetOrgId,
          ...payload,
        }).unwrap();
      } else {
        const res = await createStaffProfile({
          organizationId: targetOrgId,
          userId: data.userId,
          ...payload,
        }).unwrap();
        profileId = res?.data?._id || res?._id || staffProfileId;
      }

      toast.success(isEdit ? 'Staff profile updated successfully!' : 'Staff profile created successfully!');
      router.push(resolvedPaths.detail(profileId));
    } catch (error) {
      console.error('Failed to save staff profile:', error);
      if (!error?.status) {
        toast.error(error?.message || 'Something went wrong. Please try again.');
      }
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Staff profile
          </Typography>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            {!organizationId && !isEdit && (
              <Field.Select name="organizationId" label="Organization">
                {mockOrganizations.map((org) => (
                  <MenuItem key={org._id} value={org._id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Field.Select>
            )}

            <Field.Select name="userId" label="User" disabled={isEdit}>
              {userOptions.map((option) => (
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

            <Field.Autocomplete
              multiple
              disableCloseOnSelect
              name="departmentIds"
              label="Departments"
              placeholder="Search departments"
              options={departmentIds}
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

            <Field.Text
              name="pin"
              label="PIN"
              placeholder="4321"
              inputProps={{ inputMode: 'numeric', maxLength: 6 }}
            />

            <Field.Text
              name="hourlyRate"
              label="Hourly rate (optional)"
              placeholder="12.50"
              inputProps={{ inputMode: 'decimal' }}
              InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }}
            />
          </Box>
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button
            color="inherit"
            onClick={() =>
              router.push(
                isEdit
                  ? resolvedPaths.detail(staffProfileId)
                  : resolvedPaths.root
              )
            }
          >
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting || isUpdating || isCreating}>
            {isEdit ? 'Save changes' : 'Create staff profile'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
