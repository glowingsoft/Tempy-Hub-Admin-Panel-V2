import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { varAlpha } from 'src/theme/styles';

import { fireDrillsOverview as defaultData } from './mocks/data';

// ----------------------------------------------------------------------

export function OwnerFireDrills({
  title = 'Fire drills',
  subheader = 'Org-wide, this quarter',
  data = defaultData,
  sx,
  ...other
}) {
  const theme = useTheme();

  const completed = data?.completed ?? 11;
  const overdue = data?.overdue ?? 1;
  const total = data?.totalSites ?? completed + overdue;
  const complianceRate = data?.complianceRate ?? Math.round((completed / total) * 100);

  const completedPct = ((completed / total) * 100).toFixed(1);
  const overduePct = ((overdue / total) * 100).toFixed(1);

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
        {/* KPI Numbers Side-by-Side */}
        <Box
          sx={{
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          {/* Completed Metric */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: { xs: 32, md: 36 },
                fontWeight: 'fontWeightBold',
                color: 'success.main',
                lineHeight: 1.1,
                mb: 0.5,
              }}
            >
              {completed}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Completed
            </Typography>
          </Box>

          {/* Overdue Metric */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: { xs: 32, md: 36 },
                fontWeight: 'fontWeightBold',
                color: 'error.main',
                lineHeight: 1.1,
                mb: 0.5,
              }}
            >
              {overdue}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Overdue site
            </Typography>
          </Box>
        </Box>

        {/* Visual Compliance Progress Graph */}
        <Box sx={{ my: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1, typography: 'caption', color: 'text.secondary' }}
          >
            <span>Quarterly Compliance: <strong>{complianceRate}%</strong></span>
            <span>Target: 100%</span>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              height: 10,
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
              gap: '2px',
            }}
          >
            <Tooltip title={`Completed: ${completed} (${completedPct}%)`} arrow placement="top">
              <Box
                sx={{
                  width: `${completedPct}%`,
                  bgcolor: 'success.main',
                  height: 1,
                  transition: (t) => t.transitions.create('opacity'),
                  '&:hover': { opacity: 0.85 },
                  cursor: 'pointer',
                }}
              />
            </Tooltip>

            <Tooltip title={`Overdue: ${overdue} (${overduePct}%)`} arrow placement="top">
              <Box
                sx={{
                  width: `${overduePct}%`,
                  bgcolor: 'error.main',
                  height: 1,
                  transition: (t) => t.transitions.create('opacity'),
                  '&:hover': { opacity: 0.85 },
                  cursor: 'pointer',
                }}
              />
            </Tooltip>
          </Box>
        </Box>

        {/* Informative Footer Status */}
        <Typography
          variant="caption"
          sx={{
            color: overdue > 0 ? 'error.main' : 'success.main',
            mt: 2,
            pt: 1.5,
            borderTop: (t) => `1px dashed ${t.vars.palette.divider}`,
            display: 'block',
            fontWeight: 500,
          }}
        >
          {overdue > 0
            ? `Action required: ${overdue} site overdue for fire safety drill this quarter.`
            : 'All sites currently compliant with fire safety drills.'}
        </Typography>
      </CardContent>
    </Card>
  );
}
