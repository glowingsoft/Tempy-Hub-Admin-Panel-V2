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
import { TableCellWithTooltip } from 'src/components/table';

import { getRoleLabel } from 'src/sections/membership/mocks/data';

// ----------------------------------------------------------------------

function getDepartmentNames(row) {
  const list = Array.isArray(row.departments) ? row.departments : [];
  const names = list.map((department) => department?.name).filter(Boolean);
  if (names.length) return names.join(', ');
  return row.department?.name || '—';
}

function getStaffRole(row) {
  return row.role || row.membership?.role || row.user?.role || '';
}

// ----------------------------------------------------------------------

export function StaffProfileTableRow({
  row,
  serialNumber,
  detailPath: customDetailPath,
  editPath: customEditPath,
  hideViewAction = false,
}) {
  const router = useRouter();

  const detailPath = customDetailPath || paths.owner.staffProfiles.detail(row._id);
  const editPath = customEditPath || paths.owner.staffProfiles.edit(row._id);

  const staffName = row.user?.name || row.userId?.name || row.name || '—';
  const staffEmail = row.user?.email || row.userId?.email || row.email || '—';
  const branchName = row.branch?.name || (typeof row.branchId === 'object' && row.branchId?.name) || '—';
  const jobTitleName = row.jobTitle?.name || (typeof row.jobTitleId === 'object' && row.jobTitleId?.name) || '—';

  const actions = [
    {
      key: 'edit',
      icon: 'solar:pen-bold',
      tooltip: 'Edit',
      onClick: (event) => {
        event.stopPropagation();
        router.push(editPath);
      },
    },
  ];

  if (!hideViewAction) {
    actions.unshift({
      key: 'view',
      icon: 'solar:eye-bold',
      tooltip: 'View',
      onClick: () => router.push(detailPath),
    });
  }

  return (
    <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={() => router.push(detailPath)}>
      <TableCell sx={{ width: 56, whiteSpace: 'nowrap' }}>{serialNumber}</TableCell>

      <TableCell>
        <Stack sx={{ typography: 'body2' }}>
          <Link color="inherit" sx={{ cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>
            {staffName}
          </Link>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {staffEmail}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
        {getRoleLabel(getStaffRole(row))}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{branchName}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{jobTitleName}</TableCell>

      <TableCellWithTooltip maxWidth={200} sx={{ textTransform: 'capitalize' }}>
        {getDepartmentNames(row)}
      </TableCellWithTooltip>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.startDate ? fDate(row.startDate) : '—'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.createdAt ? fDate(row.createdAt) : '—'}</TableCell>

      <TableCell align="center">
        <Box onClick={(event) => event.stopPropagation()}>
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}
