import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import { useTheme } from '@mui/material/styles';

import { Label } from 'src/components/label';
import { Chart, useChart, ChartSelect } from 'src/components/chart';
import { Iconify } from 'src/components/iconify';

import { formatGb } from './utils';

// ----------------------------------------------------------------------

const YEAR_OPTIONS = ['2022', '2023', '2024', '2025', '2026'];

// Data usage figures from 2022 to till now (2026):
const YEAR_DATA = {
  '2026': {
    totalUsed: 1030,
    quota: 1900,
    usagePct: 54,
    imagesGb: 720,
    imagePct: 70,
    otherFilesGb: 310,
    otherFilesPct: 30,
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    series: [
      { name: 'Images', type: 'column', data: [65, 110, 180, 260, 340, 430, 520, 620, 720, null, null, null] },
      { name: 'Other Files', type: 'column', data: [30, 50, 80, 115, 150, 190, 230, 270, 310, null, null, null] },
      { name: 'Total Storage', type: 'line', data: [95, 160, 260, 375, 490, 620, 750, 890, 1030, null, null, null] },
    ],
  },
  '2025': {
    totalUsed: 710,
    quota: 1500,
    usagePct: 47,
    imagesGb: 490,
    imagePct: 69,
    otherFilesGb: 220,
    otherFilesPct: 31,
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    series: [
      { name: 'Images', type: 'column', data: [220, 240, 265, 290, 315, 340, 370, 395, 420, 445, 470, 490] },
      { name: 'Other Files', type: 'column', data: [95, 105, 115, 125, 140, 150, 160, 175, 185, 195, 210, 220] },
      { name: 'Total Storage', type: 'line', data: [315, 345, 380, 415, 455, 490, 530, 570, 605, 640, 680, 710] },
    ],
  },
  '2024': {
    totalUsed: 420,
    quota: 1000,
    usagePct: 42,
    imagesGb: 290,
    imagePct: 69,
    otherFilesGb: 130,
    otherFilesPct: 31,
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    series: [
      { name: 'Images', type: 'column', data: [110, 125, 140, 155, 170, 185, 205, 220, 240, 255, 275, 290] },
      { name: 'Other Files', type: 'column', data: [45, 52, 60, 68, 75, 82, 90, 98, 105, 112, 122, 130] },
      { name: 'Total Storage', type: 'line', data: [155, 177, 200, 223, 245, 267, 295, 318, 345, 367, 397, 420] },
    ],
  },
  '2023': {
    totalUsed: 220,
    quota: 750,
    usagePct: 29,
    imagesGb: 150,
    imagePct: 68,
    otherFilesGb: 70,
    otherFilesPct: 32,
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    series: [
      { name: 'Images', type: 'column', data: [40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150] },
      { name: 'Other Files', type: 'column', data: [18, 22, 27, 32, 36, 42, 47, 52, 57, 61, 65, 70] },
      { name: 'Total Storage', type: 'line', data: [58, 72, 87, 102, 116, 132, 147, 162, 177, 191, 205, 220] },
    ],
  },
  '2022': {
    totalUsed: 85,
    quota: 500,
    usagePct: 17,
    imagesGb: 58,
    imagePct: 68,
    otherFilesGb: 27,
    otherFilesPct: 32,
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    series: [
      { name: 'Images', type: 'column', data: [8, 12, 16, 21, 26, 31, 36, 41, 46, 50, 54, 58] },
      { name: 'Other Files', type: 'column', data: [4, 6, 8, 10, 12, 15, 17, 19, 21, 23, 25, 27] },
      { name: 'Total Storage', type: 'line', data: [12, 18, 24, 31, 38, 46, 53, 60, 67, 73, 79, 85] },
    ],
  },
};

// ----------------------------------------------------------------------

function mapUsageToChart(usage) {
  const months = usage?.months || [];

  return {
    totalUsed: usage?.usedGb ?? 0,
    quota: usage?.planQuotaGb ?? 0,
    usagePct: usage?.quotaPercent ?? 0,
    imagesGb: usage?.images?.gb ?? 0,
    imagePct: usage?.images?.percentOfUsed ?? 0,
    otherFilesGb: usage?.files?.gb ?? 0,
    otherFilesPct: usage?.files?.percentOfUsed ?? 0,
    categories: months.map((item) => item.month),
    series: [
      { name: 'Images', type: 'column', data: months.map((item) => item.imagesGb) },
      { name: 'Other Files', type: 'column', data: months.map((item) => item.filesGb) },
      { name: 'Total Storage', type: 'line', data: months.map((item) => item.totalGb) },
    ],
  };
}

export function DataUsageMixedChart({
  title = 'Data Usage & Images Shared',
  subheader,
  usage,
  year,
  yearOptions = YEAR_OPTIONS,
  onYearChange,
  onViewAll,
  sx,
  ...other
}) {
  const theme = useTheme();

  const [internalYear, setInternalYear] = useState('2026');
  const selectedYear = year ?? internalYear;

  const currentYearData = usage
    ? mapUsageToChart(usage)
    : YEAR_DATA[selectedYear] || YEAR_DATA['2026'];

  const handleChangeYear = useCallback((newValue) => {
    if (onYearChange) {
      onYearChange(newValue);
      return;
    }
    setInternalYear(newValue);
  }, [onYearChange]);

  const usedLabel = usage ? formatGb(currentYearData.totalUsed) : currentYearData.totalUsed.toLocaleString();
  const quotaLabel = usage ? formatGb(currentYearData.quota) : currentYearData.quota.toLocaleString();
  const imagesLabel = usage ? formatGb(currentYearData.imagesGb) : currentYearData.imagesGb;
  const otherLabel = usage ? formatGb(currentYearData.otherFilesGb) : currentYearData.otherFilesGb;

  const dynamicSubheader =
    subheader ||
    `${usedLabel} GB used of ${quotaLabel} GB plan quota (${currentYearData.usagePct}%)`;

  const chartColors = [
    theme.palette.info.main, // Images: Cyan / Info
    theme.palette.warning.main, // Other Files: Amber / Warning
    theme.palette.primary.main, // Total Storage: Indigo / Primary
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: {
      width: [0, 0, 3],
      curve: 'smooth',
    },
    fill: {
      type: ['solid', 'solid', 'solid'],
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
    },
    xaxis: {
      categories: currentYearData.categories,
    },
    yaxis: {
      min: 0,
      labels: {
        formatter: (val) => `${val == null ? '—' : val} GB`,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '45%',
        borderRadius: 4,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => (value == null ? '—' : `${Number(value).toLocaleString()} GB`),
      },
    },
  });

  return (
    <Card sx={{ height: 1, display: 'flex', flexDirection: 'column', ...sx }} {...other}>
      <CardHeader
        title={title}
        subheader={dynamicSubheader}
        action={
          <ChartSelect
            options={yearOptions}
            value={selectedYear}
            onChange={handleChangeYear}
          />
        }
        sx={{ mb: 1 }}
      />

      <Box sx={{ p: 3, pt: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* KPI Mini Header */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{
            py: 1,
            px: 1.5,
            mb: 2,
            borderRadius: 1.25,
            bgcolor: 'background.neutral',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Total Storage:
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {usedLabel} GB
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              / {quotaLabel} GB
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Label variant="soft" color="info" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
              Images: {imagesLabel} GB ({currentYearData.imagePct}%)
            </Label>
            <Label variant="soft" color="warning" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
              Other: {otherLabel} GB ({currentYearData.otherFilesPct}%)
            </Label>
            <Label variant="soft" color="primary" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
              {currentYearData.usagePct}% Quota
            </Label>
          </Stack>
        </Stack>

        {/* Minimals Mixed Chart (Column + Column + Line) */}
        <Box sx={{ flexGrow: 1, minHeight: 310 }}>
          <Chart
            key={selectedYear}
            type="line"
            series={currentYearData.series}
            options={chartOptions}
            height={310}
          />
        </Box>
      </Box>

      {onViewAll ? (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <Box sx={{ p: 2, textAlign: 'right' }}>
            <Button
              size="small"
              color="inherit"
              onClick={onViewAll}
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
            >
              View all
            </Button>
          </Box>
        </>
      ) : null}
    </Card>
  );
}
