import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { fDate } from 'src/utils/format-time';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';
import { TableCellWithTooltip } from 'src/components/table';

import { getBranchStatusMeta } from './mocks/data';

// ----------------------------------------------------------------------

export function BranchTableRow({ row, serialNumber }) {
  const router = useRouter();

  const detailPath = paths.owner.sites.detail(row._id);
  const status = getBranchStatusMeta(row.status);

  const actions = [
    {
      key: 'details',
      icon: 'solar:eye-bold',
      tooltip: 'Details',
      onClick: () => router.push(detailPath),
    },
    {
      key: 'edit',
      icon: 'solar:pen-bold',
      tooltip: 'Edit',
      onClick: (event) => {
        event.stopPropagation();
        router.push(paths.owner.sites.edit(row._id));
      },
    },
  ];

  return (
    <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={() => router.push(detailPath)}>
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Stack sx={{ typography: 'body2' }}>
          <Link color="inherit" sx={{ cursor: 'pointer', fontWeight: 600 }}>
            {row.name || '—'}
          </Link>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.assemblyPoint || '—'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>{row.code || '—'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.timezone || '—'}</TableCell>

      <TableCellWithTooltip maxWidth={240}>{row.address || '—'}</TableCellWithTooltip>

      <TableCell align="center">
        <Label variant="soft" color={status.color}>
          {status.label}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.createdAt)}</TableCell>

      <TableCell align="center">
        <Box onClick={(event) => event.stopPropagation()}>
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}
