import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';

import { fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { getFeedbackStatusMeta } from './mocks/data';

// ----------------------------------------------------------------------

function RespondFeedbackDialog({ open, row, onClose, onSave }) {
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const isResolved = row?.status === 'resolved';

  useEffect(() => {
    if (open) {
      setResponse(row?.response || '');
      setError('');
    }
  }, [open, row]);

  const handleSave = () => {
    if (!response.trim()) {
      setError('Add a response before marking this as resolved');
      return;
    }
    onSave?.(response.trim());
  };

  if (!row) return null;

  const status = getFeedbackStatusMeta(row.status);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">{row.residentName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.submittedBy} · {row.site} · {fDateTime(row.submittedAt)}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Label color="default">{row.category}</Label>
            <Label color={status.color}>{status.label}</Label>
          </Stack>

          <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'background.neutral' }}>
            <Typography variant="body2">{row.message}</Typography>
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />

          {isResolved ? (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Response sent {fDateTime(row.respondedAt)}
              </Typography>
              <Typography variant="body2">{row.response}</Typography>
            </Box>
          ) : (
            <TextField
              label="Your response"
              placeholder="Let them know what you found and what, if anything, you're doing about it"
              value={response}
              onChange={(event) => setResponse(event.target.value)}
              multiline
              rows={4}
              fullWidth
              error={!!error}
              helperText={error}
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          {isResolved ? 'Close' : 'Cancel'}
        </Button>
        {!isResolved && (
          <Button variant="contained" color="inherit" onClick={handleSave}>
            Send response
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default RespondFeedbackDialog;

RespondFeedbackDialog.propTypes = {
  open: PropTypes.bool,
  row: PropTypes.object,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
};
