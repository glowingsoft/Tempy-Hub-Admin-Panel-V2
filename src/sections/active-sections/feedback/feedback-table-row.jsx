import { Box, Stack, TableCell, TableRow, Typography } from '@mui/material';

import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';

import { getFeedbackStatusMeta } from './mocks/data';

const FeedbackTableRow = ({ row, onRespond, onView, serialNumber }) => {
  const status = getFeedbackStatusMeta(row.status);
  const isResolved = row.status === 'resolved';

  const actions = [
    {
      key: isResolved ? 'view' : 'respond',
      icon: isResolved ? 'solar:eye-bold' : 'solar:letter-unread-bold',
      tooltip: isResolved ? 'View response' : 'Respond',
      color: isResolved ? 'default' : 'primary',
      onClick: () => onRespond(row),
    },
  ];

  return (
    <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => onRespond(row)}>
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Stack sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {row.residentName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.submittedBy} · {row.site}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.category}</TableCell>

      <TableCell>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }} noWrap>
          {row.message}
        </Typography>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.submittedAt)}</TableCell>

      <TableCell align="center">
        <Label variant="soft" color={status.color}>
          {status.label}
        </Label>
      </TableCell>

      <TableCell align="center" onClick={(event) => event.stopPropagation()}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default FeedbackTableRow;
