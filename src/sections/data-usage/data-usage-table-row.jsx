import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';

import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function DataUsageTableRow({ row, onViewDetail, onEdit }) {
  const theme = useTheme();

  const {
    id,
    name,
    ownerName,
    ownerEmail,
    totalUsedGb,
    imageUsageGb,
    otherFilesGb,
    quotaGb,
    usagePercentage,
    imageCount,
  } = row;

  // Percentage of total used that is images
  const imageRatio = totalUsedGb > 0 ? Math.round((imageUsageGb / totalUsedGb) * 100) : 0;

  // Usage % color: Green < 60%, Amber 60-85%, Red > 85%
  const progressColor =
    usagePercentage >= 85 ? 'error' : usagePercentage >= 60 ? 'warning' : 'success';

  return (
    <TableRow
      hover
      sx={{
        cursor: 'pointer',
        transition: theme.transitions.create('background-color', {
          duration: theme.transitions.duration.shortest,
        }),
      }}
      onClick={() => onViewDetail(id)}
    >
      {/* 1. Organization Column */}
      <TableCell sx={{ minWidth: 240 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            alt={name}
            sx={{
              width: 42,
              height: 42,
              fontWeight: 700,
              fontSize: '1rem',
              color: 'primary.dark',
              bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
            }}
          >
            {name.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>
              {name}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
              {ownerName} &bull; {ownerEmail}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      {/* 2. Total Used Column */}
      <TableCell sx={{ minWidth: 140 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {totalUsedGb} GB
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          of {quotaGb} GB plan limit
        </Typography>
      </TableCell>

      {/* 3. Image Usage Column */}
      <TableCell sx={{ minWidth: 160 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {imageUsageGb} GB
          </Typography>
          <Label color="primary" variant="soft" sx={{ height: 20, fontSize: '0.75rem' }}>
            {imageRatio}%
          </Label>
        </Stack>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
          {imageCount?.toLocaleString()} images
        </Typography>
      </TableCell>

      {/* 4. Other Files Column */}
      <TableCell sx={{ minWidth: 140 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {otherFilesGb} GB
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          PDFs, docs & records
        </Typography>
      </TableCell>

      {/* 5. Usage % Column with Progress Bar */}
      <TableCell sx={{ minWidth: 180 }}>
        <Stack spacing={0.75}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Label color={progressColor} variant="soft" sx={{ fontWeight: 700 }}>
              {usagePercentage}%
            </Label>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {usagePercentage >= 85 ? 'High Usage' : usagePercentage >= 60 ? 'Moderate' : 'Normal'}
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={Math.min(100, usagePercentage)}
            color={progressColor}
            sx={{
              height: 7,
              borderRadius: 1,
              bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
            }}
          />
        </Stack>
      </TableCell>

      {/* Actions: Edit Icon */}
      <TableCell align="right" sx={{ width: 80, pr: 2 }}>
        <Tooltip title="Edit Organization">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
              },
            }}
          >
            <Iconify icon="solar:pen-bold" width={22} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
