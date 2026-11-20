import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { useCreateShiftMutation, useUpdateShiftMutation } from 'src/store/Reducer/shifts-api';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetStaffProfilesQuery } from 'src/store/Reducer/staff-profiles-api';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

// ----------------------------------------------------------------------

export const ShiftSchema = zod
  .object({
    branchId: zod.string().min(1, { message: 'Site is required!' }),
    staffId: zod.string().optional(),
    startsAt: zod
      .any()
      .refine((value) => !!value && dayjs(value).isValid(), {
        message: 'Start date and time is required!',
      }),
    endsAt: zod
      .any()
      .refine((value) => !!value && dayjs(value).isValid(), {
        message: 'End date and time is required!',
      }),
  })
  .refine(
    (values) =>
      !values.startsAt ||
      !values.endsAt ||
      dayjs(values.endsAt).isAfter(dayjs(values.startsAt)),
    { path: ['endsAt'], message: 'End date and time must be after the start!' }
  );

// ----------------------------------------------------------------------

export function ShiftNewEditForm({ organizationId: propOrgId, currentShift }) {
  const router = useRouter();
  const pathname = usePathname();

  const isLineManager = pathname.startsWith(paths.lineManager.root);
  const isSiteManager = pathname.startsWith(paths.siteManager.root);
  const shiftBase = isLineManager
    ? paths.lineManager.shifts
    : isSiteManager
      ? paths.siteManager.shifts
      : paths.owner.shifts;

  const curBranchId =
    currentShift?.branch?._id ||
    currentShift?.branchId?._id ||
    (typeof currentShift?.branchId === 'string' ? currentShift.branchId : '') ||
    (typeof currentShift?.branch === 'string' ? currentShift.branch : '') ||
    '';

  const curBranchName =
    currentShift?.branch?.name ||
    currentShift?.branchId?.name ||
    '';

  const curStaffId =
    currentShift?.staff?._id ||
    currentShift?.staffId?._id ||
    (typeof currentShift?.staffId === 'string' ? currentShift.staffId : '') ||
    (typeof currentShift?.staff === 'string' ? currentShift.staff : '') ||
    '';

  const curStaffName =
    currentShift?.staff?.name ||
    currentShift?.staff?.user?.name ||
    currentShift?.staff?.userId?.name ||
    currentShift?.staffId?.name ||
    currentShift?.staffId?.user?.name ||
    '';

  const shiftOrgId =
    currentShift?.organizationId?._id ||
    currentShift?.organizationId ||
    currentShift?.organization?._id ||
    currentShift?.organization ||
    undefined;

  const { organizationId: resolvedOrgId } = useCurrentOrganization(propOrgId || shiftOrgId);
  const targetOrgId = propOrgId || shiftOrgId || resolvedOrgId;

  const [createShift, { isLoading: isCreating }] = useCreateShiftMutation();
  const [updateShift, { isLoading: isUpdating }] = useUpdateShiftMutation();

  const isEdit = !!currentShift;

  const { data: branchesData } = useGetBranchesQuery(
    { organizationId: targetOrgId, limit: 100 },
    { skip: !targetOrgId }
  );

  const branches = useMemo(() => branchesData?.data ?? [], [branchesData]);

  const branchOptions = useMemo(() => {
    const list = branches.map((b) => ({
      value: b._id,
      label: b.name || b.branchName || 'Unnamed Site',
    }));
    if (curBranchId && !list.some((b) => b.value === curBranchId)) {
      list.unshift({ value: curBranchId, label: curBranchName || curBranchId });
    }
    return list;
  }, [branches, curBranchId, curBranchName]);

  const defaultValues = useMemo(
    () => ({
      branchId: curBranchId,
      staffId: curStaffId,
      startsAt: currentShift?.startsAt || null,
      endsAt: currentShift?.endsAt || null,
    }),
    [curBranchId, curStaffId, currentShift]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(ShiftSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const startsAtValue = watch('startsAt');
  const selectedBranchId = watch('branchId');

  const { data: staffData } = useGetStaffProfilesQuery(
    { organizationId: targetOrgId, branchId: selectedBranchId, limit: 100 },
    { skip: !targetOrgId || !selectedBranchId }
  );

  const staffProfiles = useMemo(() => staffData?.data || [], [staffData]);

  const staffOptions = useMemo(() => {
    const list = staffProfiles.map((p) => {
      const name = p.userId?.name || p.user?.name || p.employeeCode || p._id;
      const email = p.userId?.email || p.user?.email || '';
      return {
        value: p._id,
        name,
        email: email ? String(email).toLowerCase() : '',
      };
    });

    if (
      curStaffId &&
      (!selectedBranchId || selectedBranchId === curBranchId) &&
      !list.some((s) => s.value === curStaffId)
    ) {
      list.unshift({
        value: curStaffId,
        name: curStaffName || 'Assigned Staff',
        email: currentShift?.staff?.email || currentShift?.staff?.user?.email || '',
      });
    }
    return list;
  }, [staffProfiles, curStaffId, curStaffName, selectedBranchId, curBranchId, currentShift]);

  useEffect(() => {
    if (currentShift) {
      reset(defaultValues);
    }
  }, [currentShift, reset, defaultValues]);

  // Reset staff selection only when user actively changes the branch
  const prevBranchIdRef = useRef(selectedBranchId);
  useEffect(() => {
    if (prevBranchIdRef.current && prevBranchIdRef.current !== selectedBranchId) {
      setValue('staffId', '');
    }
    prevBranchIdRef.current = selectedBranchId;
  }, [selectedBranchId, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        branchId: data.branchId,
        startsAt: dayjs(data.startsAt).toISOString(),
        endsAt: dayjs(data.endsAt).toISOString(),
        ...(data.staffId ? { staffId: data.staffId } : (isEdit ? { staffId: null } : {})),
      };

      let shiftId = currentShift?._id;

      if (isEdit) {
        await updateShift({
          shiftId: currentShift._id,
          organizationId: targetOrgId,
          ...payload,
        }).unwrap();
      } else {
        const res = await createShift({ organizationId: targetOrgId, ...payload }).unwrap();
        shiftId = res?.data?._id || res?._id;
      }

      toast.success(isEdit ? 'Shift updated successfully!' : 'Shift created successfully!');
      const targetShiftId = shiftId || currentShift?._id;
      if (targetShiftId) {
        router.push(shiftBase.detail(targetShiftId));
      } else {
        router.push(shiftBase.root);
      }
    } catch (error) {
      console.error('Failed to save shift:', error);
      const message =
        error?.data?.message ||
        error?.message ||
        'Something went wrong. Please try again.';
      toast.error(message);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {isEdit ? 'Edit shift' : 'Shift details'}
          </Typography>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <Field.Select
              name="branchId"
              label="Site"
              SelectProps={{ sx: { textTransform: 'capitalize' } }}
            >
              {branchOptions.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ textTransform: 'capitalize' }}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select
              name="staffId"
              label="Staff (optional)"
              disabled={!selectedBranchId}
              helperText={!selectedBranchId ? 'Select a site to load staff' : undefined}
              SelectProps={{ sx: { textTransform: 'none' } }}
            >
              <MenuItem value="">Open / Unassigned</MenuItem>
              {staffOptions.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ textTransform: 'none' }}>
                  <Box component="span" sx={{ textTransform: 'capitalize' }}>
                    {option.name}
                  </Box>
                  {option.email ? ` (${option.email})` : ''}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.MobileDateTimePicker
              name="startsAt"
              label="Start date & time"
            />
            <Field.MobileDateTimePicker
              name="endsAt"
              label="End date & time"
              minDate={
                startsAtValue && dayjs(startsAtValue).isValid()
                  ? dayjs(startsAtValue).startOf('day')
                  : undefined
              }
            />
          </Box>
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() =>
              router.push(
                isEdit
                ? shiftBase.detail(currentShift._id)
                : shiftBase.root
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
            {isEdit ? 'Save changes' : 'Create shift'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
