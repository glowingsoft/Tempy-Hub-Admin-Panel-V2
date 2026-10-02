import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function DisapprovePhotoDialog({
  open,
  onClose,
  photo,
  onConfirm,
}) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setReason(photo?.rejectionReason || '');
    }
  }, [open, photo]);

  if (!photo) return null;

  const handleConfirm = () => {
    onConfirm(photo, reason.trim());
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5 }}>
        <Iconify icon="solar:danger-triangle-bold" sx={{ color: 'error.main', width: 24, height: 24 }} />
        <Typography variant="subtitle1" fontWeight={700}>
          Disapprove Photo
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {/* Photo & Resident Preview Card */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            p: 1.5,
            mb: 2,
            borderRadius: 1.5,
            bgcolor: 'background.neutral',
          }}
        >
          <Box
            component="img"
            src={photo.thumbnail}
            alt={photo.caption}
            sx={{
              width: 52,
              height: 52,
              borderRadius: 1,
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />

          <Stack spacing={0.25} sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {photo.residentName} (Room {photo.room})
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Caption: &ldquo;{photo.caption}&rdquo;
            </Typography>
            <Typography variant="caption" color="text.disabled" noWrap>
              {photo.uploadedBy}
            </Typography>
          </Stack>
        </Stack>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          Are you sure you want to disapprove this photo? Please provide a reason for the carer or activities team:
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Reason for disapproval (optional)"
          placeholder="e.g. Consent missing, poor lighting, inappropriate photo, duplicate upload"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          startIcon={<Iconify icon="solar:close-circle-bold" />}
          onClick={handleConfirm}
        >
          Disapprove
        </Button>
      </DialogActions>
    </Dialog>
  );
}

DisapprovePhotoDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  photo: PropTypes.object,
  onConfirm: PropTypes.func,
};
