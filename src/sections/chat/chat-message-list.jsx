import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';

import { Scrollbar } from 'src/components/scrollbar';

import { ChatMessageItem } from './chat-message-item';
import { useMessagesScroll } from './hooks/use-messages-scroll';
import { getMessageId, hasMorePages, reverseMessages } from './utils';

// ----------------------------------------------------------------------

export function ChatMessageList({ messages = [], loading, meta, page, onLoadOlder }) {
  const chronological = reverseMessages(messages);
  const { messagesEndRef } = useMessagesScroll(page === 1 ? chronological : null);

  const handleScroll = useCallback(
    (event) => {
      if (loading || !hasMorePages(meta, page)) return;
      if (event.currentTarget.scrollTop > 24) return;
      onLoadOlder?.();
    },
    [loading, meta, onLoadOlder, page]
  );

  if (loading && !messages.length) {
    return (
      <Stack sx={{ flex: '1 1 auto', position: 'relative' }}>
        <LinearProgress
          color="inherit"
          sx={{
            top: 0,
            left: 0,
            width: 1,
            height: 2,
            borderRadius: 0,
            position: 'absolute',
          }}
        />
      </Stack>
    );
  }

  return (
    <Scrollbar
      ref={messagesEndRef}
      slotProps={{ contentWrapper: { onScroll: handleScroll } }}
      sx={{ px: 2.5, pt: 2, pb: 2, flex: '1 1 auto', minHeight: 0 }}
    >
      {chronological.map((message) => (
        <ChatMessageItem key={getMessageId(message)} message={message} />
      ))}
    </Scrollbar>
  );
}
