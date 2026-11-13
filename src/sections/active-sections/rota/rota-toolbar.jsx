import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

const PERIOD_OPTIONS = ['Week', 'Fortnight', 'Month'];

export default function RotaToolbar({
  rangeLabel,
  period,
  onPeriodChange,
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
  canLock = true,
}) {
  const actions = [
    ...(canLock
      ? [
          {
            key: 'lock',
            icon: locked ? 'solar:lock-bold' : 'solar:lock-unlocked-linear',
            tooltip: locked ? 'Rota is Locked (Click to unlock)' : 'Lock Rota (Read-only mode)',
            color: locked ? 'error' : 'default',
            onClick: onToggleLock,
          },
        ]
      : []),
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

  return (
    <Box
      sx={{
        width: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        rowGap={1}
        columnGap={1.5}
        sx={{ px: 2.5, py: 1.5, width: 1 }}
      >
        {/* Left: Scope pills + Managed Teams dropdown */}
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
        </Stack>

        {/* Right: Date navigation + Period dropdown + Lock / Refresh actions */}
        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" rowGap={1}>
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {locked && (
              <Label
                variant="soft"
                color="error"
                startIcon={<Iconify icon="solar:lock-bold" />}
                sx={{ fontWeight: 600 }}
              >
                Locked
              </Label>
            )}
            <GenericTableRowActions actions={actions} />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
