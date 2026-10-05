import { useState } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export function GazetteMessageFamilyDialog({ open, onClose, resident }) {
  const [message, setMessage] = useState(
    `Hello from Florence House! Issue 14 of the family gazette closes in 3 days. Please share a photo or message for ${resident?.resident || 'your loved one'} via the family app.`
  );

  if (!resident) return null;

  const handleSend = () => {
    toast.success(`Reminder sent to family of ${resident.resident}`);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="solar:letter-bold" width={22} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>
            Message Family · {resident.resident}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Alert severity="info" variant="outlined">
            {resident.resident} currently has 0 approved messages for Issue 14. Prompting their family now ensures their gazette won't be empty.
          </Alert>

          <TextField
            label="Notification Message (SMS & App Push)"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="solar:plain-bold" />}
          onClick={handleSend}
        >
          Send Reminder
        </Button>
      </DialogActions>
    </Dialog>
  );
}

GazetteMessageFamilyDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  resident: PropTypes.object,
};
