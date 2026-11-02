import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { ToggleButton } from './styles';
import { ChatNavItem } from './chat-nav-item';
import { ChatNavItemSkeleton } from './chat-skeleton';
import { getConversationId } from './utils';

// ----------------------------------------------------------------------

const NAV_WIDTH = 300;

const NAV_COLLAPSE_WIDTH = 64;

export function ChatNav({
  loading,
  contacts,
  canLoadMore,
  onLoadMore,
  keyword,
  onKeywordChange,
  collapseNav,
  selectedConversationId,
  basePath,
}) {
  const theme = useTheme();
  const router = useRouter();
  const mdUp = useResponsive('up', 'md');

  const {
    openMobile,
    onOpenMobile,
    onCloseMobile,
    collapseDesktop,
    onCollapseDesktop,
  } = collapseNav;

  const handleToggleNav = useCallback(() => {
    if (mdUp) {
      onCollapseDesktop();
    } else {
      onCloseMobile();
    }
  }, [mdUp, onCloseMobile, onCollapseDesktop]);

  const handleClickCompose = useCallback(() => {
    if (!mdUp) {
      onCloseMobile();
    }
    router.push(basePath);
  }, [basePath, mdUp, onCloseMobile, router]);

  const handleScroll = useCallback(
    (event) => {
      if (loading || !canLoadMore) return;
      const listbox = event.currentTarget;
      const distanceFromBottom = listbox.scrollHeight - listbox.scrollTop - listbox.clientHeight;
      if (distanceFromBottom <= 48) {
        onLoadMore?.();
      }
    },
    [canLoadMore, loading, onLoadMore]
  );

  const renderContent = (
    <>
      <Stack
        direction={collapseDesktop ? 'column' : 'row'}
        alignItems="center"
        spacing={0.75}
        sx={{ p: collapseDesktop ? 1 : 1.5, pb: collapseDesktop ? 1 : 1 }}
      >
        <Tooltip title="New message">
          <IconButton color="primary" onClick={handleClickCompose} size="small">
            <Iconify width={20} icon="solar:pen-new-square-bold" />
          </IconButton>
        </Tooltip>

        {!collapseDesktop && (
          <TextField
            fullWidth
            size="small"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify width={18} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        )}

        <IconButton onClick={handleToggleNav} size="small">
          <Iconify
            width={18}
            icon={collapseDesktop ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'}
          />
        </IconButton>
      </Stack>

      {loading && !contacts.length ? (
        <ChatNavItemSkeleton />
      ) : collapseDesktop ? (
        <Box sx={{ overflowY: 'auto', width: 1, px: 0.75, pb: 1 }} onScroll={handleScroll}>
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {contacts.map((contact) => {
              const conversationId = getConversationId(contact);
              return (
                <ChatNavItem
                  key={conversationId || contact.recipientId}
                  collapse
                  contact={contact}
                  selected={conversationId === selectedConversationId}
                  onCloseMobile={onCloseMobile}
                  basePath={basePath}
                />
              );
            })}
          </Box>
        </Box>
      ) : (
        <Scrollbar sx={{ pb: 1 }} slotProps={{ contentWrapper: { onScroll: handleScroll } }}>
          <nav>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {contacts.map((contact) => {
                const conversationId = getConversationId(contact);
                return (
                  <ChatNavItem
                    key={conversationId || contact.recipientId}
                    contact={contact}
                    selected={conversationId === selectedConversationId}
                    onCloseMobile={onCloseMobile}
                    basePath={basePath}
                  />
                );
              })}
            </Box>
          </nav>
        </Scrollbar>
      )}
    </>
  );

  return (
    <>
      <ToggleButton onClick={onOpenMobile} sx={{ display: { md: 'none' } }}>
        <Iconify width={16} icon="solar:users-group-rounded-bold" />
      </ToggleButton>

      <Stack
        sx={{
          height: 1,
          minHeight: 0,
          flex: '1 1 auto',
          width: NAV_WIDTH,
          display: { xs: 'none', md: 'flex' },
          borderRight: `solid 1px ${theme.vars.palette.divider}`,
          bgcolor: 'background.neutral',
          transition: theme.transitions.create(['width'], {
            duration: theme.transitions.duration.shorter,
          }),
          ...(collapseDesktop && {
            width: NAV_COLLAPSE_WIDTH,
            minWidth: NAV_COLLAPSE_WIDTH,
            flex: '0 0 auto',
            alignItems: 'center',
            overflow: 'hidden',
          }),
        }}
      >
        {renderContent}
      </Stack>

      <Drawer
        open={openMobile}
        onClose={onCloseMobile}
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: NAV_WIDTH } }}
      >
        {renderContent}
      </Drawer>
    </>
  );
}
