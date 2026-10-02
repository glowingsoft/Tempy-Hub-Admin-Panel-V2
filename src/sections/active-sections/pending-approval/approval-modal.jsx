// approval-modal.jsx

import { useEffect, useState } from 'react';

import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

const STATUS_COLOR = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

function DetailRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.75 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
        {value || '—'}
      </Typography>
    </Stack>
  );
}

DetailRow.propTypes = {
  label: PropTypes.string,
  value: PropTypes.node,
};

// ----------------------------------------------------------------------

export function ApprovalModal({ open, request, onClose, onApprove, onReject }) {
  const [comment, setComment] = useState('');
  const [mode, setMode] = useState(null); // 'reject' when the reject action needs a comment first
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setComment('');
      setMode(null);
      setError('');
    }
  }, [open]);

  if (!request) return null;

  const handleApprove = () => {
    onApprove?.(request, comment);
  };

  const handleRejectClick = () => {
    if (mode !== 'reject') {
      setMode('reject');
      return;
    }

    if (!comment.trim()) {
      setError('Add a reason before rejecting this request.');
      return;
    }

    onReject?.(request, comment);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Review request
        <IconButton onClick={onClose}>
          <Iconify icon="solar:close-circle-bold" width={22} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {request.employeeName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {request.department}
            </Typography>
          </Box>
          <Label color={STATUS_COLOR[request.status] || 'default'} sx={{ borderRadius: 1 }}>
            {request.status}
          </Label>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <DetailRow label="Request type" value={request.requestType} />
        <DetailRow label="Date" value={request.date} />
        <DetailRow label="Requested change" value={request.requestedChange} />
        <DetailRow label="Submitted on" value={request.submittedOn} />

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
          Employee's reason
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {request.reason || 'No reason provided.'}
        </Typography>

        {mode === 'reject' && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for rejection"
            placeholder="Let the employee know why this request is being rejected"
            value={comment}
            onChange={(event) => {
              setComment(event.target.value);
              if (error) setError('');
            }}
            error={!!error}
            helperText={error}
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="outlined"
          color="error"
          startIcon={<Iconify icon="solar:close-circle-bold" />}
          onClick={handleRejectClick}
        >
          {mode === 'reject' ? 'Confirm reject' : 'Reject'}
        </Button>

        <Button
          variant="contained"
          color="success"
          startIcon={<Iconify icon="solar:check-circle-bold" />}
          onClick={handleApprove}
          disabled={mode === 'reject'}
        >
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ApprovalModal.propTypes = {
  open: PropTypes.bool,
  request: PropTypes.object,
  onClose: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
};