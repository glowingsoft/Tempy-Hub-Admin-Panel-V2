import { useState } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function FamilyModerationDialog({ open, onClose, items = [], onApprove, onReject }) {
  const [activeItems, setActiveItems] = useState(items);

  const handleApprove = (id) => {
    setActiveItems((prev) => prev.filter((item) => item.id !== id));
    toast.success('Submission approved');
    onApprove?.(id);
  };

  const handleReject = (id) => {
    setActiveItems((prev) => prev.filter((item) => item.id !== id));
    toast.info('Submission rejected');
    onReject?.(id);
  };

  const handleApproveAll = () => {
    activeItems.forEach((item) => onApprove?.(item.id));
    setActiveItems([]);
    toast.success('All submissions approved');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ px: 3, py: 2 }}>
        Family Content Moderation Queue
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {activeItems.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No pending uploads in the moderation queue.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Resident</TableCell>
                  <TableCell>Sent By</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {activeItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {item.resident}
                    </TableCell>

                    <TableCell sx={{ color: 'text.secondary' }}>
                      {item.sender}
                    </TableCell>

                    <TableCell sx={{ maxWidth: 260 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap display="block">
                        {item.caption}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {item.time}
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          color="error"
                          variant="soft"
                          onClick={() => handleReject(item.id)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="small"
                          color="success"
                          variant="contained"
                          onClick={() => handleApprove(item.id)}
                        >
                          Approve
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {activeItems.length > 0 && (
          <Button
            color="success"
            variant="soft"
            onClick={handleApproveAll}
            sx={{ mr: 'auto', fontWeight: 600 }}
          >
            Approve All ({activeItems.length})
          </Button>
        )}

        <Button variant="outlined" color="inherit" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

FamilyModerationDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  items: PropTypes.array,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
};
