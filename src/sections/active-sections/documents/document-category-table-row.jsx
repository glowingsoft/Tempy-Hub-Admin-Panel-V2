import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Label } from 'src/components/label';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export function DocumentCategoryTableRow({ row, serialNumber, onEdit, onDelete }) {
  const docCount = Number(row.documentCount ?? row.count ?? 0);

  const actions = [
    ...(onEdit ? [{ key: 'edit', icon: 'solar:pen-bold', tooltip: 'Edit', onClick: () => onEdit(row) }] : []),
    ...(docCount === 0 && onDelete
      ? [
          {
            key: 'delete',
            icon: 'solar:trash-bin-trash-bold',
            tooltip: 'Delete',
            color: 'error',
            onClick: () => onDelete(row),
          },
        ]
      : []),
  ];

  const createdByName =
    typeof row.createdBy === 'object' && row.createdBy !== null
      ? row.createdBy.name || row.createdBy.email || '—'
      : typeof row.createdBy === 'string' && row.createdBy
        ? row.createdBy
        : '—';

  return (
    <TableRow hover>
      {/* Sr# */}
      <TableCell align="center" sx={{ color: 'text.secondary', typography: 'body2', width: 64 }}>
        {serialNumber || '—'}
      </TableCell>

      {/* Name */}
      <TableCell sx={{ width: '28%' }}>
        <Typography variant="subtitle2" fontWeight={600} noWrap>
          {row.title || row.name || '—'}
        </Typography>
      </TableCell>

      {/* Count */}
      <TableCell align="center" sx={{ width: '12%' }}>
        <Label variant="soft" color="info">
          {docCount}
        </Label>
      </TableCell>

      {/* Created By */}
      <TableCell align="center" sx={{ width: '22%' }}>
        <Typography variant="body2" noWrap>
          {createdByName}
        </Typography>
      </TableCell>

      {/* Status */}
      <TableCell align="center" sx={{ width: '12%' }}>
        <Label variant="soft" color={row.active ? 'success' : 'error'}>
          {row.active ? 'Active' : 'Inactive'}
        </Label>
      </TableCell>

      {/* Created At */}
      <TableCell align="center" sx={{ width: '16%', whiteSpace: 'nowrap' }}>
        {fDate(row.createdAt) || row.createdAt || '—'}
      </TableCell>

      {/* Actions */}
      <TableCell align="center" sx={{ width: 90 }}>
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}

// ----------------------------------------------------------------------

export function DocumentCategoryTableRowSkeleton({ dense = false }) {
  return (
    <TableRow>
      <TableCell align="center" sx={{ width: 64, py: dense ? 0.8 : 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="rounded" width={24} height={dense ? 16 : 18} />
        </Box>
      </TableCell>

      <TableCell sx={{ width: '28%', py: dense ? 0.8 : 1.5 }}>
        <Skeleton variant="rounded" width="75%" height={dense ? 16 : 18} />
      </TableCell>

      <TableCell align="center" sx={{ width: '12%', py: dense ? 0.8 : 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="rounded" width={32} height={dense ? 16 : 18} />
        </Box>
      </TableCell>

      <TableCell align="center" sx={{ width: '22%', py: dense ? 0.8 : 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="rounded" width="60%" height={dense ? 16 : 18} />
        </Box>
      </TableCell>

      <TableCell align="center" sx={{ width: '12%', py: dense ? 0.8 : 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="rounded" width={58} height={dense ? 16 : 18} />
        </Box>
      </TableCell>

      <TableCell align="center" sx={{ width: '16%', py: dense ? 0.8 : 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="rounded" width={76} height={dense ? 16 : 18} />
        </Box>
      </TableCell>

      <TableCell align="center" sx={{ width: 90, py: dense ? 0.8 : 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="rounded" width={48} height={dense ? 16 : 18} />
        </Box>
      </TableCell>
    </TableRow>
  );
}