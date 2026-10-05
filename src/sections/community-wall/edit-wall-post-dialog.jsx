import { useState, useEffect, useCallback } from 'react';
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

export function EditWallPostDialog({ open, onClose, post, onSave }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState(AUDIENCE_OPTIONS[0].value);
  const [taggedResidents, setTaggedResidents] = useState([]);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setAudience(post.audience || AUDIENCE_OPTIONS[0].value);
      setTaggedResidents(post.taggedResidents || []);
      setPhotos(post.photos || []);
    }
  }, [post]);

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
    if (!title.trim() || !content.trim()) return;

    const photoUrls = photos.map((p) => {
      if (typeof p === 'string') return p;
      return p.preview || (p instanceof File ? URL.createObjectURL(p) : '');
    }).filter(Boolean);

    onSave?.({
      ...post,
      title: title.trim(),
      content: content.trim(),
      audience,
      taggedResidents,
      photos: photoUrls,
    });

    onClose();
  };

  if (!post) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Edit Wall Post
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <TextField
            label="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Post Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            rows={4}
            required
          />

          {/* Tagged Residents */}
          <Box>
            <Autocomplete
              multiple
              options={_mockResidentsList}
              getOptionLabel={(opt) => `${opt.name} (Room ${opt.room})`}
              value={taggedResidents}
              onChange={(_, newValue) => setTaggedResidents(newValue)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField {...params} size="small" label="Tag Residents" />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar src={option.avatarUrl} alt={option.name} sx={{ width: 28, height: 28 }}>
                      {option.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {option.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Room {option.room}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
              renderTags={(val, getTagProps) =>
                val.map((option, idx) => (
                  <Chip
                    {...getTagProps({ index: idx })}
                    key={option.id}
                    size="small"
                    avatar={<Avatar src={option.avatarUrl}>{option.name[0]}</Avatar>}
                    label={`${option.name} (Room ${option.room})`}
                    color="info"
                    variant="soft"
                  />
                ))
              }
            />
          </Box>

          {/* Who can see this post */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Who can see this post?
            </Typography>
            <TextField
              select
              fullWidth
              size="medium"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              {AUDIENCE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} sx={{ py: 1.25 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon={opt.icon} width={20} sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2">{opt.label}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {opt.description}
                      </Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Photos Upload & Preview */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Post Photos
            </Typography>
            <Upload
              multiple
              thumbnail
              accept={{
                'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
              }}
              value={photos}
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
                    color: 'text.secondary',
                  }}
                >
                  Images only (*.jpeg, *.jpg, *.png, *.webp, *.gif)
                </Typography>
              }
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim()}
          sx={{ fontWeight: 700 }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EditWallPostDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  post: PropTypes.object,
  onSave: PropTypes.func,
};
