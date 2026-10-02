import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { KioskMobilePreview } from './kiosk-mobile-preview';
import { KioskTypeSelector } from './kiosk-type-selector';

// ----------------------------------------------------------------------

export function KioskCheckoutWidget({ data, onChange, sx }) {
  const handleChangeField = (field, value) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <Stack spacing={2.5} sx={sx}>
      {/* Header */}
      <div>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6">Checkout Widget</Typography>
          <Label color="primary" variant="filled" sx={{ height: 20, px: 0.75, fontSize: 10, fontWeight: 800 }}>
            NEW
          </Label>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          A single widget shown after checkout — to visitors and employees alike — most often used for a checkout survey
        </Typography>
      </div>

      {/* Info Banner */}
      <Alert
        severity="info"
        icon={<Iconify icon="solar:info-circle-bold" />}
        sx={{
          borderRadius: 1.5,
          py: 0.75,
          fontSize: 12.5,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.info.main, 0.1)
              : alpha(theme.palette.primary.lighter, 0.4),
          border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          color: 'text.primary',
        }}
      >
        Unlike the Home Widgets above, there is only <strong>one</strong> Checkout Widget — it appears on the
        confirmation screen immediately after anyone checks out.
      </Alert>

      {/* Main Grid: Left Controls, Right Preview */}
      <Grid container spacing={3} alignItems="flex-start">
        {/* Left Column: Configuration Controls */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <div>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Checkout widget — content type
                </Typography>
                <KioskTypeSelector
                  value={data.type}
                  onChange={(newType) => handleChangeField('type', newType)}
                />
              </div>

              {/* Dynamic Destination / Content Field */}
              <TextField
                fullWidth
                label={
                  data.type === 'qr'
                    ? 'QR code destination'
                    : data.type === 'image'
                    ? 'Image URL'
                    : data.type === 'link'
                    ? 'Link URL'
                    : 'Checkout message'
                }
                value={data.value || ''}
                onChange={(e) => handleChangeField('value', e.target.value)}
                placeholder={
                  data.type === 'text'
                    ? 'Thank you for visiting!'
                    : 'https://forms.google.com/checkout-survey...'
                }
                multiline={data.type === 'text'}
                rows={data.type === 'text' ? 2 : 1}
              />

              {/* Caption Field */}
              <TextField
                fullWidth
                label="Caption shown under the code"
                value={data.caption || ''}
                onChange={(e) => handleChangeField('caption', e.target.value)}
                placeholder="Scan to tell us about your visit"
              />

              {/* Audience Toggles */}
              <Stack spacing={1} sx={{ pt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                  Audience Visibility
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Show to visitors
                  </Typography>
                  <Switch
                    checked={Boolean(data.showToVisitors)}
                    onChange={(e) => handleChangeField('showToVisitors', e.target.checked)}
                    color="primary"
                  />
                </Stack>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Show to employees
                  </Typography>
                  <Switch
                    checked={Boolean(data.showToEmployees)}
                    onChange={(e) => handleChangeField('showToEmployees', e.target.checked)}
                    color="primary"
                  />
                </Stack>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* Right Column: Mobile Preview */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <KioskMobilePreview mode="checkout" checkoutData={data} />
        </Grid>
      </Grid>
    </Stack>
  );
}
