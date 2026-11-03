import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { useGetChatRecipientsQuery } from 'src/store/Reducer/chats-api';

import { mapRecipientOption } from './utils';

// ----------------------------------------------------------------------

export function ChatHeaderCompose({
  organizationId,
  branchId,
  recipients,
  onAddRecipients,
  sendToAll,
  onSendToAllChange,
  disabled,
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'stretch', md: 'center' }}
      spacing={1}
      sx={{ width: 1, minWidth: 0 }}
    >
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', flexShrink: 0 }}>
        To
      </Typography>

      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <InfiniteAutocomplete
          key={branchId || 'all'}
          multiple
          value={recipients}
          onChange={onAddRecipients}
          useQuery={useGetChatRecipientsQuery}
          queryArgs={{ organizationId, ...(branchId ? { branchId } : {}) }}
          mapOption={mapRecipientOption}
          enabled={Boolean(organizationId) && !sendToAll}
          disabled={disabled || sendToAll}
          placeholder="+ Next of kin"
          limitTags={3}
          size="small"
          renderTags={(selected, getTagProps) =>
            selected.map((recipient, index) => (
              <Chip
                {...getTagProps({ index })}
                key={recipient.value}
                label={recipient.name || recipient.label}
                avatar={
                  <Avatar alt={recipient.name} src={recipient.photoUrl || undefined}>
                    {recipient.name?.charAt(0)}
                  </Avatar>
                }
                size="small"
                variant="soft"
              />
            ))
          }
        />
      </Box>

      <FormControlLabel
        sx={{ flexShrink: 0, mr: 0, ml: 0 }}
        control={
          <Switch
            size="small"
            checked={sendToAll}
            onChange={(event) => onSendToAllChange(event.target.checked)}
            disabled={disabled}
          />
        }
        label={
          <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
            All next of kin at this site
          </Typography>
        }
      />
    </Stack>
  );
}
