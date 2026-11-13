import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { varAlpha } from 'src/theme/styles';

import { formatGb, usageProgressColor } from './utils';

// ----------------------------------------------------------------------

export function DataUsageTableRow({ row, onViewDetail, onEdit, clickable = true }) {
  const theme = useTheme();

  const {
    id,
    organizationId,
    name,
    ownerName,
    ownerEmail,
    totalUsedGb,
    imageUsageGb,
    otherFilesGb,
    quotaGb,
    usagePercentage,
    imageCount,
    imagePercent,
    status,
    statusLabel,
    canEdit,
  } = row;

  const imageRatio =
    imagePercent != null
      ? Math.round(imagePercent)
      : totalUsedGb > 0
        ? Math.round((imageUsageGb / totalUsedGb) * 100)
        : 0;

  const progressColor = usageProgressColor(status, usagePercentage);
  const usageCaption = statusLabel || (usagePercentage >= 85 ? 'High Usage' : usagePercentage >= 60 ? 'Moderate' : 'Normal');

  return (
    <TableRow
      hover={clickable}
      sx={{
        cursor: clickable ? 'pointer' : 'default',
        transition: theme.transitions.create('background-color', {
          duration: theme.transitions.duration.shortest,
        }),
      }}
      onClick={() => {
        if (!clickable) return;
        onViewDetail?.(row);
      }}
    >
      {/* 1. Organization Column */}
      <TableCell sx={{ minWidth: 240, maxWidth: 320 }}>
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
              flexShrink: 0,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, color: 'text.primary', textTransform: 'capitalize' }}>
              {name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
              {ownerName && ownerName !== '—' ? (
                <Typography variant="caption" noWrap sx={{ color: 'text.secondary', flexShrink: 0 }}>
                  {ownerName}
                </Typography>
              ) : null}
              {ownerEmail ? (
                <>
                  {ownerName && ownerName !== '—' ? (
                    <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                      •
                    </Typography>
                  ) : null}
                  <Tooltip title={ownerEmail} arrow enterDelay={200}>
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{
                        color: 'text.secondary',
                        minWidth: 0,
                        flex: 1,
                        display: 'block',
                      }}
                    >
                      {ownerEmail.length > 30 ? `${ownerEmail.slice(0, 30)}...` : ownerEmail}
                    </Typography>
                  </Tooltip>
                </>
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </TableCell>

      {/* 2. Total Used Column */}
      <TableCell sx={{ minWidth: 140 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {formatGb(totalUsedGb)} GB
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          of {formatGb(quotaGb)} GB plan limit
        </Typography>
      </TableCell>

      {/* 3. Image Usage Column */}
      <TableCell sx={{ minWidth: 160 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {formatGb(imageUsageGb)} GB
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
          {formatGb(otherFilesGb)} GB
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
              {usageCaption}
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

      {/* Actions: View + Edit */}
      <TableCell align="right" sx={{ width: 112, pr: 2 }}>
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="View details">
            <span>
              <IconButton
                disabled={!clickable}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!clickable) return;
                  onViewDetail?.(row);
                }}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                  },
                }}
              >
                <Iconify icon="solar:eye-bold" width={22} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={canEdit ? 'Edit Organization' : 'Editing is not available'}>
            <span>
              <IconButton
                disabled={!canEdit}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!canEdit) return;
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
            </span>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
