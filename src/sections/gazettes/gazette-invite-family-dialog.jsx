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

export function GazetteInviteFamilyDialog({ open, onClose, resident, onInvited }) {
  const [relativeName, setRelativeName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');

  if (!resident) return null;

  const handleSend = () => {
    if (!relativeName || !emailOrPhone) {
      toast.error('Please enter the relative name and email or phone number');
      return;
    }

    toast.success(`Invitation sent to ${relativeName} for ${resident.resident}`);
    onInvited?.(resident.id);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="solar:user-plus-bold" width={22} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>
            Invite Family · {resident.resident}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Alert severity="info" variant="outlined">
            {resident.resident} (Room {resident.room}) currently has no family members linked to their profile. Inviting relatives connects them to the family portal and gazette submissions.
          </Alert>

          <TextField
            label="Relative Name"
            placeholder="e.g. David Hill (Son)"
            value={relativeName}
            onChange={(e) => setRelativeName(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Email or Mobile Phone Number"
            placeholder="e.g. david.hill@example.com or +44 7700 900123"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            fullWidth
            required
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
          disabled={!relativeName.trim() || !emailOrPhone.trim()}
        >
          Send Invite Link
        </Button>
      </DialogActions>
    </Dialog>
  );
}

GazetteInviteFamilyDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  resident: PropTypes.object,
  onInvited: PropTypes.func,
};
