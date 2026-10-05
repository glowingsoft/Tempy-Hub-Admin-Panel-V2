import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Chip from '@mui/material/Chip';

// ----------------------------------------------------------------------

export function FamilyResidentsDialog({ open, onClose, residents = [] }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ px: 3, py: 2 }}>
        Residents with No Content for Issue 14
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Resident</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Days Without Content</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {residents.map((resident) => (
                <TableRow key={resident.id} hover>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {resident.name}
                  </TableCell>

                  <TableCell sx={{ color: 'text.secondary' }}>
                    {resident.room}
                  </TableCell>

                  <TableCell sx={{ color: 'text.secondary' }}>
                    {resident.primaryContact}
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      color="error"
                      variant="soft"
                      label={`${resident.daysWithoutContent} days`}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      color="warning"
                      variant="outlined"
                      label={resident.status}
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

FamilyResidentsDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  residents: PropTypes.array,
};
