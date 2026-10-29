import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { toast } from 'src/components/snackbar';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useCreateFamilyNewsletterMutation } from 'src/store/Reducer/family-newsletters-api';

import { getAllowedNewsletterMonths, getNewsletterId } from './utils';

// ----------------------------------------------------------------------

const mapBranchOption = (branch) => ({
  value: branch._id,
  label: branch.name,
});

export function NewsletterCreateDialog({
  open,
  onClose,
  organizationId,
  isOwner,
  defaultBranchId,
  defaultBranchName,
  onCreated,
}) {
  const monthOptions = useMemo(() => getAllowedNewsletterMonths(), []);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [month, setMonth] = useState(monthOptions[0]?.value || '');
  const [createFamilyNewsletter, { isLoading }] = useCreateFamilyNewsletterMutation();
  const branchQueryArgs = useMemo(() => ({ organizationId }), [organizationId]);

  useEffect(() => {
    if (!open) return;
    setMonth(getAllowedNewsletterMonths()[0]?.value || '');
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
    if (!month) {
      toast.error('Please select a month');
      return;
    }

    try {
      const result = await createFamilyNewsletter({ organizationId, branchId, month }).unwrap();
      const created = result?.data || result;
      toast.success(result?.message || 'Newsletter created');
      onCreated?.(getNewsletterId(created), { ...created, branchId, month });
      onClose?.();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to create newsletter');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>
          Create newsletter
        </Typography>
        <IconButton onClick={handleClose} size="small" disabled={isLoading}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <Stack spacing={2.5}>
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

          <TextField
            select
            fullWidth
            label="Month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            helperText="Current month or previous month only"
          >
            {monthOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
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
          disabled={isLoading || !selectedBranch?.value || !month}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

NewsletterCreateDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  organizationId: PropTypes.string,
  isOwner: PropTypes.bool,
  defaultBranchId: PropTypes.string,
  defaultBranchName: PropTypes.string,
  onCreated: PropTypes.func,
};
