import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';
import { fDate, fDateTime } from 'src/utils/format-time';
import { ConfirmDialog } from 'src/components/custom-dialog';

function formatDuration(minutes) {
  if (!minutes) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}

function DetailField({ label, value }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value || '—'}</Typography>
    </Stack>
  );
}

function VisitorFeedbackTableRow({ row, serialNumber }) {
  const detailsDialog = useBoolean();

  return (
    <>
      <TableRow hover>
        <TableCell>{serialNumber}</TableCell>

        <TableCell>
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {row.visitorName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.site}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.host || '—'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDuration(row.durationMinutes)}</TableCell>

        <TableCell>
          <Rating value={row.rating} readOnly size="small" />
        </TableCell>

        <TableCell>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 280, cursor: 'pointer' }}
            noWrap
            onClick={detailsDialog.onTrue}
          >
            {row.comment || '—'}
          </Typography>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.submittedAt)}</TableCell>
      </TableRow>

      <ConfirmDialog
        open={detailsDialog.value}
        onClose={detailsDialog.onFalse}
        maxWidth="sm"
        title={row.visitorName}
        content={
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Rating value={row.rating} readOnly size="small" />
              <Typography variant="caption" color="text.secondary">
                {fDateTime(row.submittedAt)}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
              <DetailField label="Site" value={row.site} />
              <DetailField label="Host" value={row.host} />
              <DetailField label="Duration" value={formatDuration(row.durationMinutes)} />
            </Stack>

            <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'background.neutral' }}>
              <Typography variant="body2">{row.comment || 'No comment left.'}</Typography>
            </Box>
          </Stack>
        }
      />
    </>
  );
}

export default VisitorFeedbackTableRow;
