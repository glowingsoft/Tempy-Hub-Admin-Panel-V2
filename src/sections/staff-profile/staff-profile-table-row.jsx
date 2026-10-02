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
}) {
  const router = useRouter();

  const detailPath = customDetailPath || paths.owner.staffProfiles.detail(row._id);
  const editPath = customEditPath || paths.owner.staffProfiles.edit(row._id);

  const departmentNames = (row.departments || []).map((dep) => dep.name).join(', ');
  const staffName = row.user?.name || '—';
  const staffEmail = row.user?.email || '—';

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

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.branch?.name || '—'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.jobTitle?.name || '—'}</TableCell>

      <TableCellWithTooltip maxWidth={200}>{departmentNames || '—'}</TableCellWithTooltip>

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
