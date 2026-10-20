import dayjs from 'dayjs';

import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { fDate, fDateTime } from 'src/utils/format-time';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

const formatTime = (value) => (value ? dayjs(value).format('hh:mm A') : '—');

export function ChangeRequestsRow({ row, serialNumber }) {
  return (
    <TableRow hover>
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 36, height: 36 }}>{row.staff?.name?.charAt(0) || 'U'}</Avatar>
          <Stack>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ textTransform: 'capitalize' }}>
              {row.staff?.name || 'Unknown'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              {row.staff?.email || '—'}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell align="center">
        <Typography variant="body2">{fDate(row.workDate)}</Typography>
      </TableCell>

      <TableCell align="center">
        <Typography variant="body2">
          {formatTime(row.originalClockIn)} – {formatTime(row.originalClockOut)}
        </Typography>
      </TableCell>

      <TableCell align="center">
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {formatTime(row.requestedClockIn)} – {formatTime(row.requestedClockOut)}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ maxWidth: 260 }} noWrap>
          {row.reason || '—'}
        </Typography>
      </TableCell>

      <TableCell align="center">
        <Label
          variant="soft"
          color={
            (row.status === 'approved' && 'success') ||
            (row.status === 'rejected' && 'error') ||
            'warning'
          }
          sx={{ textTransform: 'capitalize' }}
        >
          {row.status || 'Pending'}
        </Label>
      </TableCell>

      <TableCell align="center">
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {row.createdAt ? fDateTime(row.createdAt) : '—'}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
