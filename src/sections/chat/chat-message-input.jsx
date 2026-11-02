import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ChatMessageInput({ disabled, sending, onSend }) {
  const [message, setMessage] = useState('');

  const handleSendMessage = useCallback(async () => {
    const next = message.trim();
    if (!next || sending) return;

    try {
      await onSend?.(next);
      setMessage('');
    } catch {
      // parent surfaces the error
    }
  }, [message, onSend, sending]);

  const handleKeyUp = useCallback(
    (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1.25,
        flexShrink: 0,
        borderTop: (theme) => `solid 1px ${theme.vars.palette.divider}`,
      }}
    >
      <InputBase
        name="chat-message"
        id="chat-message-input"
        value={message}
        onKeyUp={handleKeyUp}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Type a message"
        disabled={disabled || sending}
        endAdornment={
          <Stack direction="row" sx={{ flexShrink: 0 }}>
            <IconButton
              color="primary"
              aria-label="Send message"
              onClick={handleSendMessage}
              disabled={disabled || sending || !message.trim()}
            >
              <Iconify icon="iconamoon:send-fill" />
            </IconButton>
          </Stack>
        }
        sx={{
          px: 1.5,
          width: 1,
          display: 'flex',
          height: 44,
          borderRadius: 1,
          bgcolor: 'background.neutral',
        }}
      />
    </Box>
  );
}
