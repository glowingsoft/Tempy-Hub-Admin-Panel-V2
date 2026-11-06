import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { KioskMobilePreview } from './kiosk-mobile-preview';
import { KioskScreenCard } from './kiosk-screen-card';

export function KioskCheckoutWidget({
  data,
  isConfigured,
  isSaving,
  disabled,
  onOpenDialog,
  sx,
}) {
  const currentType = data?.type || 'qr';
  const currentValue =
    currentType === 'image'
      ? data?.config?.imageUrl || data?.value || ''
      : currentType === 'text'
        ? data?.config?.body || data?.value || ''
        : data?.config?.url || data?.value || '';
  const currentCaption = data?.config?.caption || data?.caption || '';
  const checkoutScreen = isConfigured
    ? {
        ...data,
        sortOrder: 1,
        type: currentType,
        value: currentValue,
        caption: currentCaption,
        config: {
          ...(data?.config || {}),
          caption: currentCaption,
        },
      }
    : null;

  return (
    <Stack spacing={2.5} sx={sx}>
      <Stack spacing={0.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6">Checkout Widget</Typography>
          <Label color="primary" variant="filled" sx={{ height: 20, px: 0.75, fontSize: 10, fontWeight: 800 }}>
            POST-CHECKOUT
          </Label>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1}>
          <Typography variant="body2" color="text.secondary">
            A single widget shown after checkout — to visitors and employees alike — most often used for a checkout survey
          </Typography>
          {!isConfigured && (
            <Button
              variant="contained"
              color="primary"
              onClick={onOpenDialog}
              disabled={disabled || isSaving}
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{ flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
            >
              Add Widget
            </Button>
          )}
        </Stack>
      </Stack>

      <Grid container spacing={3} justifyContent={{ xs: 'center', md: 'flex-end' }} alignItems="flex-start">
        <Grid item xs={12} md={8}>
          {checkoutScreen ? (
            <KioskScreenCard
              screen={checkoutScreen}
              selected={false}
              onEdit={onOpenDialog}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No checkout widget added yet.
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <KioskMobilePreview
            mode="checkout"
            checkoutData={checkoutScreen}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
