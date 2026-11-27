import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo, useEffect, useCallback, useRef } from 'react';
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
import { useGetMembersQuery } from 'src/store/Reducer/members-api';

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

function capitalizeLabel(value = '') {
  return String(value)
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatUserLabel(name, email) {
  const displayName = capitalizeLabel(name || '—');
  const displayEmail = email ? String(email) : '';
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

function lookupId(value) {
  if (!value) return '';
  if (typeof value === 'object') return value._id || value.value || '';
  return value;
}

function getDepartmentBranchId(department) {
  const branch = department?.branchId || department?.branch;
  return typeof branch === 'object' ? branch?._id || branch?.id || '' : branch || '';
}

function getJobTitleBranchId(jobTitle) {
  const branch = jobTitle?.branchId || jobTitle?.branch;
  return typeof branch === 'object' ? branch?._id || branch?.id || '' : branch || '';
}

const lookupOptionSchema = zod.object({
  value: zod.string().min(1),
  label: zod.string(),
});

// ----------------------------------------------------------------------

function getStaffRole(profile) {
  return (
    profile?.role ||
    profile?.membership?.role ||
    profile?.user?.role ||
    (typeof profile?.userId === 'object' && profile?.userId?.role) ||
    ''
  );
}

function isLineManager(profile) {
  const role = getStaffRole(profile);
  const normalized = String(role || '').toLowerCase().replace(/[-_\s]/g, '');
  return normalized === 'linemanager';
}

export const createStaffProfileSchema = ({ isLineManager: isLineManagerStaff = false } = {}) =>
  zod
    .object({
      organizationId: zod.string().optional(),
      userId: zod
        .union([zod.string().min(1), lookupOptionSchema])
        .nullable()
        .refine((value) => Boolean(typeof value === 'string' ? value : value?.value), {
          message: 'User is required!',
        }),
      branchId: lookupOptionSchema.nullable().refine((value) => !!value?.value, {
        message: 'Site is required!',
      }),
      jobTitleId: lookupOptionSchema.nullable().optional(),
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
    })
    .superRefine((data, ctx) => {
      if (!isLineManagerStaff && !data.jobTitleId?.value) {
        ctx.addIssue({
          code: 'custom',
          path: ['jobTitleId'],
          message: 'Job title is required!',
        });
      }
    });

export const StaffProfileSchema = createStaffProfileSchema();

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
  inModal = false,
  onSuccess,
  onCancel,
} = {}) {
  const router = useRouter();
  const { organizationId: currentOrgId, isOwner, user } = useCurrentOrganization(organizationId);

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
  const isLineManagerStaff = isEdit && isLineManager(currentStaffProfile);
  const memberships = user?.access?.memberships || [];
  const currentOrganizationMembership = memberships.find((membership) => {
    const membershipOrganizationId =
      typeof membership?.organizationId === 'object'
        ? membership.organizationId?._id
        : membership?.organizationId;
    return currentOrgId && membershipOrganizationId === currentOrgId;
  });
  const currentUserRole =
    currentOrganizationMembership?.role ||
    user?.role ||
    user?.basicInfo?.role ||
    user?.accountState?.role;
  const isLineManagerUser =
    Number(user?.permission) === 3 ||
    isLineManager({ role: currentUserRole }) ||
    (!currentOrgId && memberships.some((membership) => isLineManager({ role: membership?.role })));
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
          : currentStaffProfile?.userId) || null,
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

  const schema = useMemo(
    () => createStaffProfileSchema({ isLineManager: isLineManagerStaff }),
    [isLineManagerStaff]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
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
  const watchedUser = watch('userId');
  const watchedBranch = watch('branchId');
  const selectedBranchId = lookupId(watchedBranch);
  const prevBranchIdRef = useRef(selectedBranchId);
  const isInitialMountRef = useRef(true);

  const memberQueryArgs = useMemo(
    () => ({
      organizationId: activeOrgId,
      role: 'siteManager',
      hasStaffProfile: false,
      ...(selectedBranchId ? { branchId: selectedBranchId } : {}),
    }),
    [activeOrgId, selectedBranchId]
  );

  const mapMemberOption = useCallback(
    (member) => {
      const id = member?.userId || member?.user?._id;
      if (!id) return null;
      const memberBranchId =
        (typeof member.branchId === 'object' && member.branchId !== null
          ? member.branchId._id
          : member.branchId) || member.branch?._id;
      if (selectedBranchId && memberBranchId && memberBranchId !== selectedBranchId) {
        return null;
      }
      const name = member?.name || member?.user?.name || id;
      const email = member?.email || member?.user?.email || '';
      return {
        value: id,
        label: formatUserLabel(name, email),
        name,
        email,
        member,
      };
    },
    [selectedBranchId]
  );

  const jobTitleQueryArgs = useMemo(
    () => ({
      organizationId: activeOrgId,
      status: 'active',
      ...(selectedBranchId ? { branchId: selectedBranchId } : {}),
    }),
    [activeOrgId, selectedBranchId]
  );

  const mapJobTitleOption = useCallback(
    (item) => {
      if (item?.active === false || item?.status === 'inactive' || item?.siteScope === 'none') {
        return null;
      }
      const jobTitleBranchId = getJobTitleBranchId(item);
      if (
        selectedBranchId &&
        jobTitleBranchId &&
        item?.siteScope !== 'all' &&
        jobTitleBranchId !== selectedBranchId
      ) {
        return null;
      }
      return {
        value: item._id,
        label: item.name,
      };
    },
    [selectedBranchId]
  );

  const { data: departmentsData, isLoading: isLoadingDepartments } = useGetDepartmentsQuery(
    { organizationId: activeOrgId, page: 1, limit: 100, status: 'active' },
    { skip: !activeOrgId }
  );

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevBranchIdRef.current = selectedBranchId;
      return;
    }

    if (prevBranchIdRef.current !== selectedBranchId) {
      prevBranchIdRef.current = selectedBranchId;
      if (!isEdit) {
        methods.setValue('userId', null);
      }
      methods.setValue('jobTitleId', null);
      methods.setValue('departmentIds', []);
    }
  }, [selectedBranchId, isEdit, methods]);

  useEffect(() => {
    if (isEdit) return;
    const member = watchedUser?.member;
    if (!member) return;

    const memberJobTitleId =
      (typeof member.jobTitleId === 'object' && member.jobTitleId !== null
        ? member.jobTitleId._id
        : member.jobTitleId) || member.jobTitle?._id;
    const memberJobTitleName =
      (typeof member.jobTitleId === 'object' && member.jobTitleId?.name) || member.jobTitle?.name;

    methods.setValue('jobTitleId', toLookupOption(memberJobTitleId, memberJobTitleName));

    const memberDepartments = Array.isArray(member.departments)
      ? member.departments
          .filter(Boolean)
          .map((department) => toLookupOption(department?._id, department?.name))
          .filter(Boolean)
      : Array.isArray(member.departmentIds)
        ? member.departmentIds
            .filter(Boolean)
            .map((department) =>
              typeof department === 'object' && department !== null
                ? toLookupOption(department?._id, department?.name)
                : toLookupOption(department, department)
            )
            .filter(Boolean)
        : [];

    methods.setValue('departmentIds', memberDepartments);
    methods.setValue('startDate', member.startDate || null);
  }, [watchedUser, isEdit, methods]);

  const departmentOptions = useMemo(() => {
    const departments = Array.isArray(departmentsData?.data) ? departmentsData.data : [];

    return departments
      .filter((department) => {
        if (department.active === false) return false;

        const departmentBranchId = getDepartmentBranchId(department);
        return !departmentBranchId || departmentBranchId === selectedBranchId;
      })
      .map(mapLookupOption);
  }, [departmentsData?.data, selectedBranchId]);

  const eligibleDepartmentIds = useMemo(
    () => new Set(departmentOptions.map((option) => option.value)),
    [departmentOptions]
  );

  useEffect(() => {
    if (!departmentsData) return;

    const selectedDepartments = methods.getValues('departmentIds') || [];
    const validDepartments = selectedDepartments.filter((department) =>
      eligibleDepartmentIds.has(department.value)
    );

    if (validDepartments.length !== selectedDepartments.length) {
      methods.setValue('departmentIds', validDepartments, { shouldValidate: true });
    }
  }, [departmentsData, eligibleDepartmentIds, methods]);

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
        departmentIds: (data.departmentIds || []).map((department) => department.value),
        startDate: data.startDate ? dayjs(data.startDate).toISOString() : undefined,
        ...(data.jobTitleId?.value
          ? { jobTitleId: data.jobTitleId.value }
          : isEdit
            ? { jobTitleId: null }
            : {}),
        ...(data.pin ? { pin: data.pin } : {}),
        ...(data.hourlyRate ? { hourlyRate: Number(data.hourlyRate) } : {}),
        ...(isEdit && data.supervisionIntervalMonths !== '' && data.supervisionIntervalMonths != null
          ? { supervisionIntervalMonths: Number(data.supervisionIntervalMonths) }
          : {}),
        ...(isEdit && data.appraisalIntervalMonths !== '' && data.appraisalIntervalMonths != null
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
          userId: typeof data.userId === 'object' ? data.userId?.value : data.userId,
          ...payload,
        }).unwrap();
        profileId = res?.data?._id || res?._id || staffProfileId;
      }

      toast.success(isEdit ? 'Staff profile updated successfully!' : 'Staff profile created successfully!');
      if (onSuccess) {
        methods.reset(defaultValues);
        onSuccess(profileId);
      } else {
        router.push(resolvedPaths.detail(profileId));
      }
    } catch (error) {
      console.error('Failed to save staff profile:', error);
      if (!error?.status) {
        toast.error(error?.message || 'Something went wrong. Please try again.');
      }
    }
  });

  const formFields = (
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

            <Field.InfiniteAutocomplete
              name="branchId"
              label="Site"
              placeholder="Search sites"
              useQuery={useGetBranchesQuery}
              queryArgs={lookupQueryArgs}
              mapOption={mapLookupOption}
              enabled={!!activeOrgId}
            />

            {isEdit ? (
              <Field.Select
                name="userId"
                label="User"
                disabled
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
            ) : (
              <Field.InfiniteAutocomplete
                key={`member-user-${activeOrgId || 'no-org'}-${selectedBranchId || 'no-branch'}`}
                name="userId"
                label="User"
                placeholder={selectedBranchId ? 'Search site managers' : 'Select a site first'}
                useQuery={useGetMembersQuery}
                queryArgs={memberQueryArgs}
                mapOption={mapMemberOption}
                enabled={Boolean(activeOrgId && selectedBranchId)}
                disabled={!activeOrgId || !selectedBranchId}
                renderOption={(props, option) => (
                  <li {...props} key={option.value}>
                    <Typography variant="body2">
                      <Box component="span" sx={{ textTransform: 'capitalize' }}>
                        {option.name || option.label}
                      </Box>
                      {option.email ? (
                        <>
                          {' ('}
                          <Box component="span" sx={{ textTransform: 'none' }}>
                            {option.email}
                          </Box>
                          {')'}
                        </>
                      ) : null}
                    </Typography>
                  </li>
                )}
              />
            )}

            <Field.InfiniteAutocomplete
              key={`job-title-${activeOrgId || 'no-org'}-${selectedBranchId || 'no-branch'}`}
              name="jobTitleId"
              label={isLineManagerStaff ? 'Job title (optional)' : 'Job title'}
              placeholder={selectedBranchId ? 'Search job titles' : 'Select a site first'}
              useQuery={useGetJobTitlesQuery}
              queryArgs={jobTitleQueryArgs}
              mapOption={mapJobTitleOption}
              enabled={Boolean(activeOrgId && selectedBranchId)}
              disabled={!activeOrgId || !selectedBranchId}
            />

            <Field.DatePicker name="startDate" label="Start date" />

            <Field.Autocomplete
              multiple
              disableCloseOnSelect
              name="departmentIds"
              label="Departments"
              placeholder={selectedBranchId ? 'Search departments' : 'Select a site first'}
              loading={isLoadingDepartments}
              options={departmentOptions}
              disabled={!activeOrgId || !selectedBranchId || isLoadingDepartments}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              getOptionLabel={(option) => option.label || ''}
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

            {isEdit && (
              <>
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
              </>
            )}
          </Box>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        {inModal ? (
          <Box sx={{ pt: 1 }}>{formFields}</Box>
        ) : (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Staff profile
            </Typography>
            {formFields}
          </Card>
        )}

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => (onCancel ? onCancel() : router.push(resolvedPaths.root))}
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