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

// ----------------------------------------------------------------------

export function StaffProfileTableRow({
  row,
  serialNumber,
  detailPath: customDetailPath,
  editPath: customEditPath,
  hideViewAction = false,
  branchesMap = {},
  jobTitlesMap = {},
  departmentsMap = {},
}) {
  const router = useRouter();

  const detailPath = customDetailPath || paths.owner.staffProfiles.detail(row._id);
  const editPath = customEditPath || paths.owner.staffProfiles.edit(row._id);

  // Site / Branch name
  const branchName =
    row.branch?.name ||
    (typeof row.branchId === 'object' && row.branchId?.name) ||
    row.branchName ||
    (typeof row.branch === 'string' && branchesMap[row.branch]?.name) ||
    (typeof row.branchId === 'string' && branchesMap[row.branchId]?.name) ||
    '—';

  // Job title name
  const jobTitleName =
    row.jobTitle?.name ||
    (typeof row.jobTitleId === 'object' && row.jobTitleId?.name) ||
    row.jobTitleName ||
    (typeof row.jobTitle === 'string' && jobTitlesMap[row.jobTitle]?.name) ||
    (typeof row.jobTitleId === 'string' && jobTitlesMap[row.jobTitleId]?.name) ||
    '—';

  // Departments
  const departmentNames = (() => {
    const list =
      Array.isArray(row.departments) && row.departments.length > 0
        ? row.departments
        : Array.isArray(row.departmentIds) && row.departmentIds.length > 0
          ? row.departmentIds
          : [];

    if (list.length > 0) {
      const names = list
        .map((d) => {
          if (typeof d === 'object' && d?.name) return d.name;
          const id = typeof d === 'object' ? d?._id : d;
          return departmentsMap[id]?.name || id;
        })
        .filter(Boolean);
      if (names.length > 0) return names.join(', ');
    }
    if (row.department?.name) {
      return row.department.name;
    }
    return '—';
  })();

  const staffName =
    row.userId?.name ||
    row.user?.name ||
    row.userName ||
    row.name ||
    '—';

  const staffEmail =
    row.userId?.email ||
    row.user?.email ||
    row.userEmail ||
    row.email ||
    '—';

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
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Stack sx={{ typography: 'body2' }}>
          <Link color="inherit" sx={{ cursor: 'pointer', fontWeight: 600 }}>
            {staffName}
          </Link>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {staffEmail}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{branchName}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{jobTitleName}</TableCell>

      <TableCellWithTooltip maxWidth={200}>{departmentNames}</TableCellWithTooltip>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.startDate)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.createdAt)}</TableCell>

      <TableCell align="center">
        <Box onClick={(event) => event.stopPropagation()}>
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}
