import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

import { EVAC_CHECK_STATUS, getEvacuationTypeMeta } from './mocks/data';

// ----------------------------------------------------------------------

/**
 * Rollcall detail drawer.
 * APIs later:
 *  - GET FIRE_DRILL_API.get
 *  - GET FIRE_DRILL_API.listChecks
 *  - POST FIRE_DRILL_API.upsertCheck
 *  - POST FIRE_DRILL_API.close
 */
export function EvacuationDetailDrawer({
  open,
  onClose,
  event,
  checks = [],
  onUpdateCheck,
  onCloseEvacuation,
}) {
  if (!event) return null;

  const typeMeta = getEvacuationTypeMeta(event.type);
  const stats = event.stats || {};
  const isActive = event.status === 'active';

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      slotProps={{ backdrop: { invisible: true } }}
      PaperProps={{ sx: { width: { xs: 1, sm: 400 } } }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
        <Typography variant="h6">Evacuation rollcall</Typography>
        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Stack>

      <Divider />

      <Box sx={{ px: 2, py: 1.5 }}>
        <Stack spacing={0.75}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Label variant="soft" color={typeMeta.color}>
              {typeMeta.label}
            </Label>
            <Label variant="soft" color={isActive ? 'error' : 'default'}>
              {isActive ? 'Active' : 'Closed'}
            </Label>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {event.branchName} · started {fDateTime(event.startedAt)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Safe {stats.safe ?? 0} · Missing {stats.missing ?? 0} · Not yet {stats.unknown ?? 0}
            {stats.total != null ? ` · Total ${stats.total}` : ''}
          </Typography>
        </Stack>

        {isActive && (
          <Button
            fullWidth
            size="small"
            variant="contained"
            color="inherit"
            sx={{ mt: 1.5 }}
            onClick={() => onCloseEvacuation?.(event)}
          >
            Close evacuation
          </Button>
        )}
      </Box>

      <Divider />

      <Scrollbar sx={{ flex: 1 }}>
        <Stack spacing={1} sx={{ p: 2 }}>
          {!checks.length && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No rollcall rows yet.
            </Typography>
          )}

          {checks.map((check) => {
            const meta = EVAC_CHECK_STATUS[check.status] || EVAC_CHECK_STATUS.unknown;
            return (
              <Box
                key={check._id}
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap>
                      {check.personName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      {check.personKind}
                      {check.locationLabel ? ` · ${check.locationLabel}` : ''}
                    </Typography>
                  </Box>
                  <Label variant="soft" color={meta.color}>
                    {meta.label}
                  </Label>
                </Stack>

                {isActive && (
                  <TextField
                    select
                    size="small"
                    fullWidth
                    label="Status"
                    value={check.status}
                    sx={{ mt: 1 }}
                    onChange={(e) =>
                      onUpdateCheck?.(event, { checkId: check._id, status: e.target.value })
                    }
                  >
                    {Object.entries(EVAC_CHECK_STATUS).map(([value, opt]) => (
                      <MenuItem key={value} value={value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Box>
            );
          })}
        </Stack>
      </Scrollbar>
    </Drawer>
  );
}
