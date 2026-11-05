import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

export function EmptyDashboardCard({ title, subheader, sx, ...other }) {
  return (
    <Card sx={{ height: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', ...sx }} {...other}>
      <CardHeader title={title} subheader={subheader} />
      <EmptyContent
        filled
        title="No data available"
        slotProps={{ img: { maxWidth: 96 } }}
        sx={{ height: 'auto', flex: 1, minHeight: 0, m: 2.5, mt: 0, py: 3, overflow: 'hidden' }}
      />
    </Card>
  );
}
