import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { KIOSK_SITE_SCOPES } from './mocks/data';

// ----------------------------------------------------------------------

export function KioskScopeBar({
  currentSite,
  onChangeSite,
  currentKiosk,
  onChangeKiosk,
  ownerDashboard = false,
  sx,
}) {
  const activeSiteData = useMemo(
    () => KIOSK_SITE_SCOPES.find((s) => s.id === currentSite) || KIOSK_SITE_SCOPES[0],
    [currentSite]
  );

  const scopeInfo = useMemo(() => {
    const siteName = activeSiteData?.name || 'this site';
    if (currentKiosk === 'all') {
      return {
        status: 'Site-wide Default',
        color: 'info',
        icon: 'solar:shield-check-bold-duotone',
        text: `Changes here apply to every kiosk at ${siteName}, unless that kiosk has its own override set.`,
      };
    }
    if (currentKiosk === 'new') {
      return {
        status: 'New Override',
        color: 'warning',
        icon: 'solar:add-circle-bold-duotone',
        text: `Select an existing kiosk from ${siteName}'s Kiosks list to give it a device-specific override.`,
      };
    }
    return {
      status: 'Device Override',
      color: 'success',
      icon: 'solar:tuning-square-bold-duotone',
      text: `Editing an override for this kiosk at ${siteName} only — it will stop inheriting the site-wide default once saved.`,
    };
  }, [activeSiteData, currentKiosk]);

  return (
    <Card
      sx={{
        p: { xs: 2, sm: 2.5 },
        bgcolor: 'background.paper',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        ...sx,
      }}
    >
      <Stack spacing={2}>
        {/* Header Row */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
              }}
            >
              <Iconify icon="solar:settings-minimalistic-bold-duotone" width={20} />
            </Box>

            <div>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Target Scope & Location
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Select the care home site and device scope to configure branding rules.
              </Typography>
            </div>
          </Stack>

          <Label
            color="warning"
            variant="soft"
            startIcon={<Iconify icon="solar:crown-bold" width={14} />}
            sx={{ width: 'fit-content', fontWeight: 700, fontSize: 11, alignSelf: { xs: 'flex-start', sm: 'center' } }}
          >
            Owner-Level Control
          </Label>
        </Stack>

        {/* Dropdowns Row */}
        <Grid container spacing={2} alignItems="center">
          {/* Site Dropdown */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Site"
              value={currentSite}
              onChange={(e) => {
                const nextSite = e.target.value;
                onChangeSite(nextSite);
                const nextSiteData = KIOSK_SITE_SCOPES.find((s) => s.id === nextSite);
                if (nextSiteData?.kiosks?.[0]) {
                  onChangeKiosk(nextSiteData.kiosks[0].value);
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:buildings-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
            >
              {KIOSK_SITE_SCOPES.map((site) => (
                <MenuItem key={site.id} value={site.id}>
                  {site.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Applying To Dropdown */}
          <Grid item xs={12} sm={6} md={5}>
            <TextField
              select
              fullWidth
              size="small"
              label="Applying to"
              value={currentKiosk}
              onChange={(e) => onChangeKiosk(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:monitor-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
            >
              {activeSiteData?.kiosks?.map((kiosk) => (
                <MenuItem key={kiosk.value} value={kiosk.value}>
                  {kiosk.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Scope Status Badge / Indicator */}
          <Grid item xs={12} md={3}>
            <Label
              color={scopeInfo.color}
              variant="soft"
              startIcon={<Iconify icon={scopeInfo.icon} width={16} />}
              sx={{
                py: 2,
                px: 1.5,
                width: 1,
                height: 40,
                justifyContent: 'flex-start',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {scopeInfo.status}
            </Label>
          </Grid>
        </Grid>

        {/* Dynamic Context Banner */}
        <Box
          sx={{
            py: 1,
            px: 1.5,
            borderRadius: 1,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.grey[800], 0.6)
                : alpha(theme.palette.grey[200], 0.5),
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Iconify icon="solar:info-circle-bold" width={18} sx={{ color: 'text.secondary', flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
            {scopeInfo.text}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}
