import { useState, useCallback } from 'react';
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
import Autocomplete from '@mui/material/Autocomplete';

import { Upload } from 'src/components/upload';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { _mockResidentsList } from 'src/sections/family-engagement/mocks/data';

// ----------------------------------------------------------------------

const AUDIENCE_OPTIONS = [
  {
    value: 'All Families & Residents',
    label: 'All Families & Residents',
    description: 'Visible to all residents and connected family members across Florence House',
    icon: 'solar:users-group-rounded-bold',
  },
  {
    value: 'Florence House Families',
    label: 'Florence House Families',
    description: 'Visible only to registered family contacts for Florence House branch',
    icon: 'solar:home-smile-bold',
  },
  {
    value: 'Tagged Resident Families Only',
    label: 'Tagged Resident Families Only',
    description: 'Private post shared only with relatives of the tagged residents',
    icon: 'solar:lock-keyhole-bold',
  },
  {
    value: 'Staff Only',
    label: 'Staff Only',
    description: 'Internal update visible only to Florence House care team and managers',
    icon: 'solar:shield-user-bold',
  },
];

export function NewWallPostDialog({ open, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState(AUDIENCE_OPTIONS[0].value);
  const [taggedResidents, setTaggedResidents] = useState([]);
  const [photos, setPhotos] = useState([]);

  const handleDropPhotos = useCallback((acceptedFiles) => {
    const imageFiles = acceptedFiles.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length < acceptedFiles.length) {
      toast.error('Only image files (JPG, PNG, WebP, GIF) are allowed. PDFs and documents are not accepted.');
    }
    const newFiles = imageFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setPhotos((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemovePhoto = useCallback(
    (inputFile) => {
      const filtered = photos.filter((file) => file !== inputFile);
      setPhotos(filtered);
    },
    [photos]
  );

  const handleRemoveAllPhotos = useCallback(() => {
    setPhotos([]);
  }, []);

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error('Please enter post content.');
      return;
    }

    const photoUrls = photos
      .map((p) => {
        if (typeof p === 'string') return p;
        return p.preview || (p instanceof File ? URL.createObjectURL(p) : '');
      })
      .filter(Boolean);

    const newPost = {
      id: `post-${Date.now()}`,
      title: title.trim() || 'Community Update',
      content: content.trim(),
      audience,
      taggedResidents,
      photos: photoUrls.length > 0 ? photoUrls : [],
      author: {
        name: 'Florence House Activities',
        handle: '@florencehouse',
        role: 'Activities Coordinator',
        avatarUrl: 'https://i.pravatar.cc/150?img=33',
      },
      createdAt: new Date().toISOString(),
      isPinned: false,
      reactions: {
        like: 1,
        heart: 0,
        smile: 0,
        userReaction: 'like',
      },
      seenBy: {
        count: 1,
        recentViewers: [],
      },
      commentsCount: 0,
      sharesCount: 0,
    };

    onCreated?.(newPost);
    toast.success('Post published to Community Wall!');
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setAudience(AUDIENCE_OPTIONS[0].value);
    setTaggedResidents([]);
    setPhotos([]);
    onClose();
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
              Share updates, stories & photos with families
            </Typography>
          </Box>
        </Stack>

        <IconButton size="small" onClick={handleClose}>
          <Iconify icon="solar:close-circle-bold" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5, pb: 3 }}>
        <Stack spacing={2.5}>
          {/* Post Title (Optional headline) */}
          <TextField
            fullWidth
            label="Title (optional)"
            placeholder="e.g. Autumn courtyard walk or Craft club fun"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Post Content */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Post Content *"
            placeholder="What's happening at Florence House? Add hashtags like #autumn #crafts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Audience Selector */}
          <TextField
            select
            fullWidth
            label="Who can see this post?"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            helperText={AUDIENCE_OPTIONS.find((opt) => opt.value === audience)?.description}
          >
            {AUDIENCE_OPTIONS.map((opt) => (
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

          {/* Resident Tagging */}
          <Autocomplete
            multiple
            options={_mockResidentsList}
            getOptionLabel={(option) => option.name}
            value={taggedResidents}
            onChange={(_, newValue) => setTaggedResidents(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tag Residents"
                placeholder="Search and tag residents in this post..."
              />
            )}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  size="small"
                  avatar={<Avatar src={option.avatarUrl}>{option.name?.charAt(0)}</Avatar>}
                  label={`${option.name} (Rm ${option.room})`}
                />
              ))
            }
          />

          {/* Photo Upload (Images only) */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Attach Photos (multiple allowed)
            </Typography>
            <Upload
              multiple
              accept={{
                'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
              }}
              files={photos}
              onDrop={handleDropPhotos}
              onRemove={handleRemovePhoto}
              onRemoveAll={handleRemoveAllPhotos}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 1,
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.webp, *.gif. Upload 2+ photos to enable carousel with dots.
                </Typography>
              }
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!content.trim()}
          startIcon={<Iconify icon="solar:send-bold" />}
          sx={{ fontWeight: 700, px: 2.5 }}
        >
          Publish Post
        </Button>
      </DialogActions>
    </Dialog>
  );
}

NewWallPostDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func,
};

export default NewWallPostDialog;
