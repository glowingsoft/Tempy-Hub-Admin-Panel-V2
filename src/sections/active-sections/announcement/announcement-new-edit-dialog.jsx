import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LoadingButton from '@mui/lab/LoadingButton';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const ANNOUNCEMENT_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
];

export const ANNOUNCEMENT_TARGET_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'staff', label: 'Staff Only' },
  { value: 'residents', label: 'Residents / Family' },
];

export const ANNOUNCEMENT_STATUS_OPTIONS = [
  { value: 'published', label: 'Publish immediately' },
  { value: 'draft', label: 'Save as draft' },
];

const AnnouncementSchema = zod.object({
  title: zod.string().min(1, 'Title is required'),
  content: zod.string().min(1, 'Announcement message is required'),
  priority: zod.string().default('normal'),
  target: zod.string().default('all'),
  status: zod.string().default('published'),
  pinned: zod.boolean().default(false),
});

// ----------------------------------------------------------------------

export function AnnouncementNewEditDialog({ open, onClose, currentAnnouncement, onSave }) {
  const defaultValues = useMemo(
    () => ({
      title: currentAnnouncement?.title || '',
      content: currentAnnouncement?.content || '',
      priority: currentAnnouncement?.priority || 'normal',
      target: currentAnnouncement?.target || 'all',
      status: currentAnnouncement?.status || 'published',
      pinned: currentAnnouncement?.pinned || false,
    }),
    [currentAnnouncement]
  );

  const methods = useForm({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Prepared for API mutation integration
      if (onSave) {
        await onSave(data);
      }
      toast.success(
        currentAnnouncement
          ? 'Announcement updated successfully!'
          : 'Announcement created successfully!'
      );
      handleClose();
    } catch (error) {
      console.error('Failed to save announcement:', error);
      toast.error(error?.message || 'Failed to save announcement');
    }
  });

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { borderRadius: 2 },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">
          {currentAnnouncement ? 'Edit Announcement' : 'Add Announcement'}
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Field.Text
              name="title"
              label="Announcement Title"
              placeholder="e.g. Scheduled System Maintenance"
              helperText="Give your announcement a clear and concise title"
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Field.Select name="priority" label="Priority">
                {ANNOUNCEMENT_PRIORITY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Select name="target" label="Target Audience">
                {ANNOUNCEMENT_TARGET_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>
            </Stack>

            <Field.Select name="status" label="Status">
              {ANNOUNCEMENT_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Text
              name="content"
              label="Message / Details"
              placeholder="Write the announcement details here..."
              multiline
              rows={4}
            />

            <Box>
              <Field.Switch
                name="pinned"
                label="Pin to top (highlight this announcement)"
                sx={{ m: 0 }}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            {currentAnnouncement ? 'Save Changes' : 'Create Announcement'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

AnnouncementNewEditDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentAnnouncement: PropTypes.object,
  onSave: PropTypes.func,
};
