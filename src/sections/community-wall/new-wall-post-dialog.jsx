import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

import { Upload } from 'src/components/upload';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import {
  useCreateFamilyPostMutation,
  useGetTaggableResidentsQuery,
  useUploadFamilyPostMediaBatchMutation,
  useUploadFamilyPostMediaMutation,
} from 'src/store/Reducer/family-posts-api';

import { FAMILY_POST_AUDIENCE_OPTIONS, FamilyPostAudience, MAX_POST_PHOTOS } from './utils';

// ----------------------------------------------------------------------

export function NewWallPostDialog({ open, onClose, onSuccess, organizationId, branchId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState(FamilyPostAudience.ALL);
  const [taggedResidents, setTaggedResidents] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [isPinned, setIsPinned] = useState(false);

  const { data: taggableResidents = [] } = useGetTaggableResidentsQuery(
    { organizationId, branchId },
    { skip: !open || !organizationId || !branchId }
  );

  const [uploadFamilyPostMedia] = useUploadFamilyPostMediaMutation();
  const [uploadFamilyPostMediaBatch] = useUploadFamilyPostMediaBatchMutation();
  const [createFamilyPost, { isLoading: isCreating }] = useCreateFamilyPostMutation();
  const [uploading, setUploading] = useState(false);
  const saving = isCreating || uploading;

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setContent('');
    setAudience(FamilyPostAudience.ALL);
    setTaggedResidents([]);
    setPhotos([]);
    setIsPinned(false);
  }, [open]);

  const handleDropPhotos = useCallback(
    (acceptedFiles) => {
      const imageFiles = acceptedFiles.filter((file) => file.type.startsWith('image/'));
      if (imageFiles.length < acceptedFiles.length) {
        toast.error('Only image files (JPG, PNG, WebP, GIF) are allowed.');
      }

      setPhotos((prev) => {
        const remaining = MAX_POST_PHOTOS - prev.length;
        if (remaining <= 0) {
          toast.error(`You can attach up to ${MAX_POST_PHOTOS} photos.`);
          return prev;
        }
        const nextFiles = imageFiles.slice(0, remaining).map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        );
        if (imageFiles.length > remaining) {
          toast.error(`You can attach up to ${MAX_POST_PHOTOS} photos.`);
        }
        return [...prev, ...nextFiles];
      });
    },
    []
  );

  const handleRemovePhoto = useCallback((inputFile) => {
    setPhotos((prev) => prev.filter((file) => file !== inputFile));
  }, []);

  const handleClose = () => {
    if (saving) return;
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please enter post content.');
      return;
    }
    if (!branchId) {
      toast.error('Please select a site first.');
      return;
    }
    if (audience === FamilyPostAudience.TAGGED && !taggedResidents.length) {
      toast.error('Tag at least one resident for tagged-family posts.');
      return;
    }

    try {
      setUploading(true);
      let mediaIds = [];
      const files = photos.filter((photo) => photo instanceof File);

      if (files.length === 1) {
        const uploaded = await uploadFamilyPostMedia({ organizationId, file: files[0] }).unwrap();
        mediaIds = uploaded.map((item) => item.mediaId);
      } else if (files.length > 1) {
        const uploaded = await uploadFamilyPostMediaBatch({ organizationId, files }).unwrap();
        mediaIds = uploaded.map((item) => item.mediaId);
      }

      await createFamilyPost({
        organizationId,
        branchId,
        title: title.trim(),
        message: content.trim(),
        mediaIds,
        taggedResidentIds: taggedResidents.map((resident) => resident.residentId),
        audience,
        isPinned,
      }).unwrap();

      toast.success('Post published to Community Wall');
      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to publish post');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            <Iconify icon="solar:pen-new-square-bold" width={20} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Create New Post
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Share updates, stories and photos with families
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={handleClose} disabled={saving}>
          <Iconify icon="solar:close-circle-bold" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5, pb: 3 }}>
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            label="Title (optional)"
            placeholder="e.g. Autumn courtyard walk"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Post content"
            placeholder="What's happening at this site?"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
          />

          <TextField
            select
            fullWidth
            label="Who can see this post?"
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            helperText={FAMILY_POST_AUDIENCE_OPTIONS.find((opt) => opt.value === audience)?.description}
          >
            {FAMILY_POST_AUDIENCE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Iconify icon={opt.icon} width={20} sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" fontWeight={600}>
                    {opt.label}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            multiple
            options={taggableResidents}
            getOptionLabel={(option) =>
              option.roomNumber ? `${option.name} (Room ${option.roomNumber})` : option.name
            }
            isOptionEqualToValue={(option, value) => option.residentId === value.residentId}
            value={taggedResidents}
            onChange={(_, newValue) => setTaggedResidents(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Tag residents" placeholder="Search residents..." />
            )}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.residentId}
                  size="small"
                  avatar={<Avatar src={option.photoUrl || undefined}>{option.name?.charAt(0)}</Avatar>}
                  label={option.roomNumber ? `${option.name} (Rm ${option.roomNumber})` : option.name}
                />
              ))
            }
          />

          <FormControlLabel
            control={
              <Switch checked={isPinned} onChange={(event) => setIsPinned(event.target.checked)} color="primary" />
            }
            label={
              <Stack spacing={0}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Pin this post
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Keep it at the top of the community wall
                </Typography>
              </Stack>
            }
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Attach photos (max {MAX_POST_PHOTOS})
            </Typography>
            <Upload
              multiple
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] }}
              value={photos}
              files={photos}
              onDrop={handleDropPhotos}
              onRemove={handleRemovePhoto}
              onRemoveAll={() => setPhotos([])}
              helperText={
                <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center', color: 'text.disabled' }}>
                  Allowed *.jpeg, *.jpg, *.png, *.webp, *.gif. Maximum {MAX_POST_PHOTOS} images.
                </Typography>
              }
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!content.trim() || saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:send-bold" />}
        >
          Publish post
        </Button>
      </DialogActions>
    </Dialog>
  );
}

NewWallPostDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  organizationId: PropTypes.string,
  branchId: PropTypes.string,
};
