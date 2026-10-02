import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';
import { Label } from 'src/components/label';

import { getEvacuationTypeMeta } from './mocks/data';

// ----------------------------------------------------------------------

/**
 * Live evacuation banner.
 * APIs later:
 *  - GET FIRE_DRILL_API.active
 *  - POST FIRE_DRILL_API.close
 */
export function ActiveEvacuationBanner({ event, onViewRollcall, onCloseEvacuation }) {
  if (!event) return null;

  const typeMeta = getEvacuationTypeMeta(event.type);
  const stats = event.stats || {};

  return (
    <Alert
      severity={event.type === 'real' ? 'error' : 'warning'}
      variant="outlined"
      sx={{ mb: 2, alignItems: 'flex-start' }}
      action={
        <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
          <Button size="small" color="inherit" onClick={() => onViewRollcall?.(event)}>
            Rollcall
          </Button>
          <Button size="small" variant="contained" color="inherit" onClick={() => onCloseEvacuation?.(event)}>
            Close
          </Button>
        </Stack>
      }
    >
      <AlertTitle sx={{ mb: 0.5 }}>
        Evacuation active
        <Label variant="soft" color={typeMeta.color} sx={{ ml: 1, verticalAlign: 'middle' }}>
          {typeMeta.label}
        </Label>
      </AlertTitle>
      <Typography variant="body2">
        Started {fDateTime(event.startedAt)}
        {event.startedByName ? ` · ${event.startedByName}` : ''}
        {event.assemblyPoint ? ` · ${event.assemblyPoint}` : ''}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Safe {stats.safe ?? 0} · Missing {stats.missing ?? 0} · Not yet {stats.unknown ?? 0}
        {stats.total != null ? ` · of ${stats.total}` : ''}
      </Typography>
    </Alert>
  );
}
