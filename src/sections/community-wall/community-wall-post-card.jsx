import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { getPostId, getPostPhotoUrls } from './utils';

// ----------------------------------------------------------------------

function getAuthorAvatarProps(name = '') {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (initials === 'DM') {
    return { initials: 'DM', bgcolor: '#D1FAE5', color: '#047857' };
  }
  if (initials === 'TL') {
    return { initials: 'TL', bgcolor: '#EDE9FE', color: '#6D28D9' };
  }
  if (initials === 'JS') {
    return { initials: 'JS', bgcolor: '#FEF3C7', color: '#B45309' };
  }
  if (initials === 'SJ') {
    return { initials: 'SJ', bgcolor: '#FEE2E2', color: '#B91C1C' };
  }
  if (initials === 'AS') {
    return { initials: 'AS', bgcolor: '#FCE7F3', color: '#BE185D' };
  }

  return { initials: initials || 'CW', bgcolor: '#E0E7FF', color: '#4338CA' };
}

// ----------------------------------------------------------------------

export function CommunityWallPostCard({
  post,
  onPin,
  onEdit,
  onRemove,
  onReactionToggle,
  onPreviewPhoto,
  sx,
}) {
  const theme = useTheme();

  // Carousel state for multiple photos
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Like reaction state
  const initialLikes = post.reactionCount ?? post.reactions?.heart ?? 0;
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(post.reactions?.userReaction === 'heart');

  // Seen-by Popover state
  const [seenAnchorEl, setSeenAnchorEl] = useState(null);

  // Options Menu state (Pin, Edit, Delete)
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const photos = getPostPhotoUrls(post);
  const hasPhotos = photos.length > 0;
  const hasMultiplePhotos = photos.length > 1;
  const postId = getPostId(post);

  const authorName = post.authorName || post.author?.name || '—';
  const authorRole = post.authorRole || post.author?.role || '';
  const authorAvatarUrl = post.authorPhotoUrl || post.author?.avatarUrl;
  const avatarStyle = getAuthorAvatarProps(authorName);

  const timeText = post.timeText || '';
  const audienceText = post.audienceLabel || post.audience || '—';
  const postBody = post.message || post.content || '';
  const isPinned = !!post.isPinned;

  // Viewers
  const seenCount = post.seenCount ?? post.seenBy?.count ?? 0;
  const totalAudience = post.audienceCount ?? post.totalAudience ?? 0;
  const recentViewers = post.seenBy?.recentViewers || [
    { name: 'Sarah Smith', relation: 'Daughter of John Smith', avatarUrl: 'https://i.pravatar.cc/150?img=48' },
    { name: 'David Johnson', relation: 'Son of Mary Johnson', avatarUrl: 'https://i.pravatar.cc/150?img=53' },
  ];

  const handleOpenMenu = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleOpenSeen = (event) => {
    event.stopPropagation();
    setSeenAnchorEl(event.currentTarget);
  };

  const handleCloseSeen = () => {
    setSeenAnchorEl(null);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveImageIndex((prev) => (prev <= 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveImageIndex((prev) => (prev >= photos.length - 1 ? 0 : prev + 1));
  };

  const handleToggleLike = (e) => {
    e.stopPropagation();
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
    onReactionToggle?.(postId, 'heart');
  };

  const handleCardImageClick = () => {
    if (!hasPhotos) return;
    onPreviewPhoto?.(photos[activeImageIndex] || photos[0], photos);
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        p: 2,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2.5,
        border: (t) => `1px solid ${isPinned ? '#C7D2FE' : t.palette.divider}`,
        boxShadow: (t) => t.customShadows?.card || '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
        bgcolor: 'background.paper',
        '&:hover': {
          boxShadow: (t) => t.customShadows?.z8,
        },
        ...sx,
      }}
    >
      {/* 1. Left Media / Photo Box - Clicking card opens full image in Lightbox */}
      <Box
        onClick={handleCardImageClick}
        sx={{
          width: { xs: 1, md: 270 },
          minWidth: { md: 270 },
          maxWidth: { md: 270 },
          height: { xs: 200, md: 'auto' },
          minHeight: { md: 195 },
          borderRadius: 1.5,
          overflow: 'hidden',
          position: 'relative',
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'grey.800' : '#F4F6F8'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
        }}
      >
        {hasPhotos ? (
          <Box
            component="img"
            src={photos[activeImageIndex] || photos[0]}
            alt={post.title}
            sx={{
              width: 1,
              height: 1,
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.02)' },
            }}
          />
        ) : (
          <Iconify icon="solar:gallery-minimalistic-bold" width={48} sx={{ color: 'text.disabled' }} />
        )}

        {/* Multiple Photos Navigation (< and > buttons) */}
        {hasMultiplePhotos && (
          <>
            {/* Prev button */}
            <Box
              component="button"
              type="button"
              aria-label="Previous image"
              onClick={handlePrevImage}
              sx={{
                position: 'absolute',
                top: '50%',
                left: 8,
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0, 0, 0, 0.55)',
                color: '#FFFFFF',
                border: 'none',
                outline: 'none',
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 20,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.85)', transform: 'translateY(-50%) scale(1.1)' },
              }}
            >
              <Iconify icon="solar:alt-arrow-left-bold" width={18} sx={{ pointerEvents: 'none' }} />
            </Box>

            {/* Next button */}
            <Box
              component="button"
              type="button"
              aria-label="Next image"
              onClick={handleNextImage}
              sx={{
                position: 'absolute',
                top: '50%',
                right: 8,
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(0, 0, 0, 0.55)',
                color: '#FFFFFF',
                border: 'none',
                outline: 'none',
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 20,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.85)', transform: 'translateY(-50%) scale(1.1)' },
              }}
            >
              <Iconify icon="solar:alt-arrow-right-bold" width={18} sx={{ pointerEvents: 'none' }} />
            </Box>

            {/* Photo Count Tag */}
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0, 0, 0, 0.55)',
                color: 'common.white',
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                fontSize: '0.6875rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                zIndex: 10,
              }}
            >
              <Iconify icon="solar:camera-bold" width={12} />
              {activeImageIndex + 1}/{photos.length}
            </Box>

            {/* Dots indicator */}
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 0.5,
                zIndex: 10,
              }}
            >
              {photos.map((_, idx) => (
                <Box
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setActiveImageIndex(idx);
                  }}
                  sx={{
                    width: idx === activeImageIndex ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: idx === activeImageIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </Box>

      {/* 2. Right Content Column */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0,
        }}
      >
        <Box>
          {/* Header Row: Author details & Pinned badge / Three dots */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              {authorAvatarUrl ? (
                <Avatar
                  src={authorAvatarUrl}
                  alt={authorName}
                  sx={{ width: 38, height: 38 }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: avatarStyle.bgcolor,
                    color: avatarStyle.color,
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                  }}
                >
                  {avatarStyle.initials}
                </Avatar>
              )}

              <Box>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.2 }}>
                    {authorName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    ·
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                    {authorRole}
                  </Typography>
                </Stack>

                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                  {timeText} · {audienceText}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.75} alignItems="center">
              {isPinned && (
                <Chip
                  size="small"
                  icon={<Iconify icon="solar:pin-bold" width={13} sx={{ color: '#4F46E5 !important' }} />}
                  label="Pinned"
                  sx={{
                    height: 24,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    bgcolor: '#EEF2FF',
                    color: '#4F46E5',
                    borderRadius: '12px',
                    px: 0.5,
                  }}
                />
              )}

              <IconButton size="small" onClick={handleOpenMenu} sx={{ color: 'text.secondary' }}>
                <Iconify icon="eva:more-horizontal-fill" width={20} />
              </IconButton>
            </Stack>
          </Stack>

          {/* Post Title */}
          {post.title && (
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9375rem', mt: 1, mb: 0.5 }}>
              {post.title}
            </Typography>
          )}

          {/* Post Content */}
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.45,
              fontSize: '0.8125rem',
              mb: 1.25,
            }}
          >
            {postBody}
          </Typography>

          {/* Tagged Residents */}
          <Stack direction="row" spacing={0.75} flexWrap="wrap" alignItems="center" sx={{ mb: 1 }}>
            {post.taggedResidents?.map((resident, idx) => (
              <Chip
                key={resident.residentId || resident.id || idx}
                size="small"
                avatar={
                  resident.photoUrl || resident.avatarUrl ? (
                    <Avatar
                      alt={resident.name}
                      src={resident.photoUrl || resident.avatarUrl}
                      sx={{ width: 18, height: 18 }}
                    />
                  ) : undefined
                }
                label={resident.name}
                sx={{
                  height: 24,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  bgcolor: '#EEF2FF',
                  color: '#4338CA',
                  borderRadius: '12px',
                  '& .MuiChip-avatar': {
                    width: 18,
                    height: 18,
                    ml: '4px',
                  },
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Footer Row: Heart, Seen by, Status Badge, Avatars */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1, pt: 1 }}>
          <Stack direction="row" spacing={2.5} alignItems="center">
            {/* Heart reaction */}
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              onClick={handleToggleLike}
              sx={{
                cursor: 'pointer',
                userSelect: 'none',
                '&:hover': { opacity: 0.8 },
              }}
            >
              <Iconify icon="solar:heart-bold" width={17} sx={{ color: '#EF4444' }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: isLiked ? '#EF4444' : 'text.primary',
                  fontSize: '0.8125rem',
                }}
              >
                {likesCount > 0 ? likesCount : '—'}
              </Typography>
            </Stack>

            {/* Seen Count */}
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              onClick={handleOpenSeen}
              sx={{
                cursor: 'pointer',
                userSelect: 'none',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <Iconify icon="solar:eye-bold" width={17} sx={{ color: '#3B82F6' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                Seen {seenCount}/{totalAudience}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {/* Recent viewer avatars */}
            {recentViewers && recentViewers.length > 0 && (
              <AvatarGroup
                max={3}
                onClick={handleOpenSeen}
                sx={{
                  cursor: 'pointer',
                  '& .MuiAvatar-root': {
                    width: 22,
                    height: 22,
                    fontSize: '0.625rem',
                    border: `1.5px solid ${theme.palette.background.paper}`,
                  },
                }}
              >
                {recentViewers.map((viewer, idx) => (
                  <Avatar key={idx} alt={viewer.name} src={viewer.avatarUrl} />
                ))}
              </AvatarGroup>
            )}

            {/* Status Pills */}
            {post.inGazette && (
              <Chip
                size="small"
                label={post.inGazette}
                sx={{
                  height: 24,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  bgcolor: '#DCFCE7',
                  color: '#15803D',
                  borderRadius: '12px',
                }}
              />
            )}
            {post.inNewsletter && (
              <Chip
                size="small"
                label={post.inNewsletter}
                sx={{
                  height: 24,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  bgcolor: '#EDE9FE',
                  color: '#6D28D9',
                  borderRadius: '12px',
                }}
              />
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Seen By Popover */}
      <Popover
        open={Boolean(seenAnchorEl)}
        anchorEl={seenAnchorEl}
        onClose={handleCloseSeen}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: 280, p: 1.5, maxHeight: 340, borderRadius: 2 },
          },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1, py: 0.5, mb: 1 }}>
          <Iconify icon="solar:eye-bold" width={18} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight={700}>
            Viewed by {seenCount} of {totalAudience} people
          </Typography>
        </Stack>

        <List disablePadding sx={{ overflowY: 'auto' }}>
          {recentViewers.map((viewer, idx) => (
            <ListItem key={idx} sx={{ px: 1, py: 0.75, borderRadius: 1 }}>
              <ListItemAvatar sx={{ minWidth: 36 }}>
                <Avatar src={viewer.avatarUrl} sx={{ width: 28, height: 28 }}>
                  {viewer.name?.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" sx={{ fontSize: '0.8125rem' }}>
                    {viewer.name}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {viewer.relation}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Popover>

      {/* Options Menu (Pin, Edit, Remove) */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            onPin?.(post);
          }}
        >
          <ListItemIcon>
            <Iconify icon={isPinned ? 'solar:pin-bold' : 'solar:pin-linear'} width={18} />
          </ListItemIcon>
          <ListItemText primary={isPinned ? 'Unpin Post' : 'Pin to Top'} />
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            onEdit?.(post);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:pen-bold" width={18} />
          </ListItemIcon>
          <ListItemText primary="Edit Post" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            onRemove?.(post);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
          </ListItemIcon>
          <ListItemText primary="Delete Post" />
        </MenuItem>
      </Menu>
    </Card>
  );
}

CommunityWallPostCard.propTypes = {
  post: PropTypes.object.isRequired,
  onPin: PropTypes.func,
  onEdit: PropTypes.func,
  onRemove: PropTypes.func,
  onReactionToggle: PropTypes.func,
  onPreviewPhoto: PropTypes.func,
  sx: PropTypes.object,
};

export default CommunityWallPostCard;
