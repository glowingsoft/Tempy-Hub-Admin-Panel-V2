import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { useUpdateFamilyPostMutation } from 'src/store/Reducer/family-posts-api';

import { getPostId } from './utils';

// ----------------------------------------------------------------------

export function EditWallPostDialog({ open, onClose, post, organizationId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [updateFamilyPost, { isLoading }] = useUpdateFamilyPostMutation();

  useEffect(() => {
    if (!post) return;
    setTitle(post.title || '');
    setContent(post.message || post.content || '');
    setIsPinned(Boolean(post.isPinned));
  }, [post]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      await updateFamilyPost({
        organizationId,
        postId: getPostId(post),
        title: title.trim(),
        message: content.trim(),
        isPinned,
      }).unwrap();
      toast.success('Post updated successfully');
      onClose?.();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to update post');
    }
  };

  if (!post) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Edit wall post
        </Typography>
        <IconButton onClick={onClose} size="small" disabled={isLoading}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <TextField
            label="Post title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            fullWidth
          />
          <TextField
            label="Post content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            fullWidth
            multiline
            rows={4}
            required
          />
          <FormControlLabel
            control={
              <Switch checked={isPinned} onChange={(event) => setIsPinned(event.target.checked)} color="primary" />
            }
            label="Pin this post"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!content.trim() || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EditWallPostDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  post: PropTypes.object,
  organizationId: PropTypes.string,
};
