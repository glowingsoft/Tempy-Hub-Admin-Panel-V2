import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar'; // minimals.cc reusable scrollbar wrapper

import RotaTeamSection, { COL_WIDTH, NAME_COL_WIDTH } from './rota-team-section';
import { Iconify } from 'src/components/iconify';

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

export default function RotaScheduleGrid({ teams, days, selectedStaffId, onSelectStaff, onCellClick }) {
  return (
    <Scrollbar sx={{ height: 1 }}>
      <Box sx={{ minWidth: NAME_COL_WIDTH + days.length * COL_WIDTH }}>
        <DateHeaderRow days={days} />

        <Stack divider={<Box sx={{ height: 8 }} />}>
          {teams.map((team) => (
            <RotaTeamSection
              key={team.id}
              team={team}
              days={days}
              selectedStaffId={selectedStaffId}
              onSelectStaff={onSelectStaff}
              onCellClick={onCellClick}
            />
          ))}
        </Stack>
      </Box>
    </Scrollbar>
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
