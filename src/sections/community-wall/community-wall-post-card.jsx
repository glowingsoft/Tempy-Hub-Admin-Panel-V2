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
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { fToNow } from 'src/utils/format-time';

// ----------------------------------------------------------------------

// Helper to render text with clickable/highlighted hashtags
function renderContentWithHashtags(text) {
  if (!text) return null;
  const parts = text.split(/(#[a-zA-Z0-9_]+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <Box
          key={index}
          component="span"
          sx={{
            color: 'primary.main',
            fontWeight: 700,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {part}
        </Box>
      );
    }
    return part;
  });
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

  // Like state (like previous)
  const initialLikes =
    (post.reactions?.like || 0) +
    (post.reactions?.heart || 0) +
    (post.reactions?.smile || 0) || 248;
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(
    post.reactions?.userReaction === 'like' || post.reactions?.userReaction === 'heart'
  );

  // Popover state for "Seen by"
  const [seenAnchorEl, setSeenAnchorEl] = useState(null);

  // Menu state for options (Pin, Edit, Remove)
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const photos = post.photos || [];
  const hasPhotos = photos.length > 0;
  const hasMultiplePhotos = photos.length > 1;

  // Viewers data for Seen-by
  const seenBy = post.seenBy || {
    count: 28,
    recentViewers: [
      { name: 'Sarah Smith', relation: 'Daughter of Elsie Hall', avatarUrl: 'https://i.pravatar.cc/150?img=48' },
      { name: 'David Johnson', relation: 'Son of Arthur Pendelton', avatarUrl: 'https://i.pravatar.cc/150?img=53' },
      { name: 'Jane Hall', relation: 'Daughter of Margaret Hughes', avatarUrl: 'https://i.pravatar.cc/150?img=47' },
      { name: 'Tom Bell', relation: 'Son of Rose Bell', avatarUrl: 'https://i.pravatar.cc/150?img=52' },
    ],
  };

  const handleOpenMenu = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleOpenSeen = (event) => {
    setSeenAnchorEl(event.currentTarget);
  };

  const handleCloseSeen = () => {
    setSeenAnchorEl(null);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleToggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
    onReactionToggle?.(post.id, 'like');
  };

  // Author details
  const authorName = post.author?.name || 'Noa Tamura';
  const authorHandle = post.author?.handle || `@${authorName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const authorInitials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  const timeText = post.createdAt ? fToNow(post.createdAt) : '6 h ago';
  const groupText = post.audience || 'Florence House';

  const isPinned = !!post.isPinned;

  return (
    <Card
      sx={{
        borderRadius: 2,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: (t) =>
          isPinned
            ? `1px solid ${t.palette.primary.main}`
            : `1px solid ${t.palette.divider}`,
        boxShadow: (t) => t.customShadows?.card || '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: (t) => t.customShadows?.z8,
        },
        ...sx,
      }}
    >
      <Box>
        {/* Post Header */}
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{ p: 2, pb: 1.5 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Avatar */}
            <Avatar
              src={post.author?.avatarUrl}
              alt={authorName}
              sx={{
                width: 44,
                height: 44,
                bgcolor: '#0D687D',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9375rem',
              }}
            >
              {authorInitials}
            </Avatar>

            {/* Author info & timestamp */}
            <Box>
              <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  {authorName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontWeight: 500 }}
                >
                  {authorHandle}
                </Typography>
              </Stack>

              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.25, display: 'block' }}>
                {timeText} · {groupText}
              </Typography>
            </Box>
          </Stack>

          {/* Header Right Actions: Pinned badge + Three dots menu */}
          <Stack direction="row" spacing={1} alignItems="center">
            {isPinned && (
              <Chip
                size="small"
                variant="soft"
                color="primary"
                icon={<Iconify icon="solar:pin-bold" width={14} />}
                label="Pinned"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  '& .MuiChip-icon': { ml: 0.5 },
                }}
              />
            )}
            <IconButton size="small" onClick={handleOpenMenu} sx={{ color: 'text.secondary' }}>
              <Iconify icon="eva:more-horizontal-fill" width={22} />
            </IconButton>
          </Stack>
        </Stack>

        {/* Post Text Content */}
        <Box sx={{ px: 2, pb: 1.75 }}>
          {post.title && post.title !== 'Community Update' && (
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: 'text.primary' }}>
              {post.title}
            </Typography>
          )}

          <Typography
            variant="body1"
            sx={{
              color: 'text.primary',
              lineHeight: 1.5,
              whiteSpace: 'pre-line',
              fontSize: '0.9375rem',
            }}
          >
            {renderContentWithHashtags(post.content)}
          </Typography>

          {/* Tagged Residents */}
          {post.taggedResidents && post.taggedResidents.length > 0 && (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 1.25 }}>
              {post.taggedResidents.map((resident) => (
                <Chip
                  key={resident.id}
                  size="small"
                  avatar={<Avatar src={resident.avatarUrl}>{resident.name?.charAt(0)}</Avatar>}
                  label={resident.name}
                  sx={{
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                    color: 'primary.darker',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* Photos Carousel with Dots Navigation */}
        {hasPhotos && (
          <Box
            sx={{
              position: 'relative',
              width: 1,
              bgcolor: 'black',
              overflow: 'hidden',
              userSelect: 'none',
            }}
          >
            {/* Active Image */}
            <Box
              component="img"
              src={photos[activeImageIndex]}
              alt={`Photo ${activeImageIndex + 1}`}
              onClick={() => onPreviewPhoto?.(photos[activeImageIndex])}
              sx={{
                width: 1,
                height: { xs: 260, sm: 320, md: 360 },
                objectFit: 'cover',
                display: 'block',
                cursor: 'pointer',
                transition: 'opacity 0.25s ease-in-out',
              }}
            />

            {/* Left / Right Arrow Navigation if 2+ photos */}
            {hasMultiplePhotos && (
              <>
                <IconButton
                  size="small"
                  onClick={handlePrevImage}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 10,
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0, 0, 0, 0.45)',
                    color: 'common.white',
                    zIndex: 2,
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.75)' },
                  }}
                >
                  <Iconify icon="solar:alt-arrow-left-bold" width={18} />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={handleNextImage}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    right: 10,
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0, 0, 0, 0.45)',
                    color: 'common.white',
                    zIndex: 2,
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.75)' },
                  }}
                >
                  <Iconify icon="solar:alt-arrow-right-bold" width={18} />
                </IconButton>
              </>
            )}

            {/* Dots Pagination Indicator (Centered at Bottom) */}
            {hasMultiplePhotos && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 0.75,
                  zIndex: 2,
                }}
              >
                {photos.map((_, idx) => (
                  <Box
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(idx);
                    }}
                    sx={{
                      width: idx === activeImageIndex ? 22 : 8,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: idx === activeImageIndex ? 'common.white' : 'rgba(255, 255, 255, 0.55)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        bgcolor: 'common.white',
                      },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Card Footer: Reaction like previous and Seen-by at one place */}
      <Box sx={{ mt: 'auto' }}>
        {/* Engagement Summary Line matching screenshot */}
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {likesCount > 0 ? `Sam, Priya and ${likesCount} others liked this` : 'Be the first to like this'}
          </Typography>
        </Box>

        <Divider sx={{ mx: 2, my: 1 }} />

        {/* Action Bar: Like (like previous) and Seen by (at one place) */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pb: 1.25, pt: 0.25, px: 2 }}
        >
          {/* Reaction Button (Like {likesCount} like previous) */}
          <Button
            size="medium"
            color="inherit"
            onClick={handleToggleLike}
            startIcon={
              <Iconify
                icon={isLiked ? 'solar:heart-bold' : 'solar:heart-linear'}
                width={20}
                sx={{
                  color: isLiked ? 'error.main' : 'text.secondary',
                  transition: 'transform 0.15s ease',
                  '&:active': { transform: 'scale(1.2)' },
                }}
              />
            }
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: isLiked ? 'error.main' : 'text.secondary',
              textTransform: 'none',
            }}
          >
            Like {likesCount}
          </Button>

          {/* Seen-by (At one place) */}
          <Stack direction="row" spacing={1} alignItems="center">
            {seenBy.recentViewers && seenBy.recentViewers.length > 0 && (
              <AvatarGroup
                max={3}
                onClick={handleOpenSeen}
                sx={{
                  cursor: 'pointer',
                  '& .MuiAvatar-root': {
                    width: 24,
                    height: 24,
                    fontSize: '0.6875rem',
                    border: `1.5px solid ${theme.palette.background.paper}`,
                  },
                }}
              >
                {seenBy.recentViewers.map((viewer, idx) => (
                  <Avatar key={idx} alt={viewer.name} src={viewer.avatarUrl} />
                ))}
              </AvatarGroup>
            )}

            <Button
              size="medium"
              color="inherit"
              onClick={handleOpenSeen}
              startIcon={<Iconify icon="solar:eye-bold-duotone" width={20} sx={{ color: 'primary.main' }} />}
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'text.secondary',
                textTransform: 'none',
                '&:hover': { color: 'primary.main' },
              }}
            >
              Seen by {seenBy.count || 28}
            </Button>
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
          <Iconify icon="solar:eye-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight={700}>
            Viewed by {seenBy.count || 28} people
          </Typography>
        </Stack>
        <Divider sx={{ mb: 1 }} />

        <List disablePadding sx={{ overflowY: 'auto' }}>
          {(seenBy.recentViewers || []).map((viewer, idx) => (
            <ListItem key={idx} sx={{ px: 1, py: 0.75, borderRadius: 1 }}>
              <ListItemAvatar sx={{ minWidth: 38 }}>
                <Avatar src={viewer.avatarUrl} sx={{ width: 30, height: 30 }}>
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
            onPin?.(post.id);
          }}
        >
          <ListItemIcon>
            <Iconify icon={isPinned ? 'solar:pin-bold' : 'solar:pin-linear'} width={20} />
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
            <Iconify icon="solar:pen-bold" width={20} />
          </ListItemIcon>
          <ListItemText primary="Edit Post" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            onRemove?.(post.id);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" width={20} />
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
