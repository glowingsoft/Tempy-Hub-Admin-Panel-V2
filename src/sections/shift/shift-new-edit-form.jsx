import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo, useEffect } from 'react';
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
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { useCreateShiftMutation, useUpdateShiftMutation } from 'src/store/Reducer/shifts-api';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import { useGetStaffProfilesQuery } from 'src/store/Reducer/staff-profiles-api';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

// ----------------------------------------------------------------------

export const ShiftSchema = zod
  .object({
    branchId: zod.string().min(1, { message: 'Site is required!' }),
    staffId: zod.string().optional(),
    startsAt: zod
      .union([zod.string(), zod.null()])
      .refine((value) => !!value, { message: 'Start date and time is required!' })
      .refine(
        (value) => !value || !dayjs(value).isBefore(dayjs().startOf('day')),
        { message: 'Start date must be today or a future date!' }
      ),
    endsAt: zod
      .union([zod.string(), zod.null()])
      .refine((value) => !!value, { message: 'End date and time is required!' })
      .refine(
        (value) => !value || !dayjs(value).isBefore(dayjs().startOf('day')),
        { message: 'End date must be today or a future date!' }
      ),
  })
  .refine(
    (values) =>
      !values.startsAt || !values.endsAt || dayjs(values.endsAt).isAfter(dayjs(values.startsAt)),
    { path: ['endsAt'], message: 'End date and time must be after the start!' }
  );

// ----------------------------------------------------------------------

export function ShiftNewEditForm({ organizationId: propOrgId, currentShift }) {
  const router = useRouter();

  const shiftOrgId =
    currentShift?.organizationId?._id || currentShift?.organizationId || undefined;

  const { organizationId: resolvedOrgId } = useCurrentOrganization(propOrgId || shiftOrgId);
  const targetOrgId = propOrgId || shiftOrgId || resolvedOrgId;

  const [createShift, { isLoading: isCreating }] = useCreateShiftMutation();
  const [updateShift, { isLoading: isUpdating }] = useUpdateShiftMutation();

  const isEdit = !!currentShift;

  const { branchOptions: lookupBranchOptions } = useOrganizationLookups({
    organizationId: targetOrgId,
    limit: 100,
  });

  const branchOptions = useMemo(() => {
    const list = [...lookupBranchOptions];
    const curBranchId = currentShift?.branchId?._id || currentShift?.branchId || '';
    const curBranchName = currentShift?.branch?.name || currentShift?.branchId?.name || '';
    if (curBranchId && !list.some((b) => b.value === curBranchId)) {
      list.unshift({ value: curBranchId, label: curBranchName || curBranchId });
    }
    return list;
  }, [lookupBranchOptions, currentShift]);

  const defaultValues = useMemo(
    () => ({
      branchId: currentShift?.branchId?._id || currentShift?.branchId || '',
      staffId: currentShift?.staffId?._id || currentShift?.staffId || '',
      startsAt: currentShift?.startsAt || null,
      endsAt: currentShift?.endsAt || null,
    }),
    [currentShift]
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
      const email = p.userId?.email || p.user?.email;
      return {
        value: p._id,
        label: email ? `${name} (${String(email).toLowerCase()})` : name,
      };
    });
    const curStaffId = currentShift?.staffId?._id || currentShift?.staffId || '';
    const curStaffBranchId = currentShift?.branchId?._id || currentShift?.branchId || '';
    const curStaffName =
      currentShift?.staff?.user?.name ||
      currentShift?.staff?.name ||
      currentShift?.staffId?.name ||
      '';
    if (
      curStaffId &&
      selectedBranchId === curStaffBranchId &&
      !list.some((s) => s.value === curStaffId)
    ) {
      list.unshift({ value: curStaffId, label: curStaffName || curStaffId });
    }
    return list;
  }, [staffProfiles, currentShift, selectedBranchId]);

  useEffect(() => {
    if (currentShift) {
      reset(defaultValues);
    }
  }, [currentShift, reset, defaultValues]);
  // site is selected in site mananger

  useEffect(() => {
    const currentStaffId = methods.getValues('staffId');
    if (!currentStaffId) return;

    const stillValid = staffOptions.some((option) => option.value === currentStaffId);
    if (!stillValid) {
      setValue('staffId', '');
    }
  }, [selectedBranchId, staffOptions, setValue, methods]);

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
        const query = targetOrgId ? `?orgId=${targetOrgId}` : '';
        router.push(`${paths.owner.shifts.detail(targetShiftId)}${query}`);
      } else {
        router.push(paths.owner.shifts.root);
      }
    } catch (error) {
      console.error('Failed to save shift:', error);
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
              {staffOptions.map((option) => {
                const [name, email] = option.label.split(' (');
                return (
                  <MenuItem key={option.value} value={option.value} sx={{ textTransform: 'none' }}>
                    <Box component="span" sx={{ textTransform: 'capitalize' }}>
                      {name}
                    </Box>
                    {email ? ` (${email.replace(/\)$/, '').toLowerCase()})` : ''}
                  </MenuItem>
                );
              })}
            </Field.Select>

            <Field.MobileDateTimePicker
              name="startsAt"
              label="Start date & time"
              disablePast
              minDate={dayjs().startOf('day')}
            />
            <Field.MobileDateTimePicker
              name="endsAt"
              label="End date & time"
              disablePast
              minDate={
                startsAtValue && dayjs(startsAtValue).isValid()
                  ? dayjs(startsAtValue)
                  : dayjs().startOf('day')
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
                  ? paths.owner.shifts.detail(currentShift._id)
                  : paths.owner.shifts.root
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
