import { useState } from 'react';

import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import RotaShiftChip from './rota-shift-chip';

// ----------------------------------------------------------------------

const COL_WIDTH = 120;
const NAME_COL_WIDTH = 200;

function TeamHeaderRow({ team, open, onToggle }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      onClick={onToggle}
      sx={{
        px: 1.5,
        py: 0.75,
        cursor: 'pointer',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
        width: 1,
        minWidth: '100%',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          position: 'sticky',
          left: 16,
          flexShrink: 0,
        }}
      >
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: team.color }} />

        <Stack direction="row" spacing={2} alignItems="center">
          <StatBadge icon="solar:users-group-rounded-linear" value={team.stats.staff} />
          <StatBadge icon="solar:widget-linear" value={team.stats.teams} />
          <StatBadge icon="solar:clock-circle-linear" value={team.stats.breaks} />
          <StatBadge icon="solar:hourglass-linear" value={team.stats.hours} />
        </Stack>

        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {team.name}
        </Typography>

        <IconButton size="small">
          <Iconify
            icon="solar:alt-arrow-down-linear"
            width={16}
            sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: (t) => t.transitions.create('transform') }}
          />
        </IconButton>
      </Stack>
    </Stack>
  );
}

function StatBadge({ icon, value }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Iconify icon={icon} width={14} sx={{ color: 'text.disabled' }} />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {value}
      </Typography>
    </Stack>
  );
}

function StaffRow({ staff, days, team, onCellClick, locked = false, readOnly = false }) {
  return (
    <Stack direction="row" alignItems="stretch" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box
        sx={{
          width: NAME_COL_WIDTH,
          flexShrink: 0,
          position: 'sticky',
          left: 0,
          zIndex: 1,
          bgcolor: 'background.paper',
          px: 1.5,
          py: 1.25,
          cursor: 'default',
        }}
      >
        {staff.vacant ? (
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.disabled' }}>
            Vacant
          </Typography>
        ) : (
          <>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: 'text.primary', textTransform: 'capitalize' }}
            >
              {staff.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {staff.totalHours}
            </Typography>
          </>
        )}
      </Box>

      {days.map((day) => {
        const shiftsForDay = staff.shifts?.[day.date] ?? [];
        const isInteractive = !readOnly && !staff.vacant && Boolean(onCellClick) && !locked;

        return (
          <Stack
            key={day.date}
            spacing={0.5}
            justifyContent="center"
            onClick={(event) => {
              if (isInteractive) {
                onCellClick({ staff, day, shifts: shiftsForDay, team, target: event.currentTarget });
              }
            }}
            sx={{
              width: COL_WIDTH,
              flexShrink: 0,
              px: 0.5,
              py: 0.75,
              minHeight: 52,
              borderLeft: '1px solid',
              borderColor: 'divider',
              cursor: isInteractive ? 'pointer' : 'default',
              position: 'relative',
              transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
              '&:hover': isInteractive
                ? {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                    '& .cell-select-indicator': {
                      opacity: 1,
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      color: 'primary.main',
                    },
                  }
                : undefined,
            }}
          >
            {shiftsForDay.length > 0 ? (
              shiftsForDay.map((shift, index) => (
                <RotaShiftChip key={index} shift={shift} readOnly={readOnly || !isInteractive} />
              ))
            ) : isInteractive ? (
              <Box
                className="cell-select-indicator"
                sx={{
                  py: 0.5,
                  px: 0.75,
                  borderRadius: 0.75,
                  border: '1px dashed transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: (theme) =>
                    theme.transitions.create(['opacity', 'border-color', 'background-color', 'color'], {
                      duration: 150,
                    }),
                  color: 'text.disabled',
                  typography: 'caption',
                  fontWeight: 600,
                  userSelect: 'none',
                }}
              >
                + Select
              </Box>
            ) : null}
          </Stack>
        );
      })}
    </Stack>
  );
}

export default function RotaTeamSection({ team, days, onCellClick, locked = false, readOnly = false }) {
  const [open, setOpen] = useState(true);

  return (
    <Box>
      <TeamHeaderRow team={team} open={open} onToggle={() => setOpen((prev) => !prev)} />

      <Collapse in={open} unmountOnExit>
        {team.staff.map((staff) => (
          <StaffRow
            key={staff.id}
            staff={staff}
            days={days}
            team={team}
            onCellClick={readOnly ? undefined : onCellClick}
            locked={locked}
            readOnly={readOnly}
          />
        ))}
      </Collapse>
    </Box>
  );
}

export { COL_WIDTH, NAME_COL_WIDTH };
