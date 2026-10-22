import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

export function TableInfo({ icon, color, value }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'start',
        gap: 1,
        minWidth: 90,
      }}
    >
      <Label color={color} sx={{ borderRadius: 1 }}>
        <Iconify icon={icon} width={16} />
      </Label>

      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
