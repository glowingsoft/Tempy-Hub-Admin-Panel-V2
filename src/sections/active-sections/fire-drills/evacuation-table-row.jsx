import Button from '@mui/material/Button';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { fDateTime } from 'src/utils/format-time';
import { Label } from 'src/components/label';

import { getEvacuationTypeMeta } from './mocks/data';

// ----------------------------------------------------------------------

function durationLabel(startedAt, closedAt) {
  if (!startedAt) return '—';
  const end = closedAt ? new Date(closedAt) : new Date();
  const mins = Math.max(0, Math.round((end - new Date(startedAt)) / 60000));
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m`;
}

/**
 * Evacuation history row.
 * Detail: GET FIRE_DRILL_API.get + listChecks
 */
export default function EvacuationTableRow({ row, serialNumber, showSite, onOpen }) {
  const typeMeta = getEvacuationTypeMeta(row.type);
  const stats = row.stats || {};
  const isActive = row.status === 'active';

  return (
    <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => onOpen?.(row)}>
      <TableCell>{serialNumber}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDateTime(row.startedAt)}</TableCell>

      <TableCell>
        <Label variant="soft" color={typeMeta.color}>
          {typeMeta.label}
        </Label>
      </TableCell>

      {showSite && (
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.branchName || '—'}</TableCell>
      )}

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.startedByName || '—'}</TableCell>

      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
        {stats.total != null
          ? `${stats.safe ?? 0}/${stats.total}`
          : '—'}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{durationLabel(row.startedAt, row.closedAt)}</TableCell>

      <TableCell align="center">
        <Label variant="soft" color={isActive ? 'error' : 'default'}>
          {isActive ? 'Active' : 'Closed'}
        </Label>
      </TableCell>

      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
        <Button size="small" variant="soft" onClick={() => onOpen?.(row)}>
          View
        </Button>
      </TableCell>
    </TableRow>
  );
}
