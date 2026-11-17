import { useMemo } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';

// ----------------------------------------------------------------------

export function AnnouncementTableRow({ row, serialNumber, branchName, onView }) {
  const { subject, category, createdAt, createdBy } = row || {};

  const name = createdBy?.name || '—';
  const email = createdBy?.email || '—';

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
    <TableRow hover>
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

      {/* Date */}
      <TableCell sx={{ whiteSpace: 'nowrap', pr: 3 }}>
        {createdAt ? fDateTime(createdAt) : '—'}
      </TableCell>

      {/* Announcement */}
      <TableCell sx={{ pl: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Box sx={{ fontWeight: 600 }}>{subject || '—'}</Box>
          {category && (
            <Label
              variant="soft"
              color="info"
              sx={{ height: 20, px: 0.75, fontSize: '0.675rem', textTransform: 'capitalize' }}
            >
              {category}
            </Label>
          )}
        </Stack>
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
