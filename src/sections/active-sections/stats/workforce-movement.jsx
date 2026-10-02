import { useState, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import { useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { varAlpha, stylesMode } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { ChartSelect } from 'src/components/chart';

// ----------------------------------------------------------------------

const PERIOD_OPTIONS = ['This month', 'This quarter', 'This year'];

/**
 * Mock data per period.
 * Replace with real API data (e.g. useGetWorkforceMovementQuery) when ready.
 * `trend` is the change vs the previous period (positive = up, negative = down).
 */
const MOCK_DATA = {
  'This month': {
    retention: { value: 91, trend: +2.1 },
    newStarters: { value: 7, trend: +3 },
    leavers: { value: 4, trend: -1 },
  },
  'This quarter': {
    retention: { value: 88, trend: -1.3 },
    newStarters: { value: 18, trend: +5 },
    leavers: { value: 11, trend: +2 },
  },
  'This year': {
    retention: { value: 85, trend: -3.5 },
    newStarters: { value: 42, trend: +12 },
    leavers: { value: 30, trend: +8 },
  },
};

const TILES = [
  {
    key: 'retention',
    label: 'Retention rate',
    description: 'Staff retained this period',
    icon: 'solar:shield-check-bold-duotone',
    filter: 'active',
    formatValue: (v) => `${v}%`,
    // Higher is better for retention
    positiveIsBetter: true,
  },
  {
    key: 'newStarters',
    label: 'New starters',
    description: 'Joined this period',
    icon: 'solar:user-plus-bold-duotone',
    filter: 'new_starters',
    formatValue: (v) => v,
    positiveIsBetter: true,
  },
  {
    key: 'leavers',
    label: 'Leavers',
    description: 'Left or archived this period',
    icon: 'solar:user-minus-bold-duotone',
    filter: 'former',
    formatValue: (v) => v,
    // Fewer leavers is better
    positiveIsBetter: false,
  },
];

// ----------------------------------------------------------------------

function TrendBadge({ trend, positiveIsBetter }) {
  const theme = useTheme();
  const isPositive = trend >= 0;
  // "good" when positive=better & trend up, OR negative=better & trend down
  const isGood = positiveIsBetter ? isPositive : !isPositive;

  const color = isGood ? 'success' : 'error';
  const icon = isPositive ? 'eva:trending-up-fill' : 'eva:trending-down-fill';
  const label = `${isPositive ? '+' : ''}${trend}`;

  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Box
        sx={{
          width: 22,
          height: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          bgcolor: varAlpha(theme.vars.palette[color].mainChannel, 0.16),
          color: `${color}.dark`,
          [stylesMode.dark]: { color: `${color}.light` },
        }}
      >
        <Iconify icon={icon} width={14} />
      </Box>
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{ color: `${color}.dark`, [stylesMode.dark]: { color: `${color}.light` } }}
      >
        {label}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        vs prev
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function MetricTile({ config, data, onClick }) {
  const theme = useTheme();
  const { label, description, icon, formatValue, positiveIsBetter } = config;
  const { value, trend } = data;

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 3,
        cursor: 'pointer',
        borderRadius: 2,
        transition: 'background-color 0.18s ease',
        '&:hover': { bgcolor: 'action.hover' },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      {/* Icon + label row */}
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={24} />
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.primary" noWrap>
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {description}
          </Typography>
        </Box>
      </Stack>

      {/* Value */}
      <Typography
        variant="h3"
        sx={{ fontWeight: 700, lineHeight: 1, color: 'text.primary' }}
      >
        {formatValue(value)}
      </Typography>

      {/* Trend */}
      <TrendBadge trend={trend} positiveIsBetter={positiveIsBetter} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function WorkforceMovement({ ownerDashboard = false, branchId, departmentId, ...other }) {
  const router = useRouter();
  const [period, setPeriod] = useState('This quarter');

  const handlePeriodChange = useCallback((newPeriod) => {
    setPeriod(newPeriod);
  }, []);

  const periodData = useMemo(
    () => MOCK_DATA[period] ?? MOCK_DATA['This quarter'],
    [period]
  );

  const directoryRoot = ownerDashboard
    ? paths.owner.directory.root
    : paths.siteManager.directory.root;

  const handleTileClick = useCallback(
    (filter) => {
      router.push(`${directoryRoot}?filter=${filter}`);
    },
    [directoryRoot, router]
  );

  return (
    <Card
      sx={{
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
      }}
      {...other}
    >
      <CardHeader
        title="Workforce movement"
        subheader={`Summary for: ${period}`}
        action={
          <ChartSelect
            options={PERIOD_OPTIONS}
            value={period}
            onChange={handlePeriodChange}
          />
        }
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        divider={
          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderStyle: 'dashed', display: { xs: 'none', sm: 'block' } }}
          />
        }
        sx={{ px: 1, pb: 1 }}
      >
        {TILES.map((tile) => (
          <MetricTile
            key={tile.key}
            config={tile}
            data={periodData[tile.key]}
            onClick={() => handleTileClick(tile.filter)}
          />
        ))}
      </Stack>
    </Card>
  );
}
