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
import { useRescheduleSupervisionMutation } from 'src/store/Reducer/supervision-api';

// ----------------------------------------------------------------------

function splitActionPointText(text) {
  if (!text || typeof text !== 'string') return [];
  // Normalize bullet markers (•, -, *, ⁃) and numbered prefixes (1., 2), etc.)
  const normalized = text
    .replace(/^\s*[\u2022\u2023\u25E6\u2043\u2219\*\-]\s+/gm, '\n')
    .replace(/^\s*\d+[\.\)]\s+/gm, '\n');

  return normalized
    .split(/\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function CompleteSupervisionDialog({ open, row, organizationId, onClose, onSave }) {
  const [topics, setTopics] = useState('');
  const [actionPointsList, setActionPointsList] = useState(['']);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const [updateSupervision, { isLoading: isSubmitting }] = useRescheduleSupervisionMutation();

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
      setTopics(
        Array.isArray(row?.topics)
          ? row.topics.filter(Boolean).join('\n')
          : typeof row?.topics === 'string'
          ? row.topics
          : ''
      );
      setNotes(row?.notes || '');
      const rawPoints = Array.isArray(row?.actionPoints)
        ? row.actionPoints
            .map((ap) => (typeof ap === 'string' ? ap : ap?.text || ap?.description || ''))
            .filter(Boolean)
        : typeof row?.actionPoints === 'string'
        ? splitActionPointText(row.actionPoints)
        : [];
      setActionPointsList(rawPoints.length > 0 ? rawPoints : ['']);
      setError('');
      setTouched(false);
    }
  }, [open, row]);

  const handleReset = () => {
    setTopics('');
    setActionPointsList(['']);
    setNotes('');
    setError('');
    setTouched(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleAddActionPoint = () => {
    setActionPointsList((prev) => [...prev, '']);
  };

  const handleRemoveActionPoint = (index) => {
    setActionPointsList((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : [''];
    });
  };

  const handleChangeActionPoint = (index, value) => {
    setActionPointsList((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handlePasteActionPoint = (index, event) => {
    const pasteText = event.clipboardData?.getData('text');
    if (!pasteText) return;

    const lines = splitActionPointText(pasteText);
    if (lines.length > 1) {
      event.preventDefault();
      setActionPointsList((prev) => {
        const updated = [...prev];
        updated.splice(index, 1, ...lines);
        return updated;
      });
    }
  };

  const validActionPoints = actionPointsList.map((a) => a.trim()).filter(Boolean);
  const isTopicsInvalid = touched && !topics.trim();
  const isNotesInvalid = touched && !notes.trim();
  const isActionsInvalid = touched && validActionPoints.length === 0;

  const handleComplete = async () => {
    setTouched(true);

    if (!topics.trim() || !notes.trim() || validActionPoints.length === 0) {
      return;
    }

    const supervisionId = row?.upcoming?._id || row?.supervisionId || row?._id || row?.id;

    if (!supervisionId) {
      setError('Supervision session ID not found');
      return;
    }

    try {
      setError('');

      // Format topics into an array of non-empty strings
      const topicsArray = (topics || '')
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        organizationId,
        supervisionId,
        status: 'completed',
        topics: topicsArray,
        notes: notes.trim(),
        actionPoints: validActionPoints,
      };

      const res = await updateSupervision(payload).unwrap();

      const successMsg = res?.message || res?.msg || 'Supervision saved';
      toast.success(successMsg);

      await onSave?.(res);
      handleClose();
    } catch (err) {
      console.error('Failed to complete session:', err);
      const errMsg =
        err?.data?.message || err?.data?.msg || err?.message || 'Failed to complete session';
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">Complete Supervision Session</Typography>
          <Typography variant="body2" color="text.secondary">
            Log session outcomes and agreed action points
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

          {/* Discussion Topics */}
          <TextField
            required
            fullWidth
            multiline
            rows={2}
            label="Topics"
            placeholder="e.g. Wellbeing, Training"
            helperText={
              isTopicsInvalid
                ? 'Topics are required'
                : 'Enter one topic per line'
            }
            error={isTopicsInvalid}
            value={topics}
            disabled={isSubmitting}
            onChange={(e) => setTopics(e.target.value)}
          />

          {/* Notes */}
          <TextField
            required
            fullWidth
            multiline
            rows={2}
            label="Notes"
            placeholder="e.g. Meeting held"
            helperText={isNotesInvalid ? 'Notes are required' : ''}
            error={isNotesInvalid}
            value={notes}
            disabled={isSubmitting}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Agreed Action Points */}
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: isActionsInvalid ? 'error.main' : 'text.secondary',
                }}
              >
                Action Points *
              </Typography>
              <Button
                size="small"
                color="primary"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={handleAddActionPoint}
                disabled={isSubmitting}
                sx={{ typography: 'caption', fontWeight: 600 }}
              >
                Add Action Point
              </Button>
            </Stack>

            <Stack spacing={1}>
              {actionPointsList.map((point, index) => (
                <Stack key={index} direction="row" spacing={1} alignItems="center">
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={`Action point ${index + 1}`}
                    value={point}
                    disabled={isSubmitting}
                    error={isActionsInvalid && index === 0 && !point.trim()}
                    onChange={(e) => handleChangeActionPoint(index, e.target.value)}
                    onPaste={(e) => handlePasteActionPoint(index, e)}
                    InputProps={{
                      startAdornment: (
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.disabled', mr: 1, minWidth: 16, fontWeight: 700 }}
                        >
                          {index + 1}.
                        </Typography>
                      ),
                    }}
                  />
                  {actionPointsList.length > 1 && (
                    <IconButton
                      size="small"
                      color="error"
                      disabled={isSubmitting}
                      onClick={() => handleRemoveActionPoint(index)}
                      sx={{ flexShrink: 0 }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                    </IconButton>
                  )}
                </Stack>
              ))}
            </Stack>

            {isActionsInvalid ? (
              <Typography variant="caption" color="error">
                At least one action point is required
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Enter each point separately, or paste a list/paragraph to auto-split
              </Typography>
            )}
          </Stack>
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

CompleteSupervisionDialog.propTypes = {
  open: PropTypes.bool,
  row: PropTypes.object,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
};