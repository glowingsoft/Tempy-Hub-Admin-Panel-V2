import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { getCompetencyStatusMeta } from '../mocks/data';

// ----------------------------------------------------------------------

export function StaffCompetencyTableRow({ row, serialNumber, status, onUploadEvidence }) {
  const statusMeta = getCompetencyStatusMeta(status);
  const hasEvidence = !!row.supportingEvidence;

  return (
    <TableRow hover>
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {row.title}
        </Typography>
      </TableCell>

      <TableCell sx={{ color: 'text.secondary' }}>
        {row.providerAssessor || 'Management Assigned'}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.nextDueDate)}</TableCell>

      <TableCell align="center">
        <Label variant="soft" color={statusMeta.color}>
          {statusMeta.label}
        </Label>
      </TableCell>

      <TableCell align="center">
        <Button
          size="small"
          variant={hasEvidence ? 'soft' : 'outlined'}
          color={hasEvidence ? 'success' : 'primary'}
          startIcon={
            <Iconify icon={hasEvidence ? 'solar:document-text-bold' : 'solar:upload-bold'} />
          }
          onClick={() => onUploadEvidence(row)}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {hasEvidence ? 'Evidence Added' : 'Upload Evidence'}
        </Button>
      </TableCell>
    </TableRow>
  );
}

StaffCompetencyTableRow.propTypes = {
  row: PropTypes.object,
  serialNumber: PropTypes.number,
  status: PropTypes.string,
  onUploadEvidence: PropTypes.func,
};
