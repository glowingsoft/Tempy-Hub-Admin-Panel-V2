import { useState } from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { mockNewsletterData } from './mocks/data';

// ----------------------------------------------------------------------

export function NewsletterDeliveryConfig({ onSend, onSaveDraft, onDownloadPdf }) {
  const theme = useTheme();
  const { delivery } = mockNewsletterData;

  const [recipient, setRecipient] = useState('all');

  // None selected by default per user request
  const [deliveryChannels, setDeliveryChannels] = useState({
    inApp: false,
    email: false,
    pdf: false,
  });

  const [sendTiming, setSendTiming] = useState('now');
  const [scheduleDateTime, setScheduleDateTime] = useState('2026-10-10T09:00');

  const selectedAudience = delivery.audiences.find((a) => a.id === recipient);

  const handleToggleChannel = (channel) => {
    setDeliveryChannels((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  const handleSendAction = () => {
    if (!deliveryChannels.inApp && !deliveryChannels.email && !deliveryChannels.pdf) {
      toast.error('Please select at least one delivery channel (In-app, Email, or PDF).');
      return;
    }

    const channelList = [
      deliveryChannels.inApp && 'In-app',
      deliveryChannels.email && 'Email',
      deliveryChannels.pdf && 'PDF',
    ]
      .filter(Boolean)
      .join(' & ');

    if (sendTiming === 'now') {
      toast.success(
        `October newsletter dispatched immediately to ${selectedAudience?.count || 42} families via ${channelList}!`
      );
    } else {
      toast.success(
        `October newsletter scheduled for dispatch on ${scheduleDateTime.replace('T', ' ')} to ${
          selectedAudience?.count || 42
        } families via ${channelList}.`
      );
    }

    onSend?.({
      recipient,
      deliveryChannels,
      sendTiming,
      scheduleDateTime,
    });
  };

  const handleDraftAction = () => {
    toast.success('October newsletter draft saved successfully.');
    onSaveDraft?.();
  };

  const handlePdfAction = () => {
    toast.info('Generating and downloading October newsletter PDF...');
    onDownloadPdf?.();
  };

  return (
    <Card sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <Iconify icon="solar:plain-bold" width={22} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>
            3. Send & Delivery
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Configure recipients, channels, and dispatch timing.
        </Typography>

        <Stack spacing={2.5}>
          {/* To: Recipients */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                To
              </Typography>
              <Chip
                label={`${selectedAudience?.count || 42} families`}
                size="small"
                color="info"
                variant="soft"
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
              />
            </Stack>

            <TextField
              select
              fullWidth
              size="small"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            >
              {delivery.audiences.map((aud) => (
                <MenuItem key={aud.id} value={aud.id}>
                  {aud.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Divider />

          {/* Delivery Channels */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Delivery
            </Typography>

            <Stack spacing={0.75}>
              {/* In-app */}
              <Box
                onClick={() => handleToggleChannel('inApp')}
                sx={{
                  p: 1.25,
                  px: 1.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  userSelect: 'none',
                  border: (t) =>
                    `1px solid ${deliveryChannels.inApp ? t.palette.primary.light : t.palette.divider}`,
                  bgcolor: deliveryChannels.inApp
                    ? alpha(theme.palette.primary.main, 0.04)
                    : 'transparent',
                  transition: theme.transitions.create(['background-color', 'border-color']),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Checkbox
                    checked={Boolean(deliveryChannels.inApp)}
                    tabIndex={-1}
                    disableRipple
                    size="small"
                    sx={{ p: 0.25, pointerEvents: 'none' }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      In-app
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Notify via Tempy Family App feed
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Email */}
              <Box
                onClick={() => handleToggleChannel('email')}
                sx={{
                  p: 1.25,
                  px: 1.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  userSelect: 'none',
                  border: (t) =>
                    `1px solid ${deliveryChannels.email ? t.palette.primary.light : t.palette.divider}`,
                  bgcolor: deliveryChannels.email
                    ? alpha(theme.palette.primary.main, 0.04)
                    : 'transparent',
                  transition: theme.transitions.create(['background-color', 'border-color']),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Checkbox
                    checked={Boolean(deliveryChannels.email)}
                    tabIndex={-1}
                    disableRipple
                    size="small"
                    sx={{ p: 0.25, pointerEvents: 'none' }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Email
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Send HTML edition to registered emails
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* PDF */}
              <Box
                onClick={() => handleToggleChannel('pdf')}
                sx={{
                  p: 1.25,
                  px: 1.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  userSelect: 'none',
                  border: (t) =>
                    `1px solid ${deliveryChannels.pdf ? t.palette.primary.light : t.palette.divider}`,
                  bgcolor: deliveryChannels.pdf
                    ? alpha(theme.palette.primary.main, 0.04)
                    : 'transparent',
                  transition: theme.transitions.create(['background-color', 'border-color']),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Checkbox
                    checked={Boolean(deliveryChannels.pdf)}
                    tabIndex={-1}
                    disableRipple
                    size="small"
                    sx={{ p: 0.25, pointerEvents: 'none' }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      PDF
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Generate print-ready copy for care home
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* When: Timing */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              When
            </Typography>

            <RadioGroup value={sendTiming} onChange={(e) => setSendTiming(e.target.value)}>
              <FormControlLabel
                value="now"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2" fontWeight={600}>
                    Send now
                  </Typography>
                }
              />
              <FormControlLabel
                value="schedule"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2" fontWeight={600}>
                    Schedule for later
                  </Typography>
                }
              />
            </RadioGroup>

            {sendTiming === 'schedule' && (
              <Box sx={{ mt: 1.5 }}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  size="small"
                  label="Dispatch Date & Time"
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            )}
          </Box>

          <Divider />

          {/* Action Buttons */}
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:plain-bold" />}
              onClick={handleSendAction}
              sx={{ fontWeight: 700, py: 1.25 }}
            >
              Send newsletter
            </Button>

            <Button
              fullWidth
              size="medium"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:disk-bold" />}
              onClick={handleDraftAction}
            >
              Save draft
            </Button>

            <Button
              fullWidth
              size="medium"
              variant="soft"
              color="primary"
              startIcon={<Iconify icon="solar:file-download-bold" />}
              onClick={handlePdfAction}
            >
              Download PDF
            </Button>
          </Stack>
        </Stack>
    </Card>
  );
}

NewsletterDeliveryConfig.propTypes = {
  onSend: PropTypes.func,
  onSaveDraft: PropTypes.func,
  onDownloadPdf: PropTypes.func,
};

export default NewsletterDeliveryConfig;
