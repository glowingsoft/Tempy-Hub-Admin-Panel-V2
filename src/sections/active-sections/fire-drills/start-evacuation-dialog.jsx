import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Field, Form } from 'src/components/hook-form';

import { EVACUATION_TYPE_OPTIONS } from './mocks/data';

// ----------------------------------------------------------------------

const Schema = zod.object({
  type: zod.enum(['mock', 'real'], { required_error: 'Select a type' }),
});

/**
 * Start evacuation (real vs mock).
 * API later: POST FIRE_DRILL_API.start  body { branchId, type }
 */
export function StartEvacuationDialog({ open, onClose, onStart, branchLabel, onSiteTotal = 0 }) {
  const methods = useForm({
    resolver: zodResolver(Schema),
    defaultValues: { type: 'mock' },
  });

  useEffect(() => {
    if (open) methods.reset({ type: 'mock' });
  }, [open, methods]);

  const handleClose = () => {
    methods.reset({ type: 'mock' });
    onClose();
  };

  const onSubmit = methods.handleSubmit((data) => {
    onStart?.(data);
    handleClose();
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Start evacuation</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {branchLabel || 'Current site'} · {onSiteTotal} people on site will be seeded into
              rollcall.
            </Typography>

            <Field.Select name="type" label="Type">
              {EVACUATION_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            {methods.watch('type') === 'real' && (
              <Alert severity="error" variant="outlined">
                Real emergency notifies staff immediately. Use only for live incidents.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="error">
            Start evacuation
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
