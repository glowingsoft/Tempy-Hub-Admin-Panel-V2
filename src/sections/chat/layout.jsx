import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

// ----------------------------------------------------------------------

export function Layout({ slots, sx, ...other }) {
  return (
    <Stack direction="row" sx={{ overflow: 'hidden', minHeight: 0, ...sx }} {...other}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: 1,
          flexShrink: 0,
        }}
      >
        {slots.nav}
      </Box>

      <Stack sx={{ flex: '1 1 auto', minWidth: 0, minHeight: 0 }}>
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            px: 2,
            py: 1,
            minHeight: 64,
            flexShrink: 0,
            borderBottom: (theme) => `solid 1px ${theme.vars.palette.divider}`,
          }}
        >
          {slots.header}
        </Stack>

        <Stack direction="row" sx={{ flex: '1 1 auto', minHeight: 0, minWidth: 0 }}>
          <Stack sx={{ flex: '1 1 auto', minWidth: 0, minHeight: 0, width: 1 }}>{slots.main}</Stack>
          <Stack sx={{ minHeight: 0, flexShrink: 0 }}>{slots.details}</Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
