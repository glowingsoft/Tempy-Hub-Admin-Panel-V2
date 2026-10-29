import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { toast } from 'src/components/snackbar';
import { useCreateFamilyGazetteMutation } from 'src/store/Reducer/family-gazettes-api';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';

// ----------------------------------------------------------------------

const mapBranchOption = (branch) => ({
  value: branch._id,
  label: branch.name,
});

export function GazetteCreateDialog({
  open,
  onClose,
  organizationId,
  isOwner,
  defaultBranchId,
  defaultBranchName,
  onCreated,
}) {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [createFamilyGazette, { isLoading }] = useCreateFamilyGazetteMutation();

  const branchQueryArgs = useMemo(() => ({ organizationId }), [organizationId]);

  useEffect(() => {
    if (!open) return;

    if (defaultBranchId) {
      setSelectedBranch({
        value: defaultBranchId,
        label: defaultBranchName || 'Selected site',
      });
      return;
    }

    setSelectedBranch(null);
  }, [open, defaultBranchId, defaultBranchName]);

  const handleClose = () => {
    if (isLoading) return;
    onClose?.();
  };

  const handleCreate = async () => {
    const branchId = selectedBranch?.value;
    if (!organizationId) {
      toast.error('Organization is missing');
      return;
    }
    if (!branchId) {
      toast.error('Please select a site');
      return;
    }

    try {
      await createFamilyGazette({ organizationId, branchId }).unwrap();
      toast.success('Gazettes created for the selected site');
      onCreated?.(branchId);
      onClose?.();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to create gazettes');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>
          Create gazettes
        </Typography>
        <IconButton onClick={handleClose} size="small" disabled={isLoading}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Choose the site to generate the current gazette issue.
          </Typography>

          <InfiniteAutocomplete
            value={selectedBranch}
            onChange={setSelectedBranch}
            useQuery={useGetBranchesQuery}
            queryArgs={branchQueryArgs}
            mapOption={mapBranchOption}
            enabled={open && isOwner && Boolean(organizationId)}
            disabled={!isOwner || isLoading}
            label="Site"
            placeholder="Select site"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          disabled={isLoading || !selectedBranch?.value}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Create gazettes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

GazetteCreateDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  organizationId: PropTypes.string,
  isOwner: PropTypes.bool,
  defaultBranchId: PropTypes.string,
  defaultBranchName: PropTypes.string,
  onCreated: PropTypes.func,
};
