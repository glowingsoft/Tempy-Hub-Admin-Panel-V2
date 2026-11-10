import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------
// A single shift block. Variant drives the visual treatment:
//   default   solid neutral block with start/end time
//   sleepover outlined violet block, label only
//   vacant    italic placeholder text, no fill
// ----------------------------------------------------------------------

export default function RotaShiftChip({ shift, onClick }) {
  const { type = 'default', start, end, label } = shift;

  if (type === 'vacant') {
    return (
      <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
        Vacant
      </Typography>
    );
  }

  const isSleepover = type === 'sleepover';
  const isLeave = type === 'leave';
  const isOnCall = type === 'on-call';
  const isOpen = type === 'open';

  let sxStyle = {
    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.16),
    color: 'text.primary',
  };

  if (isOpen) {
    sxStyle = {
      border: (theme) => `1px dashed ${theme.palette.info.main}`,
      bgcolor: (theme) => alpha(theme.palette.info.main, 0.16),
      color: 'info.darker',
    };
  } else if (isSleepover) {
    sxStyle = {
      border: (theme) => `1px dashed ${theme.palette.secondary.main}`,
      bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
      color: 'secondary.main',
    };
  } else if (isLeave) {
    sxStyle = {
      border: (theme) => `1px solid ${theme.palette.warning.main}`,
      bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
      color: 'warning.darker',
    };
  } else if (isOnCall) {
    sxStyle = {
      border: (theme) => `1px dashed ${theme.palette.info.main}`,
      bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
      color: 'info.main',
    };
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        px: 1,
        py: 0.75,
        borderRadius: 1,
        cursor: 'pointer',
        textAlign: 'center',
        transition: (theme) =>
          theme.transitions.create(['box-shadow', 'transform'], { duration: 120 }),
        ...sxStyle,
        '&:hover': { boxShadow: (theme) => theme.customShadows?.z8 ?? theme.shadows[8] },
      }}
    >
      {isOpen ? (
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {label || (start && end ? `Open ${start}–${end}` : 'Open')}
        </Typography>
      ) : isSleepover ? (
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Sleepover
        </Typography>
      ) : isLeave ? (
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {label || 'Leave'}
        </Typography>
      ) : isOnCall ? (
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {label || 'On Call'}
        </Typography>
      ) : (
        <Stack spacing={0}>
          <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {start}
          </Typography>
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>
            {end}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
