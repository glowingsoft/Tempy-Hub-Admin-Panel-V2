import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {Iconify} from 'src/components/iconify';

import { ROTA_STAFF_QUICK_ACTIONS } from './mocks/data';

// ----------------------------------------------------------------------
// Shown in the left sidebar once a staff member's row is selected on the
// grid. "Back" returns to the location summary (RotaSummaryStats).
// ----------------------------------------------------------------------

export default function RotaStaffDetailPanel({ staff, onBack, onAction }) {
  if (!staff) return null;

  return (
    <Stack spacing={2}>
      <Button
        size="small"
        onClick={onBack}
        startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
        sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
      >
        Back
      </Button>

      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.darker', fontWeight: 700 }}>
          {staff.name
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </Avatar>
        <Stack spacing={0.25}>
          <Typography variant="subtitle1">{staff.name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {staff.role}
          </Typography>
          {staff.breakRequired && (
            <Typography variant="caption" sx={{ color: 'warning.main' }}>
              Break Required
            </Typography>
          )}
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {staff.totalHours}
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <List disablePadding >
        {ROTA_STAFF_QUICK_ACTIONS.map((action) => (
          <ListItemButton
            key={action.key}
            onClick={() => onAction?.(action.key, staff)}
            sx={{ px: 1, borderRadius: 1,border: '1px solid', borderColor: 'divider',my:1 }}
          >
            <ListItemIcon >
              <Iconify icon={action.icon} width={18} sx={{ color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {action.label}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Stack>
  );
}
