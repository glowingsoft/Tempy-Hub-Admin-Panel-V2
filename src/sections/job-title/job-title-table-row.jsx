import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';

import { JOB_TITLE_STATUS_OPTIONS, getJobTitleLevelLabel } from './mocks/data';

// ----------------------------------------------------------------------

const STATUS_COLOR = JOB_TITLE_STATUS_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.color;
  return acc;
}, {});

// ----------------------------------------------------------------------

export function JobTitleTableRow({ row, serialNumber, onEditRow }) {
  const statusValue = row.active ? 'active' : 'inactive';

  const actions = [
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
    <TableRow hover tabIndex={-1}>
      <TableCell>{serialNumber}</TableCell>

      <TableCell sx={{ textTransform: 'capitalize' }}>{row.name || '—'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{getJobTitleLevelLabel(row.level)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {row.siteScope === 'all' || (!row.siteScope && !row.branchId)
          ? 'All'
          : row.branch?.name || '—'}
      </TableCell>

      <TableCell align="center">
        <Label variant="soft" color={STATUS_COLOR[statusValue] || 'default'}>
          {row.active ? 'Active' : 'Inactive'}
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
