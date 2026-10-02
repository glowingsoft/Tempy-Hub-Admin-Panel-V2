import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';

// ----------------------------------------------------------------------

const REVENUE_DATA = [
  {
    name: 'Demo Care Group',
    value: 48200,
    formatted: '£48,200',
    percent: 88.28,
    color: '#5E48E8',
    modules: 12,
  },
  {
    name: 'Willow Care Group',
    value: 6400,
    formatted: '£6,400',
    percent: 11.72,
    color: '#8C7CFF',
    modules: 1,
  },
];

// ----------------------------------------------------------------------

export function RevenueByOrganization({
  title = 'Revenue by Organization',
  subheader = 'Monthly recurring revenue, current billing cycle',
  data = REVENUE_DATA,
  sx,
  ...other
}) {
  return (
    <Card sx={{ height: 1, display: 'flex', flexDirection: 'column', ...sx }} {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{ pb: 1.5 }}
      />

      <Box sx={{ px: 3, pb: 3, flexGrow: 1 }}>
        {/* Organization Rows */}
        <Stack spacing={1.5}>
          {data.map((item) => (
            <Stack
              key={item.name}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ minHeight: 32 }}
            >
              {/* Organization Name */}
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                }}
              >
                {item.name}
              </Typography>

              {/* Formatted Revenue Value */}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                }}
              >
                {item.formatted}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Card>
  );
}
