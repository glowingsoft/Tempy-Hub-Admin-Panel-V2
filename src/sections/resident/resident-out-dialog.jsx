import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';

import Avatar from '@mui/material/Avatar';
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

export const isResidentOut = (resident) => {
  if (!resident) return false;
  if (
    resident.out === true ||
    resident.isOut === true ||
    resident.outOfFacility === true ||
    resident.outOfHome === true ||
    resident.isOutOfHome === true ||
    resident.outStatus === 'out' ||
    resident.status === 'out'
  ) {
    return true;
  }
  if (typeof resident.out === 'object' && resident.out !== null) {
    return Boolean(resident.out.out || resident.out.isOut || resident.out.destination);
  }
  return Boolean(resident.destination || resident.outDestination);
};

export const getResidentDestination = (resident) =>
  resident?.destination ||
  resident?.outDestination ||
  resident?.out?.destination ||
  resident?.out?.outDestination ||
  resident?.outDetails?.destination ||
  '';

export const getResidentNote = (resident) =>
  resident?.note ||
  resident?.outNote ||
  resident?.notes ||
  resident?.out?.note ||
  resident?.out?.notes ||
  resident?.outDetails?.note ||
  '';

export const getResidentReturnDate = (resident) => {
  const raw =
    resident?.expectedReturnAt ||
    resident?.outExpectedReturnAt ||
    resident?.expectedReturn ||
    resident?.out?.expectedReturnAt ||
    resident?.out?.expectedReturn ||
    resident?.outDetails?.expectedReturnAt;
  if (!raw) return null;
  const parsed = dayjs(raw);
  return parsed.isValid() ? parsed : null;
};

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
    const isCurrentlyOut = isResidentOut(resident);
    const existingReturnDate = getResidentReturnDate(resident);
    return {
      out: isCurrentlyOut,
      destination: getResidentDestination(resident),
      note: getResidentNote(resident),
      expectedReturnAt: existingReturnDate || dayjs().add(2, 'hour'),
    };
  }, [resident]);

  const methods = useForm({
    mode: 'onTouched',
    resolver: zodResolver(OutSchema),
    defaultValues,
  });

  const { watch, setValue, reset, handleSubmit } = methods;
  const isOutValue = watch('out');

  useEffect(() => {
    if (open && resident) {
      reset(defaultValues);
    }
  }, [open, resident?._id, defaultValues, reset]);

  if (!resident) return null;

  const handleClose = () => {
    onClose();
    reset(defaultValues);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const parsedDate = data.out && data.expectedReturnAt ? dayjs(data.expectedReturnAt) : null;
      const isoReturn = parsedDate?.isValid() ? parsedDate.toISOString() : undefined;
      const dest = data.out ? (data.destination || '').trim() : undefined;
      const note = data.out ? (data.note || '').trim() : undefined;

      const payload = {
        residentId: resident._id,
        organizationId,
        out: data.out,
        destination: dest,
        note,
        expectedReturnAt: isoReturn,
      };

      const result = await updateResidentOut(payload).unwrap();

      const updatedResident = {
        ...resident,
        ...(result || {}),
        out: data.out,
        isOut: data.out,
        outOfFacility: data.out,
        outOfHome: data.out,
        destination: dest || '',
        outDestination: dest || '',
        note: note || '',
        outNote: note || '',
        expectedReturnAt: isoReturn || null,
      };

      onSave?.(updatedResident);

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

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" color="primary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isLoading}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

ResidentOutDialog.propTypes = {
  open: PropTypes.bool,
  resident: PropTypes.object,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  organizationId: PropTypes.string,
};
