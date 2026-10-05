import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';

import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
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


export function CommunityWallComposer({ onPostCreated, sx }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState(AUDIENCE_OPTIONS[0].value);
  const [taggedResidents, setTaggedResidents] = useState([]);
  const [photos, setPhotos] = useState([]);

  // Handle image upload with dropzone (strictly image files only)
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
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter a title and content for the post');
      return;
    }

    // Extract photo URLs (handles both File objects with .preview and string URLs)
    const photoUrls = photos.map((p) => {
      if (typeof p === 'string') return p;
      return p.preview || (p instanceof File ? URL.createObjectURL(p) : '');
    }).filter(Boolean);

    const newPost = {
      id: `post-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      author: {
        name: 'Florence House Activities',
        role: 'Activities Coordinator',
        avatarUrl: 'https://i.pravatar.cc/150?img=33',
      },
      createdAt: new Date().toISOString(),
      isPinned: false,
      audience,
      taggedResidents,
      photos: photoUrls,
      reactions: {
        like: 0,
        heart: 0,
        smile: 0,
        userReaction: null,
      },
      seenBy: {
        count: 1,
        recentViewers: [
          { name: 'Florence House Team', relation: 'Poster', avatarUrl: 'https://i.pravatar.cc/150?img=33' },
        ],
      },
    };

    onPostCreated?.(newPost);
    toast.success('Wall post published successfully!');

    // Reset form
    setTitle('');
    setContent('');
    setPhotos([]);
    setTaggedResidents([]);
    setAudience(AUDIENCE_OPTIONS[0].value);
  };

  return (
    <Card sx={{ p: 3, mb: 3, ...sx }}>
      {/* Header: New post */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
        <Iconify icon="solar:pen-new-square-bold" width={22} sx={{ color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={700}>
          New post
        </Typography>
      </Stack>

      <Stack spacing={2.5}>
        {/* Post Title */}
        <TextField
          placeholder="Post title (e.g. Autumn Harvest & Flower Arranging Afternoon)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          size="medium"
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              fontWeight: 600,
              fontSize: '1rem',
            },
          }}
        />

        {/* Post Content */}
        <TextField
          placeholder="Share an update, celebration, or activity moment with families..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          multiline
          minRows={3}
          maxRows={6}
          variant="outlined"
        />

        {/* Resident Tagging (Autocomplete using existing mock residents) */}
        <Box>
          <Autocomplete
            multiple
            options={_mockResidentsList}
            getOptionLabel={(opt) => `${opt.name} (Room ${opt.room})`}
            value={taggedResidents}
            onChange={(_, newValue) => setTaggedResidents(newValue)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Tag Residents"
                placeholder="Search resident to tag in this story..."
              />
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
                      Room {option.room} · Care Level: {option.careLevel || 'Standard'}
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
            helperText="Choose the privacy and family visibility level for this post"
          >
            {AUDIENCE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ py: 1.25 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Iconify icon={opt.icon} width={22} sx={{ color: 'primary.main' }} />
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

        {/* Upload Photos Section (Dropzone with multiple images preview & removal) */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Upload Photos
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
                Images only (*.jpeg, *.jpg, *.png, *.webp, *.gif) · No PDFs or other document formats
              </Typography>
            }
          />
        </Box>

        {/* Bottom Actions */}
        <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ pt: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Iconify icon="solar:plain-bold" />}
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            sx={{ fontWeight: 700, px: 3.5 }}
          >
            Publish Post
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}

CommunityWallComposer.propTypes = {
  onPostCreated: PropTypes.func,
  sx: PropTypes.object,
};
