import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ConfigureModulesDialog({ open, onClose, onConfigureNow, onLater }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Organization created</DialogTitle>

      <DialogContent>
        <DialogContentText>
          Do you want to configure module access now or later?
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onLater}>
          Later
        </Button>

        <Button
          variant="contained"
          onClick={onConfigureNow}
          startIcon={<Iconify icon="solar:settings-bold" />}
        >
          Configure Now
        </Button>
      </DialogActions>
    </Dialog>
  );
}
