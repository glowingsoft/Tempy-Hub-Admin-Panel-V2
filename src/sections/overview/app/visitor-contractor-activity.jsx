import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fNumber } from 'src/utils/format-number';
import { varAlpha } from 'src/theme/styles';
import { ChartSelect } from 'src/components/chart';

// ----------------------------------------------------------------------

const ACTIVITY_DATA = {
  'This week': {
    visitorVisits: 38,
    contractorVisits: 9,
    avgDuration: '42 min',
    topReasons: [
      { label: 'Family visit', count: 26 },
      { label: 'Maintenance', count: 7 },
      { label: 'Healthcare pro', count: 4 },
    ],
  },
  'This month': {
    visitorVisits: 142,
    contractorVisits: 37,
    avgDuration: '48 min',
    topReasons: [
      { label: 'Family visit', count: 99 },
      { label: 'Maintenance', count: 25 },
      { label: 'Healthcare pro', count: 14 },
    ],
  },
  'This year': {
    visitorVisits: 1680,
    contractorVisits: 412,
    avgDuration: '51 min',
    topReasons: [
      { label: 'Family visit', count: 1180 },
      { label: 'Maintenance', count: 310 },
      { label: 'Healthcare pro', count: 190 },
    ],
  },
};

const TIMEFRAME_OPTIONS = ['This week', 'This month', 'This year'];

// ----------------------------------------------------------------------

export function VisitorContractorActivity({ sx, ...other }) {
  const [timeframe, setTimeframe] = useState('This month');

  const currentData = ACTIVITY_DATA[timeframe] || ACTIVITY_DATA['This month'];

  const totalCount = currentData.topReasons.reduce((acc, curr) => acc + curr.count, 0) || 1;

  return (
    <Card sx={{ p: 3, ...sx }} {...other}>
      {/* Header with Title and Dropdown */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Visitor and contractor activity
        </Typography>

        <ChartSelect
          value={timeframe}
          onChange={setTimeframe}
          options={TIMEFRAME_OPTIONS}
        />
      </Stack>

      {/* 3 Metric Sub-Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
          <Box
            sx={{
              p: 2.5,
              width: 1,
              height: 104,
              borderRadius: 1.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {fNumber(currentData.visitorVisits)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, fontWeight: 500 }}>
              Visitor visits
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
          <Box
            sx={{
              p: 2.5,
              width: 1,
              height: 104,
              borderRadius: 1.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {fNumber(currentData.contractorVisits)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, fontWeight: 500 }}>
              Contractor/professional visits
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
          <Box
            sx={{
              p: 2.5,
              width: 1,
              height: 104,
              borderRadius: 1.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {currentData.avgDuration}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, fontWeight: 500 }}>
              Avg visit duration
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Top visit reasons */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ color: 'text.secondary', fontWeight: 600, mb: 2 }}
        >
          Top visit reasons
        </Typography>

        <Stack spacing={2}>
          {currentData.topReasons.map((item) => {
            const percentage = Math.min(Math.round((item.count / totalCount) * 100), 100);

            return (
              <Stack
                key={item.label}
                direction="row"
                alignItems="center"
                spacing={2}
              >
                <Typography
                  variant="body2"
                  sx={{
                    width: { xs: 100, sm: 120 },
                    flexShrink: 0,
                    color: 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </Typography>

                <Box
                  sx={{
                    flexGrow: 1,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      borderRadius: 4,
                      bgcolor: 'primary.light',
                      width: `${percentage}%`,
                      transition: 'width 0.5s ease-in-out',
                    }}
                  />
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    width: 40,
                    flexShrink: 0,
                    textAlign: 'right',
                    fontWeight: 600,
                    color: 'text.secondary',
                  }}
                >
                  {fNumber(item.count)}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Card>
  );
}
