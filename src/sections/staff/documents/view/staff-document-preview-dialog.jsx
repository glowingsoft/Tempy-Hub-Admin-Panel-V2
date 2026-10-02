import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { FileThumbnail } from 'src/components/file-thumbnail';

export function StaffDocumentPreviewDialog({ document, open, onClose }) {
    if (!document) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{document.name}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                    <FileThumbnail file={document.fileType || 'file'} sx={{ width: 72, height: 72 }} />
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Mock document preview. The real document viewer will be connected when document URLs are available from the API.
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">Close</Button>
            </DialogActions>
        </Dialog>
    );
}
