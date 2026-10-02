import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { useTempyConnection } from './use-tempy-connection';

// ----------------------------------------------------------------------
// Prominent "Connect to Tempy" card — the entry point for sending open shifts
// to Tempy's agency network. Disconnected: a CTA explaining the value.
// Connected: a compact spend/fill-rate summary + a link into the full usage
// page. One component reused on both the Owner and Line Manager dashboards.
// ----------------------------------------------------------------------

function Stat({ label, value }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="h6">{value}</Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

export function TempyConnectCard({ usagePath, sx }) {
  const router = useRouter();
  const { connected, isConnecting, connect, usageSummary } = useTempyConnection();

  const fillRate = usageSummary.shiftsRequested
    ? Math.round((usageSummary.shiftsFilled / usageSummary.shiftsRequested) * 100)
    : 0;

  if (!connected) {
    return (
      <Card sx={{ p: 3, ...sx }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.lighter',
                color: 'primary.main',
              }}
            >
              <Iconify icon="solar:global-bold" width={26} />
            </Box>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1">Connect to Tempy</Typography>
              <Typography variant="body2" color="text.secondary">
                Send open shifts to Tempy&apos;s agency network to get them covered, and track agency
                usage &amp; costs in one place.
              </Typography>
            </Stack>
          </Stack>

          <LoadingButton
            variant="contained"
            size="large"
            loading={isConnecting}
            startIcon={<Iconify icon="solar:link-bold" />}
            onClick={connect}
            sx={{ flexShrink: 0 }}
          >
            Connect to Tempy
          </LoadingButton>
        </Stack>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3, ...sx }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2.5}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Iconify icon="solar:global-bold" width={24} sx={{ color: 'success.main' }} />
          <Stack spacing={0.25}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1">Connected to Tempy</Typography>
              <Label variant="soft" color="success">
                Active
              </Label>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Agency usage &amp; costs this month
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={{ xs: 2.5, sm: 4 }} divider={<Divider orientation="vertical" flexItem />}>
          <Stat label="Spend this month" value={fCurrency(usageSummary.spendThisMonth, { code: 'en-GB', currency: 'GBP' })} />
          <Stat label="Shifts filled" value={`${usageSummary.shiftsFilled}/${usageSummary.shiftsRequested}`} />
          <Stat label="Fill rate" value={`${fillRate}%`} />
        </Stack>

        <Button
          variant="outlined"
          endIcon={<Iconify icon="solar:alt-arrow-right-linear" />}
          onClick={() => router.push(usagePath)}
          sx={{ flexShrink: 0 }}
        >
          View usage &amp; costs
        </Button>
      </Stack>
    </Card>
  );
}

TempyConnectCard.propTypes = {
  usagePath: PropTypes.string.isRequired,
  sx: PropTypes.object,
};
