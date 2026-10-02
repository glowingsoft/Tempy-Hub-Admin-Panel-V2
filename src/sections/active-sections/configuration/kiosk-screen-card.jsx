import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { KIOSK_CONTENT_TYPES } from './mocks/data';

// ----------------------------------------------------------------------

const CHIP_COLOR_MAP = {
  image: { color: 'primary', icon: 'solar:gallery-bold', label: 'Image' },
  qr: { color: 'info', icon: 'solar:qr-code-bold', label: 'QR Code' },
  text: { color: 'default', icon: 'solar:text-bold', label: 'Text' },
  link: { color: 'warning', icon: 'solar:link-bold', label: 'Link' },
};

export function KioskScreenCard({ screen, selected, onClick, onEdit }) {
  const meta = CHIP_COLOR_MAP[screen.type] || {
    color: 'default',
    icon: 'solar:document-bold',
    label: screen.type,
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: (theme) => `1.5px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: (theme) =>
          selected
            ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.04)
            : 'background.paper',
        transition: (theme) => theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
        '&:hover': {
          bgcolor: (theme) =>
            selected
              ? alpha(theme.palette.primary.main, 0.16)
              : alpha(theme.palette.action.hover, 0.08),
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
              bgcolor: (theme) => (selected ? 'primary.main' : theme.palette.background.neutral),
              color: (theme) => (selected ? 'primary.contrastText' : 'text.secondary'),
              transition: (theme) => theme.transitions.create(['background-color', 'color']),
            }}
          >
            {screen.id}
          </Box>

          <div>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {screen.name || `Widget ${screen.id}`}
            </Typography>

            <Label
              color={meta.color}
              variant="soft"
              size="small"
              startIcon={<Iconify icon={meta.icon} width={13} />}
              sx={{ mt: 0.5, height: 20, px: 0.75, fontSize: 10, fontWeight: 700 }}
            >
              {meta.label}
            </Label>
          </div>
        </Stack>

        {onEdit && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            sx={{ color: 'text.secondary' }}
          >
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        )}
      </Stack>
    </Card>
  );
}