import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { useUpdateResidentRestrictionMutation } from 'src/store/Reducer/residents-api';

// ----------------------------------------------------------------------

const getErrorMessage = (error) =>
  error?.data?.message ||
  error?.data?.msg ||
  error?.data?.error ||
  error?.error ||
  error?.message ||
  'Failed to update resident restriction.';

const RestrictionSchema = zod
  .object({
    restricted: zod.boolean(),
    reason: zod.string().optional(),
  })
  .refine(
    (data) => {
      if (data.restricted) {
        return Boolean(data.reason && data.reason.trim().length > 0);
      }
      return true;
    },
    {
      message: 'Reason is required when restriction is active.',
      path: ['reason'],
    }
  );

// ----------------------------------------------------------------------

export function ResidentRestrictionDialog({
  open,
  resident,
  onClose,
  onSave,
  organizationId = null,
}) {
  const [updateRestriction, { isLoading }] = useUpdateResidentRestrictionMutation();

  const defaultValues = useMemo(
    () => ({
      restricted: Boolean(resident?.restricted),
      reason: resident?.restrictionReason || resident?.reason || '',
    }),
    [resident]
  );

  const methods = useForm({
    mode: 'onTouched',
    resolver: zodResolver(RestrictionSchema),
    defaultValues,
  });

  const { watch, setValue } = methods;
  const restrictedValue = watch('restricted');

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
      const payload = {
        residentId: resident._id,
        organizationId,
        restricted: data.restricted,
        reason: data.restricted ? data.reason?.trim() : undefined,
      };

      const result = await updateRestriction(payload).unwrap();

      onSave?.({
        ...resident,
        ...result,
        restricted: data.restricted,
        restrictionReason: data.restricted ? data.reason?.trim() : '',
        reason: data.restricted ? data.reason?.trim() : '',
      });

      toast.success(
        data.restricted ? 'Resident marked as restricted.' : 'Resident restriction removed.'
      );
      handleClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
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
                Room {resident.roomNumber || '—'} &bull; Resident Restriction
              </Typography>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Set visiting or access restrictions for this resident.
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={restrictedValue}
                  onChange={(event) =>
                    setValue('restricted', event.target.checked, { shouldValidate: true })
                  }
                />
              }
              label={restrictedValue ? 'Restricted' : 'Not Restricted'}
            />

            {restrictedValue && (
              <Field.Text
                name="reason"
                label="Restriction Reason"
                placeholder="e.g. No visits from the named person"
                multiline
                rows={3}
                helperText="Specify the restriction instructions or visiting limitations."
              />
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
