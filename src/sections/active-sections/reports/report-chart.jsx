import { Box, Card, CardHeader, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export function ReportChart({
  chart,
  loading = false,
  title = 'Weekly attendance',
  subheader,
}) {
  const theme = useTheme();

  const chartColors = chart?.colors ?? [
    theme.palette.primary.main,
    theme.palette.warning.main,
  ];

  const categoriesCount = chart?.categories?.length ?? 0;
  const isDenseChart = categoriesCount > 14;

  const chartOptions = useChart({
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
    },

    colors: chartColors,

    xaxis: {
      categories: chart?.categories ?? [],
      labels: {
        style: {
          fontSize: isDenseChart ? '10px' : '12px',
        },
      },
    },

    plotOptions: {
      bar: {
        columnWidth: isDenseChart ? '75%' : '45%',
        borderRadius: isDenseChart ? 2 : 4,
      },
    },

    dataLabels: {
      enabled: false,
    },

    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
  });

  return (
    <Card>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ p: 2 }}>
        {loading ? (
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1.5 }} />
        ) : (
          <Chart
            type="bar"
            series={chart?.series ?? []}
            options={chartOptions}
            height={300}
          />
        )}
      </Box>
    </Card>
  );
}