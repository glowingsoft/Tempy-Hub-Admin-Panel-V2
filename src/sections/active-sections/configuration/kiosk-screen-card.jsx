import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

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

  const displayTitle = screen.title || screen.name || `Widget ${screen.sortOrder || screen.id || 1}`;
  const displaySubtitle =
    screen.type === 'text'
      ? screen.config?.body || screen.value
      : screen.type === 'image'
        ? screen.config?.imageUrl || screen.value
        : screen.type === 'qr'
          ? screen.config?.url || screen.value
          : screen.type === 'link'
            ? screen.config?.url || screen.value
            : screen.value;

  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2,
        cursor: onClick ? 'pointer' : 'default',
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
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
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
              flexShrink: 0,
            }}
          >
            {screen.sortOrder || screen.id || 1}
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
              {displayTitle}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Label
                color={meta.color}
                variant="soft"
                size="small"
                startIcon={<Iconify icon={meta.icon} width={13} />}
                sx={{ height: 20, px: 0.75, fontSize: 10, fontWeight: 700, flexShrink: 0 }}
              >
                {meta.label}
              </Label>

              {displaySubtitle && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 220 }}>
                  {displaySubtitle}
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {onEdit && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              sx={{ color: 'text.secondary' }}
              title="Edit"
            >
              <Iconify icon="solar:pen-bold" width={18} />
            </IconButton>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
