import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import { SessionSignOffCard } from './session-sign-off-card';

// ----------------------------------------------------------------------

export function SessionSignOffDialog({
  open,
  onClose,
  session,
  organizationId,
  type = 'supervision',
  onSave,
  readOnly = false,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 9 }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <SessionSignOffCard
            session={session}
            organizationId={organizationId}
            type={type}
            onSave={(res) => {
              onSave?.(res);
              onClose();
            }}
            onCancel={onClose}
            readOnly={readOnly}
          />
        </DialogContent>
      </Box>
    </Dialog>
  );
}

SessionSignOffDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  session: PropTypes.object,
  organizationId: PropTypes.string,
  type: PropTypes.oneOf(['supervision', 'appraisal']),
  onSave: PropTypes.func,
  readOnly: PropTypes.bool,
};