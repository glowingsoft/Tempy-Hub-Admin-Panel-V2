import { useEffect, useState } from 'react';

import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';

import { fDate } from 'src/utils/format-time';

import { ConfirmDialog } from 'src/components/custom-dialog';

import { getLeaveRequestStaffName } from './utils';
import { getLeaveTypeLabel } from './mocks/data';

// ----------------------------------------------------------------------
// Shared confirm dialog for approve + reject. Driven by `dialogProps` from
// `useLeaveRequestActions`. Reject collects an optional decision note.
// ----------------------------------------------------------------------

export function LeaveRequestActionDialog({ open, mode = 'approve', request, loading, onClose, onConfirm }) {
  const isReject = mode === 'reject';
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) setNote('');
  }, [open]);

  if (!request) {
    return <ConfirmDialog open={open} onClose={onClose} title="" content={null} action={null} />;
  }

  const who = getLeaveRequestStaffName(request);
  const range = `${fDate(request.startDate)} – ${fDate(request.endDate)}`;
  const days = `${request.totalDays} day${request.totalDays === 1 ? '' : 's'}`;

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={isReject ? 'Reject leave request' : 'Approve leave request'}
      content={
        isReject ? (
          <>
            Reject the <strong>{getLeaveTypeLabel(request.leaveType)}</strong> leave for{' '}
            <strong style={{ textTransform: 'capitalize' }}>{who}</strong> ({range}, {days})?
            <TextField
              autoFocus
              fullWidth
              multiline
              rows={3}
              label="Reason (optional)"
              placeholder="e.g. Not enough cover that day"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              sx={{ mt: 2 }}
            />
          </>
        ) : (
          <>
            Approve the <strong>{getLeaveTypeLabel(request.leaveType)}</strong> leave for{' '}
            <strong style={{ textTransform: 'capitalize' }}>{who}</strong> ({range}, {days})?
          </>
        )
      }
      action={
        <LoadingButton
          variant="contained"
          color={isReject ? 'error' : 'success'}
          loading={loading}
          onClick={() => onConfirm(note.trim())}
        >
          {isReject ? 'Reject' : 'Approve'}
        </LoadingButton>
      }
    />
  );
}
