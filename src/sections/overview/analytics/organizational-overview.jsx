import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

const ORGANIZATIONS = [
  { id: 'willow', name: 'Willow Care Group' },
  { id: 'demo', name: 'Demo Care Group' },
];

// Accurate platform figures mapped to active dashboard metrics:
// Sites: 14 total (Willow: 4 [29%], Demo: 10 [71%])
// Staff: 342 total (Willow: 110 [32%], Demo: 232 [68%])
// Residents: 196 total (Willow: 74 [38%], Demo: 122 [62%])
// Modules: 14 total (Willow: 2 [14%], Demo: 12 [86%])
// Site Managers: 14 total (Willow: 5 [36%], Demo: 9 [64%])
// Line Managers: 14 total (Willow: 4 [29%], Demo: 10 [71%])
const ORG_METRICS = {
  willow: [
    { category: 'Sites', value: 4, percent: 28.6, total: 14, unit: 'sites', color: '#00B8D9' },
    { category: 'Staff', value: 110, percent: 32.2, total: 342, unit: 'staff', color: '#22C55E' },
    { category: 'Residents', value: 74, percent: 37.8, total: 196, unit: 'residents', color: '#FF5630' },
    { category: 'Modules', value: 2, percent: 14.3, total: 14, unit: 'modules', color: '#8E33FF' },
    { category: 'Site Managers', value: 5, percent: 35.7, total: 14, unit: 'site managers', color: '#FFAB00' },
    { category: 'Line Managers', value: 4, percent: 28.6, total: 14, unit: 'line managers', color: '#1877F2' },
  ],
  demo: [
    { category: 'Sites', value: 10, percent: 71.4, total: 14, unit: 'sites', color: '#00B8D9' },
    { category: 'Staff', value: 232, percent: 67.8, total: 342, unit: 'staff', color: '#22C55E' },
    { category: 'Residents', value: 122, percent: 62.2, total: 196, unit: 'residents', color: '#FF5630' },
    { category: 'Modules', value: 12, percent: 85.7, total: 14, unit: 'modules', color: '#8E33FF' },
    { category: 'Site Managers', value: 9, percent: 64.3, total: 14, unit: 'site managers', color: '#FFAB00' },
    { category: 'Line Managers', value: 10, percent: 71.4, total: 14, unit: 'line managers', color: '#1877F2' },
  ],
};

// ----------------------------------------------------------------------

export function OrganizationalOverview({
  title = 'Organizational Overview',
  subheader = 'Relative footprint across the platform',
  sx,
  ...other
}) {
  const [selectedOrg, setSelectedOrg] = useState('willow');

  const currentOrg = ORGANIZATIONS.find((org) => org.id === selectedOrg) || ORGANIZATIONS[0];
  const metrics = ORG_METRICS[selectedOrg] || ORG_METRICS.willow;

  return (
    <Card sx={{ height: 1, display: 'flex', flexDirection: 'column', ...sx }} {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Label
            variant="soft"
            color="warning"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 1.25,
              py: 0.5,
              borderRadius: 1.5,
              fontSize: '0.75rem',
            }}
          >
            Replaces radar chart
          </Label>
        }
        sx={{ mb: 2 }}
      />

      <Box sx={{ p: 3, pt: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Organization Select Bar */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ mb: 3 }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.8125rem',
            }}
          >
            Select organization:
          </Typography>

          <Select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            size="small"
            sx={{
              height: 34,
              minWidth: 180,
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: 1.25,
              bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.100' : 'grey.800'),
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
            }}
          >
            {ORGANIZATIONS.map((org) => (
              <MenuItem key={org.id} value={org.id}>
                {org.name}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        {/* Metric Rows with generous spacing and distinct category colors */}
        <Stack spacing={2.75} sx={{ mb: 3, flexGrow: 1, justifyContent: 'center' }}>
          {metrics.map((item) => (
            <Stack
              key={item.category}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ minHeight: 26 }}
            >
              {/* Category Name */}
              <Typography
                variant="body2"
                sx={{
                  width: 110,
                  flexShrink: 0,
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                }}
              >
                {item.category}
              </Typography>

              {/* Progress Bar Track with Distinct Color */}
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Tooltip
                  title={`${currentOrg.name}: ${item.value} ${item.unit} (${item.percent.toFixed(1)}% of platform total · ${item.total} total)`}
                  arrow
                  placement="top"
                >
                  <Box
                    sx={{
                      width: 1,
                      height: 10,
                      borderRadius: 999,
                      bgcolor: 'action.hover',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${item.percent}%`,
                        height: 1,
                        borderRadius: 999,
                        bgcolor: item.color,
                        cursor: 'pointer',
                        transition: 'width 0.35s ease-in-out, filter 0.2s ease',
                        '&:hover': {
                          filter: 'brightness(1.15)',
                          transform: 'scaleY(1.25)',
                        },
                      }}
                    />
                  </Box>
                </Tooltip>
              </Box>

              {/* Value / Number Shown in Front */}
              <Typography
                variant="subtitle2"
                sx={{
                  width: 44,
                  flexShrink: 0,
                  textAlign: 'right',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: item.color,
                }}
              >
                {item.value}
              </Typography>
            </Stack>
          ))}
        </Stack>

        {/* Footer Caption */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: 'text.disabled',
            fontSize: '0.785rem',
            lineHeight: 1.5,
            mt: 'auto',
            pt: 1.5,
          }}
        >
        </Typography>
      </Box>
    </Card>
  );
}
