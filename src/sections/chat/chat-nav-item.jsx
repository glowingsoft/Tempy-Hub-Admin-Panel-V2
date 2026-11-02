import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';

import { useRouter } from 'src/routes/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
import { fToNow } from 'src/utils/format-time';

import { formatResidentNames, getConversationId } from './utils';

// ----------------------------------------------------------------------

export function ChatNavItem({ selected, collapse, contact, onCloseMobile, basePath }) {
  const mdUp = useResponsive('up', 'md');
  const router = useRouter();

  const conversationId = getConversationId(contact);
  const lastMessage = contact.lastMessage;
  const residentNames = formatResidentNames(contact.residents);
  const notSeen = Boolean(contact.notRead || contact.unreadCount);
  const metaLine = [residentNames, contact.homeName].filter(Boolean).join(' · ');

  const handleClickConversation = useCallback(() => {
    if (!mdUp) {
      onCloseMobile();
    }
    if (!conversationId) return;
    router.push(`${basePath}?id=${conversationId}`);
  }, [basePath, conversationId, mdUp, onCloseMobile, router]);

  if (collapse) {
    return (
      <Box component="li" sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
        <IconButton
          onClick={handleClickConversation}
          sx={{
            p: 0,
            width: 36,
            height: 36,
            minWidth: 36,
            flexShrink: 0,
            borderRadius: '50%',
            bgcolor: selected ? 'action.hover' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Avatar
            alt={contact.name}
            src={contact.photoUrl || undefined}
            sx={{
              width: 32,
              height: 32,
              minWidth: 32,
              minHeight: 32,
              flexShrink: 0,
              fontSize: 14,
              aspectRatio: '1 / 1',
            }}
          >
            {contact.name?.charAt(0)}
          </Avatar>
        </IconButton>
      </Box>
    );
  }

  return (
    <Box component="li" sx={{ display: 'flex' }}>
      <ListItemButton
        onClick={handleClickConversation}
        sx={{
          py: 1.25,
          px: 1.5,
          gap: 1.5,
          alignItems: 'flex-start',
          borderRadius: 1,
          mx: 1,
          mb: 0.25,
          ...(selected && { bgcolor: 'action.selected' }),
        }}
      >
        <Avatar
          alt={contact.name}
          src={contact.photoUrl || undefined}
          sx={{ width: 40, height: 40, fontSize: 16, mt: 0.25 }}
        >
          {contact.name?.charAt(0)}
        </Avatar>

        <Stack sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle2" noWrap sx={{ flex: 1, minWidth: 0 }}>
                {contact.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                noWrap
                sx={{ flexShrink: 0 }}
              >
                {lastMessage?.createdAt ? fToNow(lastMessage.createdAt) : ''}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.25 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ flex: 1, minWidth: 0 }}
              >
                {lastMessage?.messageContent || 'No messages yet'}
              </Typography>
              {notSeen && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    flexShrink: 0,
                    borderRadius: '50%',
                    bgcolor: 'warning.main',
                  }}
                />
              )}
            </Stack>

            {metaLine && (
              <Typography variant="caption" color="text.disabled" noWrap sx={{ mt: 0.25 }}>
                {metaLine}
              </Typography>
            )}
          </Stack>
      </ListItemButton>
    </Box>
  );
}
