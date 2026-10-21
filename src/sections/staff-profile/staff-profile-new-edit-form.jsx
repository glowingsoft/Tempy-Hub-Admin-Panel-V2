import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo } from 'react';
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
import { mockOrganizations } from 'src/sections/organization/mocks/data';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetDepartmentsQuery } from 'src/store/Reducer/departments-api';
import { useGetJobTitlesQuery } from 'src/store/Reducer/job-titles-api';

import {
  useGetStaffProfilesQuery,
  useCreateStaffProfileMutation,
  useUpdateStaffProfileMutation,
} from 'src/store/Reducer/staff-profiles-api';
import {
  mockStaffUsers,
  createMockStaffProfile,
  updateMockStaffProfile,
} from './mocks/data';

// ----------------------------------------------------------------------

function capitalizeLabel(value = '') {
  return String(value)
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatUserLabel(name, email) {
  const displayName = capitalizeLabel(name || '—');
  const displayEmail = email ? String(email).toLowerCase() : '';
  return displayEmail ? `${displayName} (${displayEmail})` : displayName;
}

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

function mapSupervisorOption(item) {
  const name =
    item.userId?.name ||
    item.user?.name ||
    item.name ||
    item.employeeCode ||
    item._id;
  const email = item.userId?.email || item.user?.email || item.email || '';
  const label = email ? `${name} (${email})` : name;
  return {
    value: item._id,
    label,
  };
}

const lookupOptionSchema = zod.object({
  value: zod.string().min(1),
  label: zod.string(),
});

// ----------------------------------------------------------------------

export const StaffProfileSchema = zod.object({
  organizationId: zod.string().optional(),
  userId: zod.string().min(1, { message: 'User is required!' }),
  supervisorStaffId: lookupOptionSchema.nullable().optional(),
  branchId: lookupOptionSchema.nullable().refine((value) => !!value?.value, {
    message: 'Site is required!',
  }),
  jobTitleId: lookupOptionSchema.nullable().refine((value) => !!value?.value, {
    message: 'Job title is required!',
  }),
  departmentIds: zod.array(lookupOptionSchema),
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
  supervisionIntervalMonths: zod.union([zod.number(), zod.string(), zod.null()]).optional(),
  appraisalIntervalMonths: zod.union([zod.number(), zod.string(), zod.null()]).optional(),
});

export const SUPERVISION_INTERVAL_OPTIONS = [
  { value: 1, label: '1 month' },
  { value: 2, label: '2 months' },
  { value: 3, label: '3 months' },
  { value: 4, label: '4 months' },
  { value: 6, label: '6 months' },
];

export const APPRAISAL_INTERVAL_OPTIONS = [
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
];

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
        (typeof currentStaffProfile?.organizationId === 'object' && currentStaffProfile?.organizationId !== null
          ? currentStaffProfile.organizationId?._id
          : currentStaffProfile?.organizationId) ||
        organizationId ||
        mockOrganizations[0]?._id ||
        '',
      userId:
        (typeof currentStaffProfile?.userId === 'object' && currentStaffProfile?.userId !== null
          ? currentStaffProfile.userId?._id
          : currentStaffProfile?.userId) || '',
      branchId: toLookupOption(
        typeof currentStaffProfile?.branchId === 'object' && currentStaffProfile?.branchId !== null
          ? currentStaffProfile.branchId?._id
          : currentStaffProfile?.branchId,
        (typeof currentStaffProfile?.branchId === 'object' && currentStaffProfile?.branchId?.name) ||
          currentStaffProfile?.branch?.name
      ),
      jobTitleId: toLookupOption(
        typeof currentStaffProfile?.jobTitleId === 'object' && currentStaffProfile?.jobTitleId !== null
          ? currentStaffProfile.jobTitleId?._id
          : currentStaffProfile?.jobTitleId,
        (typeof currentStaffProfile?.jobTitleId === 'object' && currentStaffProfile?.jobTitleId?.name) ||
          currentStaffProfile?.jobTitle?.name
      ),
      supervisorStaffId: toLookupOption(
        typeof currentStaffProfile?.supervisorStaffId === 'object' && currentStaffProfile?.supervisorStaffId !== null
          ? currentStaffProfile.supervisorStaffId?._id
          : currentStaffProfile?.supervisorStaffId,
        typeof currentStaffProfile?.supervisorStaffId === 'object' && currentStaffProfile?.supervisorStaffId !== null
          ? currentStaffProfile.supervisorStaffId?.userId?.name ||
              currentStaffProfile.supervisorStaffId?.user?.name ||
              currentStaffProfile.supervisorStaffId?.name ||
              currentStaffProfile.supervisorStaffId?.employeeCode
          : undefined
      ),
      departmentIds: Array.isArray(currentStaffProfile?.departments)
        ? currentStaffProfile.departments
            .filter(Boolean)
            .map((department) =>
              typeof department === 'object' && department !== null
                ? toLookupOption(department?._id, department?.name)
                : toLookupOption(department, department)
            )
            .filter(Boolean)
        : Array.isArray(currentStaffProfile?.departmentIds)
          ? currentStaffProfile.departmentIds
              .filter(Boolean)
              .map((department) =>
                typeof department === 'object' && department !== null
                  ? toLookupOption(department?._id, department?.name)
                  : toLookupOption(department, department)
              )
              .filter(Boolean)
          : [],
      startDate: currentStaffProfile?.startDate || null,
      pin: currentStaffProfile?.pin || '',
      hourlyRate:
        currentStaffProfile?.hourlyRate != null ? String(currentStaffProfile.hourlyRate) : '',
      supervisionIntervalMonths: currentStaffProfile?.supervisionIntervalMonths ?? '',
      appraisalIntervalMonths: currentStaffProfile?.appraisalIntervalMonths ?? '',
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
  const resolvedOrgId =
    typeof organizationId === 'object' ? organizationId?._id : organizationId;
  const activeOrgId = resolvedOrgId || watchedOrgId || currentOrgId || mockOrganizations[0]?._id;

  const [createStaffProfile, { isLoading: isCreating }] = useCreateStaffProfileMutation();
  const [updateStaffProfile, { isLoading: isUpdating }] = useUpdateStaffProfileMutation();
  const lookupQueryArgs = useMemo(() => ({ organizationId: activeOrgId }), [activeOrgId]);

  const userOptions = useMemo(() => {
    const list = [...mockStaffUsers.filter((u) => !activeOrgId || u.organizationId === activeOrgId)];
    const currentUser =
      (typeof currentStaffProfile?.userId === 'object' && currentStaffProfile.userId) ||
      currentStaffProfile?.user;
    const currentUserId =
      currentUser?._id ||
      (typeof currentStaffProfile?.userId === 'string' ? currentStaffProfile.userId : '');

    if (currentUserId && !list.some((u) => u._id === currentUserId)) {
      list.unshift({
        _id: currentUserId,
        name: currentUser?.name || currentStaffProfile?.userName || currentUserId,
        email: currentUser?.email || currentStaffProfile?.userEmail || '',
      });
    }

    return list.map((u) => ({
      value: u._id,
      label: formatUserLabel(u.name, u.email),
    }));
  }, [activeOrgId, currentStaffProfile]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        branchId: data.branchId?.value,
        jobTitleId: data.jobTitleId?.value,
        departmentIds: (data.departmentIds || []).map((department) => department.value),
        startDate: data.startDate ? dayjs(data.startDate).toISOString() : undefined,
        ...(data.supervisorStaffId?.value
          ? { supervisorStaffId: data.supervisorStaffId.value }
          : isEdit && data.supervisorStaffId === null
            ? { supervisorStaffId: null }
            : {}),
        ...(data.pin ? { pin: data.pin } : {}),
        ...(data.hourlyRate ? { hourlyRate: Number(data.hourlyRate) } : {}),
        ...(data.supervisionIntervalMonths !== '' && data.supervisionIntervalMonths != null
          ? { supervisionIntervalMonths: Number(data.supervisionIntervalMonths) }
          : {}),
        ...(data.appraisalIntervalMonths !== '' && data.appraisalIntervalMonths != null
          ? { appraisalIntervalMonths: Number(data.appraisalIntervalMonths) }
          : {}),
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
                  <MenuItem key={org._id} value={org._id} sx={{ textTransform: 'capitalize' }}>
                    {capitalizeLabel(org.name)}
                  </MenuItem>
                ))}
              </Field.Select>
            )}

            <Field.Select
              name="userId"
              label="User"
              disabled={isEdit}
              SelectProps={{
                MenuProps: { PaperProps: { sx: { maxHeight: 220 } } },
                sx: { textTransform: 'none' },
              }}
            >
              {userOptions.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ textTransform: 'none' }}>
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
              enabled={!!activeOrgId}
            />

            <Field.InfiniteAutocomplete
              name="jobTitleId"
              label="Job title"
              placeholder="Search job titles"
              useQuery={useGetJobTitlesQuery}
              queryArgs={lookupQueryArgs}
              mapOption={mapLookupOption}
              enabled={!!activeOrgId}
            />

            <Field.InfiniteAutocomplete
              name="supervisorStaffId"
              label="Supervisor"
              placeholder="Search supervisor"
              useQuery={useGetStaffProfilesQuery}
              queryArgs={lookupQueryArgs}
              mapOption={mapSupervisorOption}
              enabled={!!activeOrgId}
            />

            <Field.DatePicker name="startDate" label="Start date" />

            <Field.InfiniteAutocomplete
              multiple
              disableCloseOnSelect
              name="departmentIds"
              label="Departments"
              placeholder="Search departments"
              useQuery={useGetDepartmentsQuery}
              queryArgs={lookupQueryArgs}
              mapOption={mapLookupOption}
              enabled={!!activeOrgId}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.value}
                    size="small"
                    variant="soft"
                    color="primary"
                    label={option.label}
                    sx={{ textTransform: 'capitalize' }}
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

            <Field.Select name="supervisionIntervalMonths" label="Supervision interval">
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {SUPERVISION_INTERVAL_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="appraisalIntervalMonths" label="Appraisal interval">
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {APPRAISAL_INTERVAL_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>
          </Box>
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button
            variant="outlined"
            color="primary"
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

          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isSubmitting || isUpdating || isCreating}
          >
            {isEdit ? 'Save changes' : 'Create staff profile'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}