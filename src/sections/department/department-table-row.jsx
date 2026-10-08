import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';

import { DEPARTMENT_STATUS_OPTIONS } from './mocks/data';

// ----------------------------------------------------------------------

const STATUS_COLOR = DEPARTMENT_STATUS_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.color;
  return acc;
}, {});

// ----------------------------------------------------------------------

export function DepartmentTableRow({ row, serialNumber, onEditRow }) {
  const router = useRouter();

  const detailPath = paths.owner.departments.detail(row._id);

  const statusValue = row.isActive ? 'active' : 'inactive';

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
        onEditRow();
      },
    },
  ];

  return (
    <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={() => router.push(detailPath)}>
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Link color="inherit" sx={{ cursor: 'pointer' }}>
          {row.name || '—'}
        </Link>
      </TableCell>

      <TableCell align="center">{row.sortOrder ?? '—'}</TableCell>

      <TableCell align="center">
        <Label variant="soft" color={STATUS_COLOR[statusValue] || 'default'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Label>
      </TableCell>

      <TableCell align="center">
        <Box
          onClick={(event) => event.stopPropagation()}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: 1,
            '& > .MuiStack-root': {
              justifyContent: 'center',
              width: 1,
            },
          }}
        >
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}
