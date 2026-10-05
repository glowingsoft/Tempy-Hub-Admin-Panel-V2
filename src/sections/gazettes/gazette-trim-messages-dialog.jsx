import { useState } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export function GazetteTrimMessagesDialog({ open, onClose, resident, onSaved }) {
  const [selectedCount, setSelectedCount] = useState(30);

  if (!resident) return null;

  const handleSave = () => {
    toast.success(`Updated ${resident.resident}'s gazette to 30 selected messages. Status changed to Ready.`);
    onSaved?.(resident.id);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="solar:checklist-minimalistic-bold" width={22} sx={{ color: 'warning.main' }} />
          <Typography variant="h6" fontWeight={700}>
            Choose Messages to Keep · {resident.resident}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Alert severity="warning" variant="outlined">
            {resident.resident} has <strong>{resident.messages} messages</strong>, which exceeds the 30-message layout maximum for standard 4-page gazette printing.
          </Alert>

          <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Selection Summary
              </Typography>
              <Chip
                label={`${selectedCount} / 30 selected`}
                color="primary"
                size="small"
                variant="filled"
              />
            </Stack>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              The 30 newest approved family messages and greetings have been selected automatically. Earliest 1 overflow message will be archived for Issue 15.
            </Typography>

            <FormControlLabel
              control={<Checkbox checked disabled color="primary" />}
              label={
                <Typography variant="body2" fontWeight={600}>
                  Auto-select top 30 messages (prioritize direct children & photos)
                </Typography>
              }
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
        >
          Confirm 30 Messages & Mark Ready
        </Button>
      </DialogActions>
    </Dialog>
  );
}

GazetteTrimMessagesDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  resident: PropTypes.object,
  onSaved: PropTypes.func,
};
