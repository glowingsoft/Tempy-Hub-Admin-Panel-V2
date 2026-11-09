import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

function VisitorFeedbackTableRow({ row, serialNumber, onView }) {
  const visitor = row.visitorName || '—';
  const site = row.branchName || row.site || '—';
  const host = row.hostName || row.host || '—';
  const submitted = row.submittedAt || row.createdAt;

  const actions = [
    {
      key: 'view',
      icon: 'solar:eye-bold',
      tooltip: 'View details',
      onClick: (event) => {
        event.stopPropagation();
        onView();
      },
    },
  ];

  return (
    <TableRow
      hover
      sx={{ cursor: 'pointer' }}
      onClick={onView}
    >
      <TableCell sx={{ width: 56 }}>{serialNumber}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
          {visitor}
        </Typography>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{site}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{host}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(submitted)}</TableCell>

      <TableCell align="center">
        <Box onClick={(event) => event.stopPropagation()} sx={{ display: 'flex', justifyContent: 'center' }}>
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}

VisitorFeedbackTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  serialNumber: PropTypes.number.isRequired,
  onView: PropTypes.func.isRequired,
};

export default VisitorFeedbackTableRow;
