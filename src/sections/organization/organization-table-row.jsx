import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { fDate } from 'src/utils/format-time';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';

import { ORGANIZATION_STATUS_OPTIONS } from './mocks/data';

// ----------------------------------------------------------------------

const STATUS_COLOR = ORGANIZATION_STATUS_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.color;
  return acc;
}, {});

const STATUS_LABEL = ORGANIZATION_STATUS_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

// ----------------------------------------------------------------------

export function OrganizationTableRow({
  row,
  serialNumber,
  canEdit,
  ownerInvitationUrl,
  onEditRow,
}) {
  const router = useRouter();
  const { copy } = useCopyToClipboard();

  const detailPath = paths.dashboard.organizations.detail(row._id);

  const actions = [
    {
      key: 'view',
      icon: 'solar:eye-bold',
      tooltip: 'View',
      onClick: (event) => {
        event.stopPropagation();
        router.push(detailPath);
      },
    },
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
    {
      key: 'copy-owner-invitation',
      icon: 'solar:copy-bold',
      tooltip: 'Copy owner invitation link',
      hidden: !ownerInvitationUrl,
      onClick: async (event) => {
        event.stopPropagation();
        const copied = await copy(ownerInvitationUrl);
        if (copied) {
          toast.success('Owner invitation link copied!');
        } else {
          toast.error('Could not copy the owner invitation link.');
        }
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
          <Avatar alt={row.name} sx={{ bgcolor: 'primary.lighter', color: 'primary.dark', width: 36, height: 36, fontSize: 16 }}>
            {row.name?.charAt(0)?.toUpperCase()}
          </Avatar>

          <Link color="inherit" sx={{ cursor: 'pointer' }}>
            {row.name || '—'}
          </Link>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.owner?.name || '—'}</TableCell>

      <TableCell sx={{ maxWidth: 220 }}>
        <Tooltip title={row.owner?.email || ''} disableHoverListener={!row.owner?.email}>
          <Typography variant="body2" noWrap>
            {row.owner?.email || '—'}
          </Typography>
        </Tooltip>
      </TableCell>

      <TableCell align="center">
        <Label variant="soft" color={STATUS_COLOR[row.status] || 'default'}>
          {STATUS_LABEL[row.status] || row.status || '—'}
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
