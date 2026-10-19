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

import { getMemberRoleLabel, getMemberStatusMeta } from './mocks/data';

// ----------------------------------------------------------------------

export function MemberTableRow({ row, serialNumber, onDeactivate }) {
  const router = useRouter();

  const detailPath = paths.owner.memberships.members.detail(row._id);
  const editPath = paths.owner.memberships.members.edit(row._id);

  const status = getMemberStatusMeta(row.status);
  const departmentNames = (row.departments || []).map((dep) => dep.name).join(', ');
  const isActive = row.status === 'active';

  const actions = [
    {
      key: 'view',
      icon: 'solar:eye-bold',
      tooltip: 'View',
      onClick: () => router.push(detailPath),
    },
    {
      key: 'edit',
      icon: 'solar:pen-bold',
      tooltip: 'Edit',
      onClick: (event) => {
        event.stopPropagation();
        router.push(editPath);
      },
    },
    {
      key: 'deactivate',
      icon: 'solar:user-block-bold',
      tooltip: 'Deactivate',
      color: 'error',
      hidden: !isActive,
      onClick: (event) => {
        event.stopPropagation();
        onDeactivate(row);
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
            {row.email || '—'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{getMemberRoleLabel(row.role)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.branch?.name || '—'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.jobTitle?.name || '—'}</TableCell>

      <TableCellWithTooltip maxWidth={200}>{departmentNames || '—'}</TableCellWithTooltip>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {fDate(row.startDate || row.staffProfile?.startDate) || '—'}
      </TableCell>

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
