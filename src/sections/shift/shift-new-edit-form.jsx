import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo } from 'react';
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

import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockStaffProfiles } from 'src/sections/staff-profile/mocks/data';

// import { useCreateShiftMutation, useUpdateShiftMutation } from 'src/store/Reducer/shifts-api';
import { createMockShift, updateMockShift } from './mocks/data';

// ----------------------------------------------------------------------

export const ShiftSchema = zod
  .object({
    branchId: zod.string().min(1, { message: 'Site is required!' }),
    staffId: zod.string().optional(),
    startsAt: zod
      .union([zod.string(), zod.null()])
      .refine((value) => !!value, { message: 'Start date and time is required!' }),
    endsAt: zod
      .union([zod.string(), zod.null()])
      .refine((value) => !!value, { message: 'End date and time is required!' }),
  })
  .refine(
    (values) =>
      !values.startsAt || !values.endsAt || dayjs(values.endsAt).isAfter(dayjs(values.startsAt)),
    { path: ['endsAt'], message: 'End date and time must be after the start!' }
  );

// ----------------------------------------------------------------------

export function ShiftNewEditForm({ organizationId, currentShift }) {
  const router = useRouter();

  const isEdit = !!currentShift;

  const branchOptions = useMemo(
    () =>
      mockBranches
        .filter((branch) => !organizationId || branch.organizationId === organizationId)
        .map((branch) => ({ value: branch._id, label: branch.name })),
    [organizationId]
  );

  const staffOptions = useMemo(
    () =>
      mockStaffProfiles
        .filter((profile) => !organizationId || profile.organizationId === organizationId)
        .map((profile) => ({
          value: profile._id,
          label: profile.user?.name || profile.user?.email || profile._id,
        })),
    [organizationId]
  );

  const defaultValues = useMemo(
    () => ({
      branchId: currentShift?.branchId || '',
      staffId: currentShift?.staffId || '',
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
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        branchId: data.branchId,
        ...(data.staffId ? { staffId: data.staffId } : { staffId: null }),
        startsAt: dayjs(data.startsAt).toISOString(),
        endsAt: dayjs(data.endsAt).toISOString(),
      };

      // TODO: replace with the real mutation once the endpoints are wired up.
      // if (isEdit) {
      //   await updateShift({ shiftId: currentShift._id, organizationId, ...payload }).unwrap();
      // } else {
      //   await createShift({ organizationId, ...payload }).unwrap();
      // }

      let shiftId = currentShift?._id;

      if (isEdit) {
        updateMockShift(currentShift._id, payload);
      } else {
        const created = createMockShift({ organizationId, ...payload });
        shiftId = created._id;
      }

      toast.success(isEdit ? 'Shift updated successfully!' : 'Shift created successfully!');
      router.push(paths.owner.shifts.detail(shiftId));
    } catch (error) {
      toast.error(error?.data?.message || 'Something went wrong. Please try again.');
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
            <Field.Select name="branchId" label="Site">
              {branchOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="staffId" label="Staff (optional)">
              <MenuItem value="">Open / Unassigned</MenuItem>
              {staffOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.MobileDateTimePicker name="startsAt" label="Start date & time" />
            <Field.MobileDateTimePicker name="endsAt" label="End date & time" />
          </Box>
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button
            color="inherit"
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

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create shift'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
