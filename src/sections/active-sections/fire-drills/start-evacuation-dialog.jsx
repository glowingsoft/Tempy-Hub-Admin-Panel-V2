import { useEffect, useMemo, useState } from 'react';
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
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetKiosksQuery } from 'src/store/Reducer/kiosks-api';

import { EVACUATION_TYPE_OPTIONS } from './view/fire-drills-view';

// ----------------------------------------------------------------------

const mapBranchOption = (item) => ({
  value: item._id,
  label: item.name,
});

// ----------------------------------------------------------------------

const Schema = zod.object({
  type: zod.enum(['mock', 'real'], { required_error: 'Select a type' }),
  branchId: zod.string().optional(),
  kioskId: zod.string().optional(),
});

/**
 * Start evacuation (real vs mock).
 * POST /admin/organizations/:organizationId/evacuations { branchId, type, locationLabel, receptionIdentifier }
 */
export function StartEvacuationDialog({
  open,
  onClose,
  onStart,
  branchLabel,
  onSiteTotal = 0,
  currentBranchId,
  loading = false,
}) {
  const { organizationId } = useCurrentOrganization();
  const showBranchSelect = !currentBranchId;
  const [selectedBranch, setSelectedBranch] = useState(null);
  const branchQueryArgs = useMemo(() => ({ organizationId }), [organizationId]);

  const defaultValues = useMemo(
    () => ({
      type: 'mock',
      branchId: currentBranchId || '',
      kioskId: '',
    }),
    [currentBranchId]
  );

  const methods = useForm({
    resolver: zodResolver(Schema),
    defaultValues,
  });

  const currentBranchIdVal = methods.watch('branchId');
  const activeBranchId = currentBranchId || currentBranchIdVal;

  const { data: kiosksResponse, isLoading: isKiosksLoading } = useGetKiosksQuery(
    {
      organizationId,
      branchId: activeBranchId,
      limit: 100,
    },
    { skip: !open || !organizationId || !activeBranchId }
  );

  // Show only the selected branch's kiosks
  const kiosks = useMemo(() => {
    const list = Array.isArray(kiosksResponse?.data) ? kiosksResponse.data : [];
    if (!activeBranchId) return [];
    return list.filter((kiosk) => {
      const bId =
        kiosk.branchId?._id ||
        kiosk.branchId ||
        kiosk.branch?._id ||
        (typeof kiosk.branch === 'string' ? kiosk.branch : '') ||
        kiosk.siteId ||
        '';
      return !bId || String(bId) === String(activeBranchId);
    });
  }, [kiosksResponse, activeBranchId]);

  const selectedDialogOption = useMemo(() => {
    if (!currentBranchIdVal) return null;
    if (selectedBranch?.value === currentBranchIdVal) return selectedBranch;
    return { value: currentBranchIdVal, label: selectedBranch?.label || 'Selected site' };
  }, [currentBranchIdVal, selectedBranch]);

  useEffect(() => {
    if (open) {
      methods.reset(defaultValues);
      setSelectedBranch(null);
    }
  }, [open, defaultValues, methods]);

  // Reset kiosk if branch changes in the dialog
  useEffect(() => {
    if (showBranchSelect) {
      methods.setValue('kioskId', '');
    }
  }, [currentBranchIdVal, showBranchSelect, methods]);

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

    const selectedKiosk = data.kioskId
      ? kiosks.find((k) => String(k._id || k.id) === String(data.kioskId))
      : null;

    const success = await onStart?.({
      branchId: chosenBranchId,
      type: data.type,
      locationLabel: selectedKiosk?.locationLabel || '',
      receptionIdentifier: selectedKiosk?.receptionIdentifier || '',
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
              <InfiniteAutocomplete
                value={selectedDialogOption}
                onChange={(option) => {
                  setSelectedBranch(option);
                  methods.setValue('branchId', option?.value || '', { shouldValidate: true });
                }}
                useQuery={useGetBranchesQuery}
                queryArgs={branchQueryArgs}
                mapOption={mapBranchOption}
                label="Site / Branch"
                placeholder="Search and select site..."
                error={Boolean(methods.formState.errors.branchId)}
                helperText={methods.formState.errors.branchId?.message}
                disabled={!organizationId}
                size="small"
              />
            )}

            <Field.Select name="type" label="Type">
              {EVACUATION_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select
              name="kioskId"
              label="Kiosk (optional)"
              disabled={!activeBranchId || isKiosksLoading}
              helperText={
                !activeBranchId
                  ? 'Select a site first to load kiosks'
                  : isKiosksLoading
                  ? 'Loading site kiosks...'
                  : kiosks.length === 0
                  ? 'No kiosks registered for this site'
                  : undefined
              }
            >
              <MenuItem value="">None (General site evacuation)</MenuItem>
              {kiosks.map((kiosk) => {
                const kid = String(kiosk._id || kiosk.id || '');
                const loc = kiosk.locationLabel || '';
                const rec = kiosk.receptionIdentifier || '';
                let label = '';
                if (loc && rec) {
                  label = `${loc} - ${rec}`;
                } else {
                  label = loc || rec || 'Kiosk';
                }

                return (
                  <MenuItem key={kid} value={kid}>
                    {label}
                  </MenuItem>
                );
              })}
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
  currentBranchId: PropTypes.string,
  loading: PropTypes.bool,
};
