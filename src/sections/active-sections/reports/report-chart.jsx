import { Box, Card, CardHeader } from '@mui/material';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export function ReportChart({ chart }) {
  const chartOptions = useChart({
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
    },

    xaxis: {
      categories: chart.categories,
    },

    plotOptions: {
      bar: {
        columnWidth: '45%',
        borderRadius: 4,
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
      <CardHeader title="Weekly attendance" />

      <Box sx={{ p: 2 }}>
        <Chart
          type="bar"
          series={chart.series}
          options={chartOptions}
          height={280}
        />
      </Box>
    </Card>
  );
}