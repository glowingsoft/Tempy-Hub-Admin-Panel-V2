import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Switch from '@mui/material/Switch';
import LoadingButton from '@mui/lab/LoadingButton';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

import { Iconify } from 'src/components/iconify';

import { mockBranches } from 'src/sections/branch/mocks/data';

// ----------------------------------------------------------------------
// "Request shift via Tempy" — sends an open shift to Tempy's agency network.
// Modeled on the Supervision log-session dialog: local form state, no
// react-hook-form needed for a single-purpose four-field form.
// ----------------------------------------------------------------------

function RequestShiftDialog({ open, onClose, onSubmit }) {
  const [site, setSite] = useState('');
  const [role, setRole] = useState('');
  const [startsAt, setStartsAt] = useState(dayjs().add(1, 'day').hour(9).minute(0));
  const [endsAt, setEndsAt] = useState(dayjs().add(1, 'day').hour(17).minute(0));
  const [urgentCover, setUrgentCover] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSite(mockBranches[0]?.name || '');
      setRole('');
      setStartsAt(dayjs().add(1, 'day').hour(9).minute(0));
      setEndsAt(dayjs().add(1, 'day').hour(17).minute(0));
      setUrgentCover(false);
      setNotes('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!site || !role.trim()) {
      setError('Site and role are required.');
      return;
    }
    if (!startsAt || !endsAt || endsAt.isBefore(startsAt)) {
      setError('End time must be after the start time.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        site,
        role: role.trim(),
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        urgentCover,
        notes: notes.trim(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">Request shift via Tempy</Typography>
          <Typography variant="caption" color="text.secondary">
            Send this open shift to Tempy&apos;s agency network for cover.
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <TextField select label="Site" value={site} onChange={(event) => setSite(event.target.value)} fullWidth>
            {mockBranches.map((branch) => (
              <MenuItem key={branch._id} value={branch.name}>
                {branch.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Role needed"
            placeholder="e.g. Care assistant"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            fullWidth
          />

          <MobileDateTimePicker label="Shift starts" value={startsAt} onChange={setStartsAt} />

          <MobileDateTimePicker label="Shift ends" value={endsAt} onChange={setEndsAt} />

          <FormControlLabel
            control={<Switch checked={urgentCover} onChange={(event) => setUrgentCover(event.target.checked)} />}
            label="Urgent cover"
          />

          <TextField
            label="Notes for the agency"
            placeholder="Anything Tempy should know before bidding this shift"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            multiline
            rows={3}
            fullWidth
          />

          {error ? (
            <Typography variant="caption" color="error.main">
              {error}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton variant="contained" loading={isSubmitting} onClick={handleSubmit}>
          Send to Tempy
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default RequestShiftDialog;

RequestShiftDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};
