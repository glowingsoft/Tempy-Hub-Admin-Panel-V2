import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
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
import CircularProgress from '@mui/material/CircularProgress';

import { Field, Form } from 'src/components/hook-form';

import { EVACUATION_TYPE_OPTIONS } from './mocks/data';

// ----------------------------------------------------------------------

const Schema = zod.object({
  type: zod.enum(['mock', 'real'], { required_error: 'Select a type' }),
  branchId: zod.string().optional(),
});

/**
 * Start evacuation (real vs mock).
 * POST /admin/organizations/:organizationId/evacuations { branchId, type }
 */
export function StartEvacuationDialog({
  open,
  onClose,
  onStart,
  branchLabel,
  onSiteTotal = 0,
  branches = [],
  currentBranchId,
  loading = false,
}) {
  const showBranchSelect = !currentBranchId && branches.length > 0;

  const defaultValues = useMemo(
    () => ({
      type: 'mock',
      branchId: currentBranchId || '',
    }),
    [currentBranchId]
  );

  const methods = useForm({
    resolver: zodResolver(Schema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      methods.reset(defaultValues);
    }
  }, [open, defaultValues, methods]);

  const handleClose = () => {
    methods.reset(defaultValues);
    onClose();
  };

  const onSubmit = methods.handleSubmit(async (data) => {
    const chosenBranchId = currentBranchId || data.branchId;
    if (!chosenBranchId) {
      methods.setError('branchId', { message: 'Please select a site' });
      return;
    }
    const success = await onStart?.({
      branchId: chosenBranchId,
      type: data.type,
    });
    if (success !== false) {
      handleClose();
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Start evacuation</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {branchLabel || 'Current site'}
              {onSiteTotal != null ? ` · ${onSiteTotal} people on site will be seeded into rollcall.` : ''}
            </Typography>

            {showBranchSelect && (
              <Field.Select name="branchId" label="Site / Branch" required>
                <MenuItem value="" disabled>
                  Select a site
                </MenuItem>
                {branches.map((b) => (
                  <MenuItem key={b._id} value={b._id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Field.Select>
            )}

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
          <Button color="inherit" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loading ? 'Starting...' : 'Start evacuation'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

StartEvacuationDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onStart: PropTypes.func,
  branchLabel: PropTypes.string,
  onSiteTotal: PropTypes.number,
  branches: PropTypes.array,
  currentBranchId: PropTypes.string,
  loading: PropTypes.bool,
};