import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { useUpdateAppraisalMutation } from 'src/store/Reducer/appraisals-api';

// ----------------------------------------------------------------------

export function CompleteAppraisalDialog({ open, row, organizationId, onClose, onSave }) {
  const [managerComments, setManagerComments] = useState('');
  const [goals, setGoals] = useState('');
  const [trainingNeeds, setTrainingNeeds] = useState('');
  const [actionPoints, setActionPoints] = useState('');
  const [error, setError] = useState('');

  const [updateAppraisal, { isLoading: isSubmitting }] = useUpdateAppraisalMutation();

  const staffObj =
    (typeof row?.staff === 'object' ? row.staff : null) ||
    (typeof row?.staffProfile === 'object' ? row.staffProfile : null) ||
    (typeof row?.staffUser === 'object' ? row.staffUser : null) ||
    (typeof row?.staffId === 'object' ? row.staffId : null) ||
    (typeof row?.user === 'object' ? row.user : null) ||
    (typeof row?.userId === 'object' ? row.userId : null) ||
    {};

  const staffUser =
    (typeof staffObj.user === 'object' ? staffObj.user : null) ||
    (typeof staffObj.userId === 'object' ? staffObj.userId : null) ||
    {};

  const isMongoId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);

  const rawStaffName =
    row?.name ||
    row?.staffName ||
    staffObj.name ||
    staffUser.name ||
    (typeof row?.userId === 'object' ? row?.userId?.name : null) ||
    (typeof row?.user === 'object' ? row?.user?.name : null);

  const staffName =
    rawStaffName && !isMongoId(rawStaffName)
      ? rawStaffName
      : staffObj.employeeCode || row?.employeeCode || '—';

  const staffEmail =
    staffObj.email ||
    staffUser.email ||
    row?.email ||
    (typeof row?.userId === 'object' ? row?.userId?.email : null) ||
    (typeof row?.user === 'object' ? row?.user?.email : null) ||
    (typeof row?.staffId === 'object' ? row?.staffId?.email : null) ||
    '';

  useEffect(() => {
    if (open) {
      setManagerComments(row?.managerComments || row?.notes || '');
      setGoals(row?.goals || '');
      setTrainingNeeds(row?.trainingNeeds || '');
      setActionPoints(
        Array.isArray(row?.actionPoints)
          ? row.actionPoints
              .map((ap) => (typeof ap === 'string' ? ap : ap?.text || ap?.description || ''))
              .filter(Boolean)
              .join('\n')
          : ''
      );
      setError('');
    }
  }, [open, row]);

  const handleReset = () => {
    setManagerComments('');
    setGoals('');
    setTrainingNeeds('');
    setActionPoints('');
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleComplete = async () => {
    const appraisalId =
      row?.upcoming?._id ||
      row?.upcoming?.id ||
      row?.appraisalId ||
      row?._id ||
      row?.id;

    if (!appraisalId) {
      setError('Appraisal session ID not found');
      return;
    }

    try {
      setError('');

      // Format action points into an array of strings
      const actionPointsArray = (actionPoints || '')
        .split('\n')
        .map((a) => a.trim())
        .filter(Boolean);

      const payload = {
        organizationId,
        appraisalId,
        status: 'completed',
        managerComments: managerComments.trim() || 'Meeting held',
        goals: goals.trim() || 'Complete NVQ',
        trainingNeeds: trainingNeeds.trim() || 'Medication refresher',
        actionPoints: actionPointsArray.length > 0 ? actionPointsArray : ['Book the next review'],
      };

      const res = await updateAppraisal(payload).unwrap();

      const successMsg = res?.message || res?.msg || 'Appraisal completed successfully';
      toast.success(successMsg);

      await onSave?.(res);
      handleClose();
    } catch (err) {
      console.error('Failed to complete appraisal session:', err);
      const errMsg =
        err?.data?.message || err?.data?.msg || err?.message || 'Failed to complete appraisal session';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">Complete Appraisal Session</Typography>
          <Typography variant="body2" color="text.secondary">
            Log appraisal outcomes, goals, training needs, and action points
          </Typography>
        </Stack>
        <IconButton onClick={handleClose} size="small" disabled={isSubmitting}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Staff Info Banner */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: 'background.neutral',
            }}
          >
            <Typography variant="subtitle2" noWrap>
              {staffName}
            </Typography>
            {staffEmail && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {staffEmail}
              </Typography>
            )}
          </Box>

          {/* Manager Comments */}
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Manager Comments"
            placeholder="e.g. Meeting held"
            value={managerComments}
            disabled={isSubmitting}
            onChange={(e) => setManagerComments(e.target.value)}
          />

          {/* Goals */}
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Goals"
            placeholder="e.g. Complete NVQ"
            value={goals}
            disabled={isSubmitting}
            onChange={(e) => setGoals(e.target.value)}
          />

          {/* Training Needs */}
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Training Needs"
            placeholder="e.g. Medication refresher"
            value={trainingNeeds}
            disabled={isSubmitting}
            onChange={(e) => setTrainingNeeds(e.target.value)}
          />

          {/* Action Points */}
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Action Points"
            placeholder="e.g. Book the next review"
            helperText="Enter one action point per line"
            value={actionPoints}
            disabled={isSubmitting}
            onChange={(e) => setActionPoints(e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          color="success"
          onClick={handleComplete}
          loading={isSubmitting}
          startIcon={<Iconify icon="solar:check-circle-bold" />}
        >
          Complete Session
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

CompleteAppraisalDialog.propTypes = {
  open: PropTypes.bool,
  row: PropTypes.object,
  organizationId: PropTypes.string,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
};