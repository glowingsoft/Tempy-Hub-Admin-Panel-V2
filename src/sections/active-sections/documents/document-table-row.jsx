import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { FileThumbnail } from 'src/components/file-thumbnail';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export function DocumentTableRow({ row, onEdit, onReplace, onDelete, serialNumber, detailPath, isStaff = false }) {
  const router = useRouter();

  const actions = [
    { key: 'view', icon: 'solar:eye-bold', tooltip: 'View', onClick: () => router.push(detailPath) },
    ...(!isStaff && onEdit ? [{ key: 'edit', icon: 'solar:pen-bold', tooltip: 'Edit', onClick: () => onEdit?.(row) }] : []),
    ...(!isStaff && onReplace ? [{ key: 'replace', icon: 'solar:refresh-bold', tooltip: 'Replace', onClick: () => onReplace?.(row) }] : []),
    ...(!isStaff && onDelete ? [{ key: 'delete', icon: 'solar:trash-bin-trash-bold', tooltip: 'Delete', color: 'error', onClick: () => onDelete?.(row) }] : []),
  ];

  return (
    <TableRow
      hover
      sx={{ cursor: 'pointer' }}
      onClick={() => router.push(detailPath)}
    >
      {/* Sr# */}
      <TableCell align="center" sx={{ color: 'text.secondary', typography: 'body2', width: 64 }}>
        {serialNumber || '—'}
      </TableCell>

      {/* Document name */}
      <TableCell sx={{ width: 320, minWidth: 260 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <FileThumbnail file={row.fileType || 'file'} sx={{ width: 36, height: 36, flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {row.name || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {row.fileType?.toUpperCase() || 'FILE'}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      {/* Scope */}
      <TableCell sx={{ width: 160, whiteSpace: 'nowrap' }}>{row.scopeLabel || '—'}</TableCell>

      {/* Version */}
      <TableCell align="center" sx={{ width: 130, whiteSpace: 'nowrap' }}>
        {row.version || '—'}
      </TableCell>

      {/* Updated At */}
      <TableCell align="center" sx={{ width: 160, whiteSpace: 'nowrap' }}>
        {fDate(row.updatedAt) || row.updatedAt || '—'}
      </TableCell>

      {/* Actions */}
      <TableCell align="center" sx={{ width: 130 }}>
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

export function DocumentTableRowSkeleton({ dense = false }) {
  return (
    <TableRow>
      {/* Sr# */}
      <TableCell align="center" sx={{ width: 64, py: dense ? 0.8 : 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="rounded" width={24} height={dense ? 16 : 18} />
        </Box>
      </TableCell>

      {/* Document name */}
      <TableCell sx={{ width: 320, minWidth: 260, py: dense ? 0.8 : 1.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="rounded" width={36} height={36} sx={{ flexShrink: 0 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="rounded" width="70%" height={14} sx={{ mb: 0.5 }} />
            <Skeleton variant="rounded" width="30%" height={10} />
          </Box>
        </Stack>
      </TableCell>

      {/* Scope */}
      <TableCell sx={{ width: 160, py: dense ? 0.8 : 1.5 }}>
        <Skeleton variant="rounded" width="60%" height={dense ? 16 : 18} />
      </TableCell>

      {/* Version */}
      <TableCell align="center" sx={{ width: 130, py: dense ? 0.8 : 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="rounded" width={36} height={dense ? 16 : 18} />
        </Box>
      </TableCell>

      {/* Updated At */}
      <TableCell align="center" sx={{ width: 160, py: dense ? 0.8 : 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="rounded" width={80} height={dense ? 16 : 18} />
        </Box>
      </TableCell>

      {/* Actions */}
      <TableCell align="center" sx={{ width: 130, py: dense ? 0.8 : 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="rounded" width={64} height={dense ? 16 : 18} />
        </Box>
      </TableCell>
    </TableRow>
  );
}