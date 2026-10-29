import { useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { formatStr } from 'src/utils/format-time';

import { canCancelNewsletter, canDeleteNewsletter } from './utils';

// ----------------------------------------------------------------------

const CHANNELS = [
  { key: 'inApp', label: 'In-app', hint: 'Notify via Tempy Family App feed' },
  { key: 'email', label: 'Email', hint: 'Send HTML edition to registered emails' },
  { key: 'pdf', label: 'PDF', hint: 'Generate print-ready copy for care home' },
];

function Panel({ selected, disabled, onClick, children }) {
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        p: 2,
        height: 1,
        minHeight: 96,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 1.5,
        cursor: disabled || !onClick ? 'default' : 'pointer',
        border: (theme) => `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: (theme) => (selected ? alpha(theme.palette.primary.main, 0.08) : 'transparent'),
      }}
    >
      {children}
    </Box>
  );
}

export function NewsletterDeliveryConfig({
  form,
  onChange,
  recipients,
  status,
  saving = false,
  sending = false,
  deleting = false,
  previewing = false,
  onSaveDraft,
  onSend,
  onSchedule,
  onCancelSchedule,
  onPreviewPdf,
  onDelete,
  disabled = false,
}) {
  const delivery = form?.delivery || { inApp: false, email: false, pdf: false };
  const [sendTiming, setSendTiming] = useState('now');
  const [scheduleAt, setScheduleAt] = useState(dayjs().add(1, 'hour'));

  const isLocked = status === 'sent' || status === 'sending';
  const channelsDisabled = disabled || isLocked;

  const handleToggleChannel = (key) => {
    if (channelsDisabled) return;
    onChange({ ...form, delivery: { ...delivery, [key]: !delivery[key] } });
  };

  const handleSendAction = () => {
    if (!delivery.inApp && !delivery.email && !delivery.pdf) {
      toast.error('Please select at least one delivery channel');
      return;
    }

    if (sendTiming !== 'schedule') {
      onSend?.();
      return;
    }

    if (!scheduleAt?.isValid()) {
      toast.error('Please choose a schedule time');
      return;
    }

    onSchedule?.(scheduleAt.toISOString());
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={700}>
        Send & Delivery
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
        Choose channels and when families should receive this newsletter.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
        }}
      >
        <Panel>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8 }}>
            TO
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mt: 0.75 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              All families at this site
            </Typography>
            <Chip
              label={`${recipients?.families ?? 0} families`}
              size="small"
              color="info"
              variant="soft"
              sx={{ height: 22, fontWeight: 600 }}
            />
          </Stack>
        </Panel>

        {CHANNELS.map((channel) => {
          const checked = Boolean(delivery[channel.key]);
          return (
            <Panel
              key={channel.key}
              selected={checked}
              disabled={channelsDisabled}
              onClick={() => handleToggleChannel(channel.key)}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Checkbox
                  checked={checked}
                  tabIndex={-1}
                  disableRipple
                  size="small"
                  sx={{ p: 0, mt: 0.25, pointerEvents: 'none' }}
                />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {channel.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.45 }}>
                    {channel.hint}
                  </Typography>
                </Box>
              </Stack>
            </Panel>
          );
        })}
      </Box>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        sx={{ mt: 2.5 }}
      >
        {!isLocked ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <RadioGroup row value={sendTiming} onChange={(event) => setSendTiming(event.target.value)}>
              <FormControlLabel value="now" control={<Radio size="small" />} label="Send now" />
              <FormControlLabel value="schedule" control={<Radio size="small" />} label="Schedule for later" />
            </RadioGroup>
            {sendTiming === 'schedule' && (
              <MobileDateTimePicker
                label="Dispatch date & time"
                value={scheduleAt}
                onChange={setScheduleAt}
                format={formatStr.split.dateTime}
                slotProps={{
                  textField: { size: 'small', sx: { minWidth: 240 } },
                }}
              />
            )}
          </Stack>
        ) : (
          <Box />
        )}

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
          {!isLocked && (
            <>
              <Button
                variant="contained"
                color="primary"
                disabled={sending || disabled}
                startIcon={<Iconify icon="solar:plain-bold" />}
                onClick={handleSendAction}
                sx={{ fontWeight: 700 }}
              >
                {sendTiming === 'schedule' ? 'Schedule newsletter' : 'Send newsletter'}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                disabled={saving || disabled}
                startIcon={<Iconify icon="solar:disk-bold" />}
                onClick={onSaveDraft}
              >
                Save draft
              </Button>
            </>
          )}
          <Button
            variant="outlined"
            color="inherit"
            disabled={previewing}
            startIcon={<Iconify icon="solar:eye-bold" />}
            onClick={onPreviewPdf}
          >
            Preview PDF
          </Button>
          {canCancelNewsletter(status) && (
            <Button
              variant="outlined"
              color="warning"
              disabled={sending}
              startIcon={<Iconify icon="solar:close-circle-bold" />}
              onClick={onCancelSchedule}
            >
              Cancel newsletter
            </Button>
          )}
          {canDeleteNewsletter(status) && (
            <Button
              variant="outlined"
              color="error"
              disabled={deleting}
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={onDelete}
            >
              Delete newsletter
            </Button>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

Panel.propTypes = {
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

NewsletterDeliveryConfig.propTypes = {
  form: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  recipients: PropTypes.object,
  status: PropTypes.string,
  saving: PropTypes.bool,
  sending: PropTypes.bool,
  deleting: PropTypes.bool,
  previewing: PropTypes.bool,
  onSaveDraft: PropTypes.func,
  onSend: PropTypes.func,
  onSchedule: PropTypes.func,
  onCancelSchedule: PropTypes.func,
  onPreviewPdf: PropTypes.func,
  onDelete: PropTypes.func,
  disabled: PropTypes.bool,
};

export default NewsletterDeliveryConfig;
