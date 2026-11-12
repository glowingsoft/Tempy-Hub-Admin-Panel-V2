import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { LoadingButton } from '@mui/lab';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useUpdateResidentOutMutation } from 'src/store/Reducer/residents-api';

// ----------------------------------------------------------------------

const getErrorMessage = (error) =>
  error?.data?.message ||
  error?.data?.msg ||
  error?.data?.error ||
  error?.error ||
  error?.message ||
  'Failed to update resident out-of-facility status.';

const OutSchema = zod
  .object({
    out: zod.boolean(),
    destination: zod.string().optional(),
    expectedReturnAt: zod.any().optional(),
    note: zod.string().optional(),
  })
  .refine(
    (data) => {
      if (data.out) {
        return Boolean(data.destination && data.destination.trim().length > 0);
      }
      return true;
    },
    {
      message: 'Destination is required when resident is out of facility.',
      path: ['destination'],
    }
  )
  .refine(
    (data) => {
      if (data.out && data.expectedReturnAt) {
        const selected = dayjs(data.expectedReturnAt);
        if (selected.isValid()) {
          return selected.isAfter(dayjs().subtract(1, 'minute'));
        }
      }
      return true;
    },
    {
      message: 'Expected return date and time cannot be in the past.',
      path: ['expectedReturnAt'],
    }
  );

// ----------------------------------------------------------------------

export function ResidentOutDialog({
  open,
  resident,
  onClose,
  onSave,
  organizationId = null,
}) {
  const [updateResidentOut, { isLoading }] = useUpdateResidentOutMutation();

  const defaultValues = useMemo(() => {
    const existingDate = resident?.expectedReturnAt
      ? dayjs(resident.expectedReturnAt)
      : null;
    const initialDate =
      existingDate && existingDate.isValid() && existingDate.isAfter(dayjs())
        ? existingDate
        : dayjs().add(2, 'hour');

    return {
      out: Boolean(resident?.out),
      destination: resident?.destination || resident?.outDestination || '',
      note: resident?.note || resident?.outNote || '',
      expectedReturnAt: initialDate,
    };
  }, [resident]);

  const methods = useForm({
    mode: 'onTouched',
    resolver: zodResolver(OutSchema),
    defaultValues,
  });

  const { watch, setValue } = methods;
  const isOutValue = watch('out');

  useEffect(() => {
    if (open) {
      methods.reset(defaultValues);
    }
  }, [open, defaultValues, methods]);

  if (!resident) return null;

  const handleClose = () => {
    onClose();
    methods.reset(defaultValues);
  };

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      let isoReturn = null;
      if (data.out && data.expectedReturnAt) {
        const parsed = dayjs(data.expectedReturnAt);
        if (parsed.isValid()) {
          isoReturn = parsed.toISOString();
        }
      }

      const payload = {
        residentId: resident._id,
        organizationId,
        out: data.out,
        destination: data.out ? data.destination?.trim() : undefined,
        note: data.out ? data.note?.trim() : undefined,
        expectedReturnAt: data.out ? isoReturn : undefined,
      };

      const result = await updateResidentOut(payload).unwrap();

      onSave?.({
        ...resident,
        ...result,
        out: data.out,
        destination: data.out ? data.destination?.trim() : '',
        note: data.out ? data.note?.trim() : '',
        expectedReturnAt: data.out ? isoReturn : null,
      });

      toast.success(
        data.out
          ? 'Resident marked as out of facility.'
          : 'Resident marked as returned.'
      );
      handleClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={resident.image} alt={resident.name} sx={{ textTransform: 'capitalize' }}>
              {resident.name?.charAt(0)}
            </Avatar>
            <Stack>
              <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                {resident.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Room {resident.roomNumber || '—'} &bull; Out of Facility Status
              </Typography>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Record when a resident leaves the care home and when they are expected back.
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={isOutValue}
                  onChange={(event) =>
                    setValue('out', event.target.checked, { shouldValidate: true })
                  }
                />
              }
              label={isOutValue ? 'Currently Out' : 'In Facility'}
            />

            {isOutValue && (
              <>
                <Field.Text
                  name="destination"
                  label="Destination"
                  placeholder="e.g. Hospital appointment"
                  helperText="Where the resident is going or appointment details."
                />

                <Field.MobileDateTimePicker
                  name="expectedReturnAt"
                  label="Expected Return Date & Time"
                  disablePast
                  minDateTime={dayjs()}
                />

                <Field.Text
                  name="note"
                  label="Notes (Optional)"
                  placeholder="e.g. Taken by family"
                  multiline
                  rows={2}
                  helperText="Escort details, transport, or special instructions."
                />
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isLoading}>
            Save
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
