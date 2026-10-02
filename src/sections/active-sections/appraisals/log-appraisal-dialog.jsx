import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const REVIEW_PERIOD_OPTIONS = [
  'Annual Review 2026',
  'Annual Review 2027',
  'Probation Review (6 Month)',
  'Mid-Year Review 2026',
  'Special Performance Review',
];

const STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed (Standards Met)' },
  { value: 'scheduled', label: 'Scheduled / In Progress' },
  { value: 'due_soon', label: 'Follow-up Due Soon' },
  { value: 'overdue', label: 'Overdue / Escalated' },
];

export default function LogAppraisalDialog({ open, row, onClose, onSave }) {
  const [dateHeld, setDateHeld] = useState(dayjs());
  const [nextDue, setNextDue] = useState(dayjs().add(1, 'year'));
  const [period, setPeriod] = useState('Annual Review 2026');
  const [status, setStatus] = useState('completed');
  const [conductedBy, setConductedBy] = useState('Line Manager');
  const [notes, setNotes] = useState('');
  const [actionPoints, setActionPoints] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize/reset state whenever modal opens for a selected staff row
  useEffect(() => {
    if (open && row) {
      const today = dayjs();
      setDateHeld(today);
      // Appraisals are annual (12-month interval per sector guidelines)
      setNextDue(today.add(1, 'year'));
      setPeriod(row.period || 'Annual Review 2026');
      setStatus('completed');
      setConductedBy('Line Manager');
      setNotes('');
      setActionPoints('');
      setAttachedFile(null);
      setError('');
      setIsSubmitting(false);
    }
  }, [open, row]);

  // Handle Date Held changes and auto-shift Next Due Date if not manually customized
  const handleDateHeldChange = (newDate) => {
    setDateHeld(newDate);
    if (newDate && newDate.isValid()) {
      setNextDue(newDate.add(1, 'year'));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        fileType: file.name.split('.').pop()?.toLowerCase() || 'document',
      });
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  const handleSave = async () => {
    if (!dateHeld || !dateHeld.isValid()) {
      setError('Please select a valid date for when the appraisal was held.');
      return;
    }
    if (!nextDue || !nextDue.isValid()) {
      setError('Please set the next annual review due date.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      // Parse action points from multiline text into structured objects
      const parsedActionPoints = actionPoints
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((text, idx) => ({
          id: `ap-${Date.now()}-${idx}`,
          text,
          signedOff: false,
        }));

      await onSave?.({
        staffId: row?.id,
        staffName: row?.name,
        dateHeld: dateHeld.toISOString(),
        nextDue: nextDue.toISOString(),
        period,
        status,
        conductedBy,
        notes: notes.trim(),
        actionPoints: parsedActionPoints,
        document: attachedFile,
      });

      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save appraisal review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!row) return null;

  const staffFirstName = row?.name?.split(' ')[0] || 'Staff member';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pb: 1.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar alt={row.name} src={row.avatar} sx={{ width: 48, height: 48 }}>
            {row.name?.charAt(0)}
          </Avatar>
          <Stack spacing={0.25}>
            <Typography variant="subtitle1" fontWeight={700}>
              Log Appraisal Review
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {row.name} · {row.role} ({row.department})
            </Typography>
          </Stack>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5, pb: 3 }}>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Row 1: Date Held & Next Due (Annual Cycle) */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date Held / Completed *"
                value={dateHeld}
                onChange={handleDateHeldChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'medium',
                    helperText: 'Date of review meeting',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Next Review Due *"
                value={nextDue}
                onChange={(newVal) => setNextDue(newVal)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'medium',
                    helperText: 'Annual cadence (+12 months)',
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* Row 2: Review Period & Outcome Status */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Review Period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {REVIEW_PERIOD_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Appraisal Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Conducted By */}
          <TextField
            fullWidth
            label="Conducted By"
            value={conductedBy}
            onChange={(e) => setConductedBy(e.target.value)}
            helperText="Appraising supervisor or line manager name"
          />

          {/* Performance Discussion & Objectives */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Performance & Care Standards Notes"
            placeholder="Key discussion points, care standards met, feedback from residents/family, competency observations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Agreed Action Points */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Action Points & Development Goals"
            placeholder={'e.g. Complete Level 3 Medication Administration module\nShadow Senior Carer on night shift handover\nReview care plans documentation by end of quarter'}
            helperText="Enter one action point per line — each can be signed off individually in staff history."
            value={actionPoints}
            onChange={(e) => setActionPoints(e.target.value)}
          />

          {/* Optional Document Attachment */}
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
              Appraisal Documentation (Optional Signed Form / Evidence)
            </Typography>

            {attachedFile ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                  border: (theme) => `1px dashed ${theme.palette.divider}`,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Iconify icon="solar:document-text-bold" sx={{ color: 'primary.main', width: 24, height: 24 }} />
                  <Stack spacing={0.25}>
                    <Typography variant="body2" fontWeight={600}>
                      {attachedFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {attachedFile.size} · {attachedFile.fileType.toUpperCase()}
                    </Typography>
                  </Stack>
                </Stack>
                <IconButton size="small" onClick={handleRemoveFile} color="error">
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="outlined"
                color="inherit"
                component="label"
                startIcon={<Iconify icon="solar:upload-bold" />}
                sx={{ borderStyle: 'dashed' }}
              >
                Attach Signed Appraisal PDF / File
                <input type="file" hidden accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleFileChange} />
              </Button>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button color="inherit" variant="outlined" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={isSubmitting}
          startIcon={<Iconify icon="solar:check-circle-bold" />}
        >
          {isSubmitting ? 'Saving...' : 'Save Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

LogAppraisalDialog.propTypes = {
  open: PropTypes.bool,
  row: PropTypes.object,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
};
