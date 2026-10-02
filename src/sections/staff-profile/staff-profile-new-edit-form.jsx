import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
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

import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockJobTitles } from 'src/sections/job-title/mocks/data';
import { mockDepartments } from 'src/sections/department/mocks/data';
import { mockOrganizations } from 'src/sections/organization/mocks/data';

// import {
//   useCreateStaffProfileMutation,
//   useUpdateStaffProfileMutation,
// } from 'src/store/Reducer/staff-profiles-api';
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
    .min(1, { message: 'PIN is required!' })
    .regex(/^\d{4,6}$/, { message: 'PIN must be 4 to 6 digits.' }),
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
  const { user } = useSelector((state) => state.user);
  const isOwner = user?.permission === 4;

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
        currentStaffProfile?.organizationId || organizationId || mockOrganizations[0]?._id || '',
      userId: currentStaffProfile?.userId || '',
      branchId: currentStaffProfile?.branchId || '',
      jobTitleId: currentStaffProfile?.jobTitleId || '',
      departmentIds: currentStaffProfile?.departmentIds || [],
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
  const activeOrgId = organizationId || watchedOrgId || mockOrganizations[0]?._id;

  // const [createStaffProfile] = useCreateStaffProfileMutation();
  // const [updateStaffProfile] = useUpdateStaffProfileMutation();

  const userOptions = useMemo(
    () =>
      mockStaffUsers
        .filter((u) => !activeOrgId || u.organizationId === activeOrgId)
        .map((u) => ({ value: u._id, label: `${u.name} (${u.email})` })),
    [activeOrgId]
  );

  const branchOptions = useMemo(
    () =>
      mockBranches
        .filter((branch) => !activeOrgId || branch.organizationId === activeOrgId)
        .map((branch) => ({ value: branch._id, label: branch.name })),
    [activeOrgId]
  );

  const jobTitleOptions = useMemo(
    () =>
      mockJobTitles
        .filter((jt) => !activeOrgId || jt.organizationId === activeOrgId)
        .map((jt) => ({ value: jt._id, label: jt.name })),
    [activeOrgId]
  );

  const departmentOptions = useMemo(
    () =>
      mockDepartments
        .filter((dep) => !activeOrgId || dep.organizationId === activeOrgId)
        .map((dep) => ({ value: dep._id, label: dep.name })),
    [activeOrgId]
  );

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
        pin: data.pin,
        hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : null,
      };

      // TODO: replace with the real mutation once the endpoints are wired up.
      // TODO: confirm whether `userId` is accepted on update — assumed create-only here.
      let profileId = staffProfileId;
      const targetOrgId = organizationId || data.organizationId || activeOrgId;

      if (isEdit) {
        // await updateStaffProfile({ staffProfileId, organizationId: targetOrgId, ...payload }).unwrap();
        updateMockStaffProfile(staffProfileId, payload);
      } else {
        // await createStaffProfile({ organizationId: targetOrgId, userId: data.userId, ...payload }).unwrap();
        const created = createMockStaffProfile({
          organizationId: targetOrgId,
          userId: data.userId,
          ...payload,
        });
        profileId = created._id;
      }

      toast.success(isEdit ? 'Staff profile updated successfully!' : 'Staff profile created successfully!');
      router.push(resolvedPaths.detail(profileId));
    } catch (error) {
      toast.error(error?.data?.message || 'Something went wrong. Please try again.');
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

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create staff profile'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
