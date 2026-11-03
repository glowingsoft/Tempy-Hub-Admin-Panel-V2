import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';

// ----------------------------------------------------------------------

const METRIC_DEFS = [
  { key: 'sites', category: 'Sites', totalKey: 'sites', unit: 'sites', color: '#00B8D9' },
  { key: 'staff', category: 'Staff', totalKey: 'staff', unit: 'staff', color: '#22C55E' },
  { key: 'residents', category: 'Residents', totalKey: 'residents', unit: 'residents', color: '#FF5630' },
  { key: 'modules', category: 'Modules', totalKey: null, unit: 'modules', color: '#8E33FF' },
  { key: 'siteManagers', category: 'Site Managers', totalKey: null, unit: 'site managers', color: '#FFAB00' },
  { key: 'lineManagers', category: 'Line Managers', totalKey: null, unit: 'line managers', color: '#1877F2' },
];

function buildMetrics(overview = {}, totals = {}) {
  return METRIC_DEFS.map((def) => {
    const value = overview[def.key] ?? 0;
    const total = def.totalKey ? totals[def.totalKey] : null;
    const percent = total > 0 ? (Number(value) / Number(total)) * 100 : value > 0 ? 100 : 0;

    return {
      ...def,
      value,
      total,
      percent,
    };
  });
}

// ----------------------------------------------------------------------

export function OrganizationalOverview({
  title = 'Organizational Overview',
  subheader = 'Relative footprint across the platform',
  organizations = [],
  overview = {},
  totals = {},
  selectedOrganizationId,
  onOrganizationChange,
  sx,
  ...other
}) {
  const selectedId = selectedOrganizationId || overview.organizationId || organizations[0]?.organizationId || '';
  const currentOrg =
    organizations.find((org) => org.organizationId === selectedId) || overview;
  const metrics = buildMetrics(overview, totals);

  return (
    <Card sx={{ height: 1, display: 'flex', flexDirection: 'column', ...sx }} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 2 }} />

      <Box sx={{ p: 3, pt: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 3 }}>
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
            value={selectedId}
            onChange={(event) => onOrganizationChange?.(event.target.value)}
            size="small"
            displayEmpty
            renderValue={(value) => {
              const selected = organizations.find((org) => org.organizationId === value);
              return selected?.name || '';
            }}
            MenuProps={{
              PaperProps: {
                sx: { width: 240, maxHeight: 280 },
              },
            }}
            sx={{
              height: 34,
              width: 240,
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: 1.25,
              bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.100' : 'grey.800'),
              '& .MuiSelect-select': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
            }}
          >
            {organizations.map((org) => (
              <MenuItem key={org.organizationId} value={org.organizationId} sx={{ maxWidth: 240 }}>
                <Tooltip title={org.name} arrow placement="right">
                  <Typography noWrap sx={{ width: 1, fontSize: '0.8125rem', fontWeight: 600 }}>
                    {org.name}
                  </Typography>
                </Tooltip>
              </MenuItem>
            ))}
          </Select>
        </Stack>

        <Stack spacing={2.75} sx={{ mb: 3, flexGrow: 1, justifyContent: 'center' }}>
          {metrics.map((item) => (
            <Stack
              key={item.category}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ minHeight: 26 }}
            >
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

              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <Tooltip
                  title={
                    item.total != null
                      ? `${currentOrg?.name || 'Organization'}: ${item.value} ${item.unit} (${item.percent.toFixed(1)}% of platform total · ${item.total} total)`
                      : `${currentOrg?.name || 'Organization'}: ${item.value} ${item.unit}`
                  }
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
                        width: `${Math.min(item.percent, 100)}%`,
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
      </Box>
    </Card>
  );
}
