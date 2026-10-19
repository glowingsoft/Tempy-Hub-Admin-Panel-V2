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

export function BranchTableRow({ row, serialNumber, onEmergencyPin, onActivationCode }) {
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
    {
      key: 'emergency-pin',
      icon: 'solar:lock-password-bold',
      tooltip: 'Emergency PIN',
      onClick: (event) => {
        event.stopPropagation();
        onEmergencyPin?.(row);
      },
    },
    {
      key: 'activation-code',
      icon: 'solar:qr-code-bold',
      tooltip: 'Activation code',
      onClick: (event) => {
        event.stopPropagation();
        onActivationCode?.(row);
      },
    },
  ];

  return (
    <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={() => router.push(detailPath)}>
      <TableCell sx={{ width: 56, whiteSpace: 'nowrap' }}>{serialNumber}</TableCell>

      <TableCell>
        <Stack sx={{ typography: 'body2' }}>
          <Link color="inherit" sx={{ cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>
            {row.name || '—'}
          </Link>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.assemblyPoint || '—'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.code || '—'}</TableCell>

      <TableCellWithTooltip maxWidth={280} title={row.address || ''}>
        {row.address || '—'}
      </TableCellWithTooltip>

      <TableCell align="center">
        <Label variant="soft" color={status.color}>
          {status.label}
        </Label>
      </TableCell>

      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
        {fDate(row.createdAt)}
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
