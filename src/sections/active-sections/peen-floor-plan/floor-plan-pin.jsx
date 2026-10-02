
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';

const PIN_COLORS = {
  low: 'success.main',
  medium: 'warning.main',
  high: 'error.main',
};

export function FloorPlanPin({ pin, resident, onClick }) {
  const color = PIN_COLORS[resident.peepLevel] || 'grey.500';

  return (
    <Tooltip
      title={`Room ${resident.roomNumber} · ${resident.name}`}
      placement="top"
    >
      <Box
        onClick={onClick}
        sx={{
          position: 'absolute',
          left: `${pin.x * 100}%`,
          top: `${pin.y * 100}%`,
          transform: 'translate(-50%, -100%)',
          zIndex: 5,
          cursor: 'pointer',
          color,
          transition: 'transform 0.15s ease',
          '&:hover': {
            transform: 'translate(-50%, -100%) scale(1.15)',
          },
        }}
      >
        <Iconify
          icon="solar:map-point-bold"
          width={38}
          height={38}
        />

        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '35%',
            transform: 'translate(-50%, -50%)',
            width: 8,
            height: 8,
            bgcolor: 'common.white',
            borderRadius: '50%',
          }}
        />
      </Box>
    </Tooltip>
  );
}