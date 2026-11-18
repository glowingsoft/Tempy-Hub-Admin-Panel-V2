import { useMemo } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { fDateTime } from 'src/utils/format-time';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';

// ----------------------------------------------------------------------

export function AnnouncementTableRow({ row, serialNumber, branchName, onView }) {
  const { subject, title, category, createdAt, date, createdBy, author } = row || {};

  const name = createdBy?.name || author?.name || (typeof createdBy === 'string' ? createdBy : '—');
  const email = createdBy?.email || author?.email || '';
  const displaySubject = subject || title || '—';
  const displayDate = createdAt || date;

  const actions = useMemo(
    () => [
      {
        key: 'view',
        icon: 'solar:eye-bold',
        tooltip: 'View Announcement',
        color: 'default',
        onClick: () => onView?.(row),
      },
    ],
    [onView, row]
  );

  return (
    <TableRow hover onClick={() => onView?.(row)} sx={{ cursor: onView ? 'pointer' : 'default' }}>
      <TableCell>{serialNumber}</TableCell>

      {/* Created by */}
      <TableCell>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            alt={name}
            src={createdBy?.photoUrl}
            sx={{ width: 36, height: 36, fontSize: 16, textTransform: 'capitalize' }}
          >
            {name?.charAt(0)}
          </Avatar>
          <Stack sx={{ typography: 'body2', minWidth: 0 }}>
            <Box sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{name}</Box>
            <Box sx={{ color: 'text.secondary', typography: 'caption' }}>{email}</Box>
          </Stack>
        </Stack>
      </TableCell>

      {/* Site */}
      <TableCell sx={{ textTransform: 'capitalize' }}>{branchName}</TableCell>

      {/* Category */}
      <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
        {category || '—'}
      </TableCell>

      {/* Announcement */}
      <TableCell>
        <Box sx={{ fontWeight: 600 }}>{displaySubject}</Box>
      </TableCell>

      {/* Date */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {displayDate ? fDateTime(displayDate) : '—'}
      </TableCell>

      {/* Actions */}
      <TableCell
        align="center"
        onClick={(event) => event.stopPropagation()}
        sx={{ whiteSpace: 'nowrap' }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}

AnnouncementTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  serialNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  branchName: PropTypes.string,
  onView: PropTypes.func,
};
