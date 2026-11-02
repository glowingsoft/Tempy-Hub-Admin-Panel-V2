import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';

import { ChatRoomSkeleton } from './chat-skeleton';
import { formatResidentNames } from './utils';

// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

const NAV_DRAWER_WIDTH = 320;

export function ChatRoom({ collapseNav, contact, loading }) {
  const theme = useTheme();
  const { collapseDesktop, openMobile, onCloseMobile } = collapseNav;
  const residents = Array.isArray(contact?.residents) ? contact.residents : [];

  const renderContent = loading && !contact ? (
    <ChatRoomSkeleton />
  ) : (
    <Scrollbar>
      <Stack alignItems="center" sx={{ py: 3, px: 2 }}>
        <Avatar
          alt={contact?.name}
          src={contact?.photoUrl || undefined}
          sx={{ width: 96, height: 96, mb: 2 }}
        >
          {contact?.name?.charAt(0)}
        </Avatar>
        <Typography variant="subtitle1">{contact?.name}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {contact?.roleLabel || 'Next of kin'}
        </Typography>
      </Stack>

      <Stack spacing={2} sx={{ px: 2, pb: 3 }}>
        {contact?.homeName && (
          <Stack direction="row" spacing={1} sx={{ typography: 'body2', wordBreak: 'break-all' }}>
            <Iconify icon="solar:buildings-2-bold" sx={{ flexShrink: 0, color: 'text.disabled' }} />
            {contact.homeName}
          </Stack>
        )}
        {contact?.email && (
          <Stack direction="row" spacing={1} sx={{ typography: 'body2', wordBreak: 'break-all' }}>
            <Iconify icon="fluent:mail-24-filled" sx={{ flexShrink: 0, color: 'text.disabled' }} />
            {contact.email}
          </Stack>
        )}
        {contact?.phone && (
          <Stack direction="row" spacing={1} sx={{ typography: 'body2', wordBreak: 'break-all' }}>
            <Iconify icon="solar:phone-bold" sx={{ flexShrink: 0, color: 'text.disabled' }} />
            {contact.phone}
          </Stack>
        )}
        <Stack direction="row" spacing={1} sx={{ typography: 'body2', wordBreak: 'break-all' }}>
          <Iconify icon="solar:users-group-rounded-bold" sx={{ flexShrink: 0, color: 'text.disabled' }} />
          {formatResidentNames(residents) || 'No linked residents'}
        </Stack>
      </Stack>
    </Scrollbar>
  );

  return (
    <>
      <Stack
        sx={{
          minHeight: 0,
          flex: '1 1 auto',
          width: NAV_WIDTH,
          display: { xs: 'none', lg: 'flex' },
          borderLeft: `solid 1px ${theme.vars.palette.divider}`,
          transition: theme.transitions.create(['width'], {
            duration: theme.transitions.duration.shorter,
          }),
          ...(collapseDesktop && { width: 0 }),
        }}
      >
        {!collapseDesktop && renderContent}
      </Stack>

      <Drawer
        anchor="right"
        open={openMobile}
        onClose={onCloseMobile}
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: NAV_DRAWER_WIDTH } }}
      >
        {renderContent}
      </Drawer>
    </>
  );
}
