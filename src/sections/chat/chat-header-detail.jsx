import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useResponsive } from 'src/hooks/use-responsive';
import { Iconify } from 'src/components/iconify';

import { ChatHeaderSkeleton } from './chat-skeleton';
import { formatResidentNames } from './utils';

// ----------------------------------------------------------------------

export function ChatHeaderDetail({ collapseNav, contact, loading }) {
  const lgUp = useResponsive('up', 'lg');
  const { collapseDesktop, onCollapseDesktop, onOpenMobile } = collapseNav;

  const handleToggleNav = useCallback(() => {
    if (lgUp) {
      onCollapseDesktop();
    } else {
      onOpenMobile();
    }
  }, [lgUp, onCollapseDesktop, onOpenMobile]);

  if (loading && !contact) {
    return <ChatHeaderSkeleton />;
  }

  const residentNames = formatResidentNames(contact?.residents);

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flexGrow: 1 }}>
        <Avatar alt={contact?.name} src={contact?.photoUrl || undefined} sx={{ width: 36, height: 36 }}>
          {contact?.name?.charAt(0)}
        </Avatar>

        <ListItemText
          primary={contact?.name || 'Conversation'}
          secondary={[contact?.roleLabel, residentNames, contact?.homeName].filter(Boolean).join(' · ')}
          primaryTypographyProps={{ noWrap: true, variant: 'subtitle2' }}
          secondaryTypographyProps={{ noWrap: true, component: 'span' }}
        />
      </Stack>

      <Stack direction="row" flexShrink={0}>
        <IconButton onClick={handleToggleNav}>
          <Iconify icon={!collapseDesktop ? 'ri:sidebar-unfold-fill' : 'ri:sidebar-fold-fill'} />
        </IconButton>
      </Stack>
    </>
  );
}
