import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { KIOSK_CONTENT_TYPES } from './mocks/data';

// ----------------------------------------------------------------------

export function KioskTypeSelector({ value, onChange, sx }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        gap: 1.5,
        ...sx,
      }}
    >
      {KIOSK_CONTENT_TYPES.map((type) => {
        const isSelected = value === type.value;
        const isNew = type.value === 'link';

        return (
          <ButtonBase
            key={type.value}
            onClick={() => onChange(type.value)}
            sx={{
              position: 'relative',
              p: 1.75,
              borderRadius: 1.5,
              border: (theme) => `1.5px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
              bgcolor: (theme) =>
                isSelected
                  ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.04)
                  : theme.palette.background.paper,
              transition: (theme) => theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
              '&:hover': {
                bgcolor: (theme) =>
                  isSelected
                    ? alpha(theme.palette.primary.main, 0.12)
                    : alpha(theme.palette.action.hover, 0.08),
              },
            }}
          >
            {isNew && (
              <Label
                color="primary"
                variant="filled"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -4,
                  height: 18,
                  px: 0.75,
                  fontSize: 9,
                  fontWeight: 800,
                  boxShadow: (theme) => theme.customShadows?.z8,
                }}
              >
                NEW
              </Label>
            )}

            <Stack spacing={0.75} alignItems="center" justifyContent="center">
              <Iconify
                icon={type.icon}
                width={24}
                sx={{
                  color: isSelected ? 'primary.main' : 'text.secondary',
                  transition: (theme) => theme.transitions.create('color'),
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: isSelected ? 700 : 600,
                  color: isSelected ? 'primary.main' : 'text.primary',
                }}
              >
                {type.label}
              </Typography>
            </Stack>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
