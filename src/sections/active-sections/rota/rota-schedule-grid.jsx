import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar'; // minimals.cc reusable scrollbar wrapper

import RotaTeamSection, { COL_WIDTH, NAME_COL_WIDTH } from './rota-team-section';

// ----------------------------------------------------------------------

function DateHeaderRow({ days }) {
  return (
    <Stack
      direction="row"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 2,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          width: NAME_COL_WIDTH,
          flexShrink: 0,
          position: 'sticky',
          left: 0,
          zIndex: 3,
          bgcolor: 'background.paper',
        }}
      />

      {days.map((day) => (
        <Stack
          key={day.date}
          direction="row"
          alignItems="center"
          spacing={1}
          justifyContent="center"
          sx={{
            width: COL_WIDTH,
            flexShrink: 0,
            py: 1,
            borderLeft: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          }}
        >

          <WeatherIcon type={day.weather} />

          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={0.25}
          >

            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {day.label}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {day.hours}
            </Typography>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

export default function RotaScheduleGrid({ teams, days, onCellClick, locked = false, readOnly = false }) {
  const hasTeams = Boolean(teams && teams.length > 0);

  return (
    <Box sx={{ height: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Scrollbar sx={{ height: 1 }}>
        <Box sx={{ minWidth: NAME_COL_WIDTH + days.length * COL_WIDTH }}>
          <DateHeaderRow days={days} />

          {hasTeams && (
            <Stack divider={<Box sx={{ height: 8 }} />}>
              {teams.map((team) => (
                <RotaTeamSection
                  key={team.id}
                  team={team}
                  days={days}
                  onCellClick={readOnly ? undefined : onCellClick}
                  locked={locked}
                  readOnly={readOnly}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Scrollbar>

      {!hasTeams && (
        <Box
          sx={{
            position: 'absolute',
            top: 54,
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <Box sx={{ pointerEvents: 'auto' }}>
            <EmptyContent
              filled={false}
              sx={{ bgcolor: 'transparent' }}
              title="No rota records found"
              description="There are no scheduled shifts or teams found for this period."
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}


function WeatherIcon({ type }) {
  if (type === 'sun') {
    return (
      <Iconify icon="ant-design:sun-filled" sx={{ color: "warning.main" }} width={18} />
    );
  }

  return (
    <Iconify icon="carbon:cloud" width={18} />

  );
}
