import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fShortenNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

export function EcommerceYearlySales({
  title,
  subheader,
  chart,
  height,
  selectedSeries: selectedSeriesProp,
  onSeriesChange,
  seriesOptions,
  hideSeriesSelect = false,
  sx,
  ...other
}) {
  const theme = useTheme();

  const [internalSeries, setInternalSeries] = useState(chart.series[0]?.name ?? '2026');
  const selectedSeries = selectedSeriesProp ?? internalSeries;

  const chartColors = chart.colors ?? [theme.palette.primary.main, theme.palette.warning.main];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: chart.categories },
    ...chart.options,
  });

  const handleChangeSeries = useCallback((newValue) => {
    if (onSeriesChange) {
      onSeriesChange(newValue);
      return;
    }
    setInternalSeries(newValue);
  }, [onSeriesChange]);

  const currentSeries = chart.series.find((i) => i.name === selectedSeries) ?? chart.series[0];

  return (
    <Card
      {...other}
      sx={{
        width: 1,
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          hideSeriesSelect ? null : (
            <ChartSelect
              options={seriesOptions ?? chart.series.map((item) => item.name)}
              value={selectedSeries}
              onChange={handleChangeSeries}
            />
          )
        }
        sx={{ mb: 3 }}
      />

      <ChartLegends
        colors={chartOptions?.colors}
        labels={chart.series[0].data.map((item) => item.name)}
        // values={[fShortenNumber(1234), fShortenNumber(6789)]}
        sx={{ px: 3, gap: 3 }}
      />

      <Chart
        type="area"
        series={currentSeries?.data}
        options={chartOptions}
        height={height ?? 320}
        sx={{ py: 2.5, pl: 1, pr: 2.5, flex: 1, minHeight: height ?? 320, width: 1 }}
      />
    </Card>
  );
}
