import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';

import { Upload } from 'src/components/upload';
import { Label } from 'src/components/label';
import { getCompetencyStatus, getCompetencyStatusMeta } from '../mocks/data';

// ----------------------------------------------------------------------

export function StaffCompetencyDialog({ open, competency, onClose, onSave }) {
  const [evidence, setEvidence] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setEvidence(competency?.supportingEvidence || null);
      setError('');
    }
  }, [competency, open]);

  const handleDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setEvidence(acceptedFiles[0]);
      setError('');
    }
  };

  const handleDelete = () => {
    setEvidence(null);
  };

  const handleSubmit = () => {
    if (!evidence) {
      setError('Please upload a supporting evidence document or certificate.');
      return;
    }
    onSave({
      ...competency,
      supportingEvidence: evidence,
    });
    onClose();
  };

  const status = competency ? getCompetencyStatus(competency) : 'current';
  const statusMeta = getCompetencyStatusMeta(status);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Supporting Evidence & Details</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {competency && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                border: (theme) => `1px dashed ${theme.vars.palette.divider}`,
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1" fontWeight={700}>
                    {competency.title}
                  </Typography>
                  <Label variant="soft" color={statusMeta.color}>
                    {statusMeta.label}
                  </Label>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  <strong>Assessor / Provider:</strong> {competency.providerAssessor || 'Management Assigned'}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Expiry / Next Due:</strong>{' '}
                  {competency.nextDueDate ? dayjs(competency.nextDueDate).format('DD MMM YYYY') : '—'}
                </Typography>
              </Stack>
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Optional Supporting Evidence
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Upload your certificate or supporting proof for management verification.
            </Typography>

            <Upload
              value={evidence}
              onDrop={handleDrop}
              onDelete={handleDelete}
              accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] }}
              helperText="Accepted formats: PDF, PNG, JPG (max 10MB)"
            />
          </Box>

          {error && <FormHelperText error>{error}</FormHelperText>}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save Evidence
        </Button>
      </DialogActions>
    </Dialog>
  );
}

StaffCompetencyDialog.propTypes = {
  open: PropTypes.bool,
  competency: PropTypes.object,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
};
