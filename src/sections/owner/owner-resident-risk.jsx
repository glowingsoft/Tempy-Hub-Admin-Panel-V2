import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { residentEvacuationRisk as defaultData } from './mocks/data';

// ----------------------------------------------------------------------

export function OwnerResidentRisk({
  title = 'Resident evacuation risk',
  subheader = 'PEEP levels, org-wide',
  data = defaultData,
  sx,
  ...other
}) {
  const theme = useTheme();

  const total = data.reduce((acc, cur) => acc + (cur.value || 0), 0) || 1;

  const colorMap = {
    error: {
      dot: theme.vars.palette.error.main,
      text: theme.vars.palette.error.main,
      bar: theme.vars.palette.error.main,
    },
    warning: {
      dot: theme.vars.palette.warning.main,
      text: theme.vars.palette.warning.main,
      bar: theme.vars.palette.warning.main,
    },
    success: {
      dot: theme.vars.palette.success.main,
      text: theme.vars.palette.success.main,
      bar: theme.vars.palette.success.main,
    },
    default: {
      dot: theme.vars.palette.grey[400] || '#919EAB',
      text: theme.vars.palette.text.secondary,
      bar: theme.vars.palette.grey[400] || '#919EAB',
    },
  };

  return (
    <Card sx={{ height: 1, display: 'flex', flexDirection: 'column', ...sx }} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ pb: 1 }} />

      <CardContent
        sx={{
          p: 3,
          pt: 1.5,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Proportional Segmented Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1, typography: 'caption', color: 'text.secondary' }}
          >
            <span>Total Residents: {total}</span>
            <span>Distribution</span>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              height: 10,
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: 'background.neutral',
              gap: '2px',
            }}
          >
            {data.map((item) => {
              const pct = ((item.value / total) * 100).toFixed(1);
              const palette = colorMap[item.color] || colorMap.default;

              return (
                <Tooltip
                  key={item.label}
                  title={`${item.label}: ${item.value} (${pct}%)`}
                  arrow
                  placement="top"
                >
                  <Box
                    sx={{
                      width: `${(item.value / total) * 100}%`,
                      bgcolor: palette.bar,
                      height: 1,
                      transition: (t) => t.transitions.create('opacity'),
                      '&:hover': { opacity: 0.8 },
                      cursor: 'pointer',
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        </Box>

        {/* Breakdown Items List */}
        <Stack spacing={1.25}>
          {data.map((item) => {
            const palette = colorMap[item.color] || colorMap.default;

            return (
              <Stack
                key={item.label}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  py: 0.75,
                  px: 1,
                  borderRadius: 1,
                  transition: (t) => t.transitions.create('background-color'),
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: palette.dot,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {item.label}
                  </Typography>
                </Stack>

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 'fontWeightBold',
                    color: palette.text,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {item.value}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
