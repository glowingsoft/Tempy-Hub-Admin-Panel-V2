import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { fDate, fDateTime } from 'src/utils/format-time';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';

import { ORGANIZATION_STATUS_OPTIONS } from './mocks/data';

// ----------------------------------------------------------------------

const STATUS_COLOR = ORGANIZATION_STATUS_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.color;
  return acc;
}, {});

// ----------------------------------------------------------------------

export function OrganizationTableRow({ row, serialNumber, canEdit, onEditRow }) {
  const router = useRouter();

  const detailPath = paths.dashboard.organizations.detail(row._id);

  const actions = [
    {
      key: 'edit',
      icon: 'solar:pen-bold',
      tooltip: 'Edit',
      hidden: !canEdit,
      onClick: (event) => {
        event.stopPropagation();
        onEditRow();
      },
    },
  ];

  return (
    <TableRow
      hover
      tabIndex={-1}
      sx={{ cursor: 'pointer' }}
      onClick={() => router.push(detailPath)}
    >
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Stack spacing={2} direction="row" alignItems="center">
          <Avatar alt={row.name} sx={{ bgcolor: 'primary.lighter', color: 'primary.dark' }}>
            {row.name?.charAt(0)?.toUpperCase()}
          </Avatar>

          <Link color="inherit" sx={{ cursor: 'pointer' }}>
            {row.name || '—'}
          </Link>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.owner?.name || '—'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.owner?.email || '—'}</TableCell>

      <TableCell align="center">
        <Label variant="soft" color={STATUS_COLOR[row.status] || 'default'}>
          {row.status || '—'}
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
