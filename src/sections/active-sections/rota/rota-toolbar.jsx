import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const PERIOD_OPTIONS = ['Week', 'Fortnight', 'Month'];

const CURRENCY_OPTIONS = [
  { value: 'current', label: 'Current' },
  { value: 'all', label: 'All' },
];

const GROUP_BY_OPTIONS = [
  { value: 'staff', label: 'Staff' },
  { value: 'team', label: 'Group by Team' },
  { value: 'name', label: 'First Name' },
];

export default function RotaToolbar({
  rangeLabel,
  period,
  onPeriodChange,
  filter,
  onFilterChange,
  shownCount,
  totalCount,
  groupBy,
  onGroupByChange,
  onPrev,
  onNext,
  locked,
  onToggleLock,
  onRefresh,
  scope,
  scopeOptions = [],
  onScopeChange,
  managedTeams = [],
  selectedTeamId = 'all',
  onSelectTeamId,
}) {
  const actions = [
    {
      key: 'lock',
      icon: locked ? 'solar:lock-linear' : 'solar:lock-unlocked-linear',
      tooltip: locked ? 'Unlock' : 'Lock',
      onClick: onToggleLock,
    },
    {
      key: 'refresh',
      icon: 'solar:refresh-bold',
      tooltip: 'Refresh',
      onClick: onRefresh,
    },
  ];

  const scopePillGroupSx = {
    p: 0.5,
    borderRadius: 1.25,
    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
    border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
    '& .MuiToggleButton-root': {
      border: 0,
      borderRadius: 1,
      px: 1.75,
      py: 0.6,
      typography: 'subtitle2',
      fontWeight: 600,
      color: 'text.secondary',
      transition: (theme) => theme.transitions.create(['background-color', 'color', 'box-shadow']),
      '&.Mui-selected': {
        bgcolor: 'background.paper',
        color: 'primary.main',
        boxShadow: (theme) => theme.customShadows?.z1 ?? theme.shadows[1],
        '&:hover': {
          bgcolor: 'background.paper',
        },
      },
    },
  };

  const pillGroupSx = {
    p: 0.5,
    borderRadius: 1.25,
    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
    border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
    '& .MuiToggleButton-root': {
      border: 0,
      borderRadius: 1,
      px: 1.5,
      py: 0.5,
      typography: 'subtitle2',
      fontWeight: 600,
      color: 'text.secondary',
      transition: (theme) => theme.transitions.create(['background-color', 'color', 'box-shadow']),
      '&.Mui-selected': {
        bgcolor: 'background.paper',
        color: 'primary.main',
        boxShadow: (theme) => theme.customShadows?.z1 ?? theme.shadows[1],
        '&:hover': {
          bgcolor: 'background.paper',
        },
      },
    },
  };

  const shownLabel =
    totalCount != null && totalCount !== shownCount ? `${shownCount} of ${totalCount} shown` : `${shownCount} shown`;

  return (
    <Box
      sx={{
        width: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Row 1: Scope switch + Team filter (left) / Date range navigation (right) */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        rowGap={1}
        columnGap={1.5}
        sx={{ px: 2.5, py: 1.5, width: 1 }}
      >
        {/* Left: My Rota / My Team(s) switch + Managed Teams dropdown */}
        <Stack direction="row" alignItems="center" flexWrap="wrap" rowGap={1} spacing={1.5}>
          {scopeOptions.length > 1 && (
            <ToggleButtonGroup
              size="small"
              exclusive
              value={scope}
              onChange={(event, value) => value && onScopeChange(value)}
              sx={scopePillGroupSx}
            >
              {scopeOptions.map((option) => (
                <ToggleButton sx={{ whiteSpace: 'nowrap' }} key={option.value} value={option.value}>
                  <Stack direction="row" alignItems="center" spacing={0.85}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: scope === option.value ? 'primary.main' : 'text.disabled',
                        boxShadow: (theme) =>
                          scope === option.value
                            ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
                            : 'none',
                        transition: (theme) =>
                          theme.transitions.create(['background-color', 'box-shadow']),
                      }}
                    />
                    <span>{option.label}</span>
                  </Stack>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}

          {scope === 'managed' && managedTeams && managedTeams.length > 0 && (
            <TextField
              select
              size="small"
              value={selectedTeamId || 'all'}
              onChange={(event) => onSelectTeamId?.(event.target.value)}
              sx={{
                minWidth: 180,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.25,
                  bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                },
                '& .MuiSelect-select': {
                  py: 0.65,
                  typography: 'subtitle2',
                  fontWeight: 600,
                },
              }}
            >
              <MenuItem value="all">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:users-group-rounded-linear" width={16} sx={{ color: 'text.secondary' }} />
                  <span>All My Teams</span>
                </Stack>
              </MenuItem>
              {managedTeams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: team.color }} />
                    <span>{team.name}</span>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>

        {/* Right: Date range navigation + Period dropdown */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            p: 0.5,
            borderRadius: 1.25,
            border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            flexShrink: 0,
          }}
        >
          <IconButton size="small" onClick={onPrev}>
            <Iconify icon="solar:alt-arrow-left-linear" width={18} />
          </IconButton>

          <Typography variant="subtitle2" sx={{ minWidth: 120, textAlign: 'center', fontWeight: 600 }}>
            {rangeLabel}
          </Typography>

          <IconButton size="small" onClick={onNext}>
            <Iconify icon="solar:alt-arrow-right-linear" width={18} />
          </IconButton>

          <TextField
            select
            size="small"
            value={period}
            onChange={(event) => onPeriodChange(event.target.value)}
            sx={{
              width: 120,
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '& .MuiSelect-select': { py: 0.5, typography: 'subtitle2', fontWeight: 600 },
            }}
          >
            {PERIOD_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      {/* Row 2: Current/All + Shown count (left) / Group By + Actions (right) */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        rowGap={1}
        columnGap={1.5}
        sx={{
          px: 2.5,
          py: 1,
          width: 1,
          borderTop: '1px solid',
          borderColor: (theme) => alpha(theme.palette.grey[500], 0.12),
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" rowGap={1}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filter}
            onChange={(event, value) => value && onFilterChange(value)}
            sx={pillGroupSx}
          >
            {CURRENCY_OPTIONS.map((option) => (
              <ToggleButton key={option.value} value={option.value} sx={{ whiteSpace: 'nowrap' }}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontWeight: 600 }}>
            {shownLabel}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" rowGap={1}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={groupBy}
            onChange={(event, value) => value && onGroupByChange(value)}
            sx={pillGroupSx}
          >
            {GROUP_BY_OPTIONS.map((option) => (
              <ToggleButton sx={{ whiteSpace: 'nowrap' }} key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <GenericTableRowActions actions={actions} />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
