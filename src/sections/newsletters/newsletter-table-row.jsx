import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';

import { canDeleteNewsletter, getNewsletterStatusColor } from './utils';

// ----------------------------------------------------------------------

export function NewsletterTableRow({ serialNumber, row, onEdit, onPreview, onDelete }) {
  const actions = [
    {
      key: 'edit',
      icon: 'solar:pen-bold',
      tooltip: 'Edit',
      onClick: (event) => {
        event.stopPropagation();
        onEdit?.(row);
      },
    },
    {
      key: 'preview',
      icon: 'solar:eye-bold',
      tooltip: 'Preview PDF',
      onClick: (event) => {
        event.stopPropagation();
        onPreview?.(row);
      },
    },
    {
      key: 'delete',
      icon: 'solar:trash-bin-trash-bold',
      tooltip: 'Delete',
      color: 'error',
      hidden: !canDeleteNewsletter(row.status),
      onClick: (event) => {
        event.stopPropagation();
        onDelete?.(row);
      },
    },
  ];

  return (
    <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => onEdit?.(row)}>
      <TableCell>{serialNumber}</TableCell>
      <TableCell>
        <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
          {row.title || '—'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {row.homeName || '—'} · Issue {row.issueNumber ?? '—'}
        </Typography>
      </TableCell>
      <TableCell>{row.month || '—'}</TableCell>
      <TableCell sx={{ textTransform: 'capitalize' }}>{row.authorName || '—'}</TableCell>
      <TableCell align="center">{row.highlightsCount ?? 0}</TableCell>
      <TableCell align="center">
        <Label variant="soft" color={getNewsletterStatusColor(row.status)}>
          {row.status || '—'}
        </Label>
      </TableCell>
      <TableCell align="center">
        <Box onClick={(event) => event.stopPropagation()}>
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}

NewsletterTableRow.propTypes = {
  serialNumber: PropTypes.number,
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onPreview: PropTypes.func,
  onDelete: PropTypes.func,
};
