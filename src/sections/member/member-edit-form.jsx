import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useEffect, useMemo } from 'react';
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

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
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
    .union([zod.string(), zod.null(), zod.any()])
    .refine((value) => Boolean(value), { message: 'Start date is required!' }),
});

// ----------------------------------------------------------------------

export function MemberEditForm({ organizationId, currentMember }) {
  const router = useRouter();
  const { organizationId: currentOrgId } = useCurrentOrganization();

  const resolvedOrganizationId =
    organizationId || currentMember?.organizationId || currentOrgId;

  const membershipId = currentMember?.membershipId ?? currentMember?._id;

  const [updateMembership, { isLoading: isUpdating }] = useUpdateMembershipMutation();

  const { branches, jobTitles, departments } = useOrganizationLookups({
    organizationId: resolvedOrganizationId,
    limit: 100,
  });

  const branchOptions = useMemo(() => {
    const opts = branches.map((branch) => ({ value: branch._id, label: branch.name }));

    const currentBranchId =
      currentMember?.branchId ||
      (typeof currentMember?.branch === 'string' ? currentMember.branch : currentMember?.branch?._id);
    const currentBranchName = currentMember?.branch?.name;
    if (currentBranchId && !opts.some((o) => o.value === currentBranchId)) {
      opts.unshift({ value: currentBranchId, label: currentBranchName || currentBranchId });
    }
    return opts;
  }, [branches, currentMember]);

  const jobTitleOptions = useMemo(() => {
    const opts = jobTitles.map((jt) => ({ value: jt._id, label: jt.name }));

    const currentJobTitleId =
      currentMember?.jobTitleId ||
      (typeof currentMember?.jobTitle === 'string' ? currentMember.jobTitle : currentMember?.jobTitle?._id);
    const currentJobTitleName = currentMember?.jobTitle?.name;
    if (currentJobTitleId && !opts.some((o) => o.value === currentJobTitleId)) {
      opts.unshift({ value: currentJobTitleId, label: currentJobTitleName || currentJobTitleId });
    }
    return opts;
  }, [jobTitles, currentMember]);

  const departmentOptions = useMemo(() => {
    const opts = departments.map((dep) => ({ value: dep._id, label: dep.name }));

    (currentMember?.departments || []).forEach((d) => {
      const depId = typeof d === 'string' ? d : d?._id;
      const depName = typeof d === 'string' ? d : d?.name;
      if (depId && !opts.some((o) => o.value === depId)) {
        opts.push({ value: depId, label: depName || depId });
      }
    });
    return opts;
  }, [departments, currentMember]);

  const defaultValues = useMemo(
    () => ({
      name: currentMember?.name || currentMember?.user?.name || '',
      role: currentMember?.role || MEMBER_ROLE_OPTIONS[0]?.value || '',
      branchId:
        currentMember?.branchId ||
        (typeof currentMember?.branch === 'string'
          ? currentMember.branch
          : currentMember?.branch?._id) ||
        '',
      jobTitleId:
        currentMember?.jobTitleId ||
        (typeof currentMember?.jobTitle === 'string'
          ? currentMember.jobTitle
          : currentMember?.jobTitle?._id) ||
        '',
      permissions: currentMember?.permissions || [],
      departmentIds:
        Array.isArray(currentMember?.departmentIds) && currentMember.departmentIds.length > 0
          ? currentMember.departmentIds
          : Array.isArray(currentMember?.departments)
            ? currentMember.departments.map((d) => (typeof d === 'string' ? d : d?._id)).filter(Boolean)
            : [],
      startDate: currentMember?.startDate || currentMember?.staffProfile?.startDate || null,
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
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentMember) {
      reset(defaultValues);
    }
  }, [currentMember, defaultValues, reset]);

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

      await updateMembership({
        membershipId,
        organizationId: resolvedOrganizationId,
        ...payload,
      }).unwrap();

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
              value={currentMember?.email || currentMember?.user?.email || ''}
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
