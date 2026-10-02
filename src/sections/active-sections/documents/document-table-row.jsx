// document-table-row.jsx
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { FileThumbnail } from 'src/components/file-thumbnail';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { fDate } from 'src/utils/format-time';

import { getFolderLabel } from './mocks/data';

// ----------------------------------------------------------------------

export function DocumentTableRow({ row, onReplace, serialNumber, detailPath }) {
  const router = useRouter();

  const actions = [
    { key: 'view', icon: 'solar:eye-bold', tooltip: 'View document', onClick: () => router.push(detailPath) },
    { key: 'replace', icon: 'solar:refresh-bold', tooltip: 'Replace', onClick: onReplace },
  ];

  return (
    <TableRow
      hover
      sx={{ cursor: 'pointer' }}
      onClick={() => router.push(detailPath)}
    >
      {/* Sr# */}
      <TableCell sx={{ color: 'text.secondary', typography: 'body2' }}>
        {serialNumber || '—'}
      </TableCell>

      {/* Document name */}
      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <FileThumbnail file={row.fileType || 'file'} sx={{ width: 36, height: 36 }} />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.name || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.fileType?.toUpperCase() || 'FILE'}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      {/* Folder */}
      <TableCell>{row.folder ? getFolderLabel(row.folder) : '—'}</TableCell>

      {/* Scope */}
      <TableCell>{row.scopeLabel || '—'}</TableCell>

      {/* Version */}
      <TableCell align="center">{row.version || '—'}</TableCell>

      {/* Updated At */}
      <TableCell align="center">{fDate(row.updatedAt) || row.updatedAt || '—'}</TableCell>

      {/* Actions — stopPropagation so row-click doesn't interfere */}
      <TableCell align="center">
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