import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fToNow } from 'src/utils/format-time';

import { getSeenLabel, isMessageSeen } from './utils';

// ----------------------------------------------------------------------

export function ChatMessageItem({ message }) {
  const body = message.messageContent || message.body || '';
  const createdAt = message.createdAt;
  const seen = isMessageSeen(message);

  return (
    <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1.5 }}>
      <Stack alignItems="flex-end" sx={{ maxWidth: { xs: 1, sm: 480 } }}>
        <Typography noWrap variant="caption" sx={{ mb: 0.75, color: 'text.disabled' }}>
          {message.senderName ? `${message.senderName} · ` : ''}
          {createdAt ? fToNow(createdAt) : ''}
        </Typography>

        <Stack
          sx={{
            p: 1.5,
            minWidth: 48,
            borderRadius: 1,
            typography: 'body2',
            color: 'grey.800',
            bgcolor: 'primary.lighter',
          }}
        >
          {body}
        </Stack>

        <Typography
          variant="caption"
          sx={{ mt: 0.5, color: seen ? 'success.main' : 'warning.main' }}
        >
          {getSeenLabel(message)}
        </Typography>
      </Stack>
    </Stack>
  );
}
