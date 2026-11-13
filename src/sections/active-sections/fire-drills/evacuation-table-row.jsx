import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { fDateTime } from 'src/utils/format-time';
import { Label } from 'src/components/label';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';

import { getEvacuationTypeMeta } from './view/fire-drills-view';

// ----------------------------------------------------------------------

function durationLabel(startedAt, closedAt) {
  if (!startedAt) return '—';
  const end = closedAt ? new Date(closedAt) : new Date();
  const mins = Math.max(0, Math.round((end - new Date(startedAt)) / 60000));
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m`;
}

// ----------------------------------------------------------------------

/**
 * Evacuation history row:
 * 1. Sr#
 * 2. Site
 * 3. Type
 * 4. Started at (Date and Time)
 * 5. Started by (Name)
 * 6. Safe / total
 * 7. Duration
 * 8. Status
 * 9. Action (GenericTableRowActions)
 */
export default function EvacuationTableRow({ row, serialNumber, onOpen }) {
  const typeMeta = getEvacuationTypeMeta(row.type);
  const stats = row.stats || {};
  const isActive = row.status === 'active';
  const branchName = row.branch?.name || row.branchName || row.branch || '—';

  const actions = [
    {
      key: 'view',
      icon: 'solar:eye-bold',
      tooltip: 'View details',
      color: 'default',
      onClick: () => onOpen?.(row),
    },
  ];

  return (
    <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={() => onOpen?.(row)}>
      {/* 1. Sr# */}
      <TableCell sx={{ width: 50 }}>{serialNumber}</TableCell>

      {/* 2. Site */}
      <TableCell sx={{ width: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
        {branchName}
      </TableCell>

      {/* 3. Type */}
      <TableCell sx={{ width: 125, whiteSpace: 'nowrap' }}>
        <Label variant="soft" color={typeMeta.color}>
          {typeMeta.label}
        </Label>
      </TableCell>

      {/* 4. Started at */}
      <TableCell sx={{ width: 175, minWidth: 175, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {fDateTime(row.startedAt)}
      </TableCell>

      {/* 5. Started by */}
      <TableCell sx={{ width: 175, minWidth: 175, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {row.startedByName && !/^[0-9a-fA-F]{24}$/.test(row.startedByName) ? row.startedByName : '—'}
      </TableCell>

      {/* 6. Safe / total */}
      <TableCell align="center">
        {stats.safe ?? 0} / {stats.total ?? 0}
      </TableCell>

      {/* 7. Duration */}
      <TableCell align="center">
        {durationLabel(row.startedAt, row.closedAt)}
      </TableCell>

      {/* 8. Status */}
      <TableCell align="center">
        <Label variant="soft" color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Closed'}
        </Label>
      </TableCell>

      {/* 9. Action */}
      <TableCell align="center" onClick={(event) => event.stopPropagation()}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}

EvacuationTableRow.propTypes = {
  row: PropTypes.object,
  serialNumber: PropTypes.number,
  onOpen: PropTypes.func,
};