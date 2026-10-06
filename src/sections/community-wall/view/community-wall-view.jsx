import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { CONFIG } from 'src/config-global';
import { useBoolean } from 'src/hooks/use-boolean';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Lightbox } from 'src/components/lightbox';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';

import { _communityWallPosts } from 'src/sections/family-engagement/mocks/data';
import { CommunityWallPostCard } from '../community-wall-post-card';
import { NewWallPostDialog } from '../new-wall-post-dialog';
import { EditWallPostDialog } from '../edit-wall-post-dialog';

// ----------------------------------------------------------------------

const TAB_OPTIONS = [
  { value: 'all', label: 'All Posts' },
  { value: 'pinned', label: 'Pinned' },
  { value: 'with_photos', label: 'Photos' },
];

export function CommunityWallView() {
  const familyPaths = useFamilyEngagementPaths();

  const [posts, setPosts] = useState(_communityWallPosts);
  const [currentTab, setCurrentTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create post modal state
  const newPostDialog = useBoolean();

  // Editing state
  const [editingPost, setEditingPost] = useState(null);
  const editDialog = useBoolean();

  // Deleting state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const deleteDialog = useBoolean();

  // Lightbox preview
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const previewModal = useBoolean();

  // Role detection for breadcrumbs
  const breadcrumbLinks = [
    { name: 'Dashboard', href: familyPaths.dashboardRoot },
    { name: 'Family Engagement', href: familyPaths.familyOverview },
    { name: 'Community Wall' },
  ];

  // Tab counts
  const counts = useMemo(
    () => ({
      all: posts.length,
      pinned: posts.filter((p) => p.isPinned).length,
      with_photos: posts.filter((p) => p.photos && p.photos.length > 0).length,
    }),
    [posts]
  );

  // Filtered & sorted posts (pinned first)
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (currentTab === 'pinned') {
      result = result.filter((p) => p.isPinned);
    } else if (currentTab === 'with_photos') {
      result = result.filter((p) => p.photos && p.photos.length > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.content?.toLowerCase().includes(q) ||
          p.author?.name?.toLowerCase().includes(q) ||
          p.taggedResidents?.some((r) => r.name.toLowerCase().includes(q))
      );
    }

    // Sort: pinned first, then newest
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [posts, currentTab, searchQuery]);

  // Handlers
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleTogglePin = (postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextPinned = !p.isPinned;
          toast.success(nextPinned ? 'Post pinned to top of wall' : 'Post unpinned');
          return { ...p, isPinned: nextPinned };
        }
        return p;
      })
    );
  };

  const handleOpenEdit = (post) => {
    setEditingPost(post);
    editDialog.onTrue();
  };

  const handleSaveEdit = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    toast.success('Post updated successfully');
  };

  const handleOpenDelete = (postId) => {
    setDeleteTargetId(postId);
    deleteDialog.onTrue();
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      setPosts((prev) => prev.filter((p) => p.id !== deleteTargetId));
      toast.info('Post removed from community wall');
      setDeleteTargetId(null);
      deleteDialog.onFalse();
    }
  };

  const handleReactionToggle = (postId, reactionType) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const currentReaction = p.reactions?.userReaction;
          const reactions = { ...(p.reactions || { like: 0, heart: 0, smile: 0 }) };

          if (currentReaction === reactionType) {
            reactions[reactionType] = Math.max(0, (reactions[reactionType] || 1) - 1);
            reactions.userReaction = null;
          } else {
            if (currentReaction && reactions[currentReaction] > 0) {
              reactions[currentReaction] -= 1;
            }
            reactions[reactionType] = (reactions[reactionType] || 0) + 1;
            reactions.userReaction = reactionType;
          }

          return { ...p, reactions };
        }
        return p;
      })
    );
  };

  const handlePreviewPhoto = (photoUrl) => {
    setPreviewPhoto(photoUrl);
    previewModal.onTrue();
  };

  return (
    <>
      <Helmet>
        <title>{`Community Wall | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent>
        {/* Page Header with 'Create post' Button */}
        <CustomBreadcrumbs
          heading="Community Wall"
          links={breadcrumbLinks}
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:pen-new-square-bold" />}
              onClick={newPostDialog.onTrue}
              sx={{ fontWeight: 700, px: 2.5 }}
            >
              Create post
            </Button>
          }
          sx={{ mb: { xs: 3, md: 4 } }}
        />

        {/* Feed Filtering Toolbar (Tabs & Search) */}
        <Card sx={{ mb: 3.5, p: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Tabs
              value={currentTab}
              onChange={(_, val) => setCurrentTab(val)}
              sx={{
                '& .MuiTab-root': {
                  minHeight: 44,
                  fontWeight: 600,
                },
              }}
            >
              {TAB_OPTIONS.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  iconPosition="end"
                  icon={
                    <Label
                      variant={currentTab === tab.value ? 'filled' : 'soft'}
                      color={tab.value === 'pinned' ? 'primary' : 'default'}
                      sx={{ ml: 1 }}
                    >
                      {counts[tab.value]}
                    </Label>
                  }
                />
              ))}
            </Tabs>

            <TextField
              size="small"
              placeholder="Search posts or residents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: 1, sm: 280 } }}
            />
          </Stack>
        </Card>

        {/* Feed of Posts: 2 posts in a row (50% width each) */}
        {filteredPosts.length > 0 ? (
          <Grid container spacing={3}>
            {filteredPosts.map((post) => (
              <Grid item xs={12} md={6} key={post.id} sx={{ display: 'flex' }}>
                <CommunityWallPostCard
                  post={post}
                  onPin={handleTogglePin}
                  onEdit={handleOpenEdit}
                  onRemove={handleOpenDelete}
                  onReactionToggle={handleReactionToggle}
                  onPreviewPhoto={handlePreviewPhoto}
                  sx={{ width: 1, height: '100%' }}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card sx={{ p: 5, textAlign: 'center', bgcolor: 'background.neutral' }}>
            <Iconify
              icon="solar:letter-unread-bold"
              width={48}
              sx={{ color: 'text.disabled', mb: 1.5, mx: 'auto' }}
            />
            <Typography variant="subtitle1" fontWeight={700}>
              No posts found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {searchQuery
                ? `No posts matched "${searchQuery}". Try a different keyword.`
                : 'No posts in this category yet. Click "Create post" above to share an update.'}
            </Typography>
          </Card>
        )}

        {/* Create Post Dialog */}
        <NewWallPostDialog
          open={newPostDialog.value}
          onClose={newPostDialog.onFalse}
          onCreated={handlePostCreated}
        />

        {/* Edit Post Dialog */}
        <EditWallPostDialog
          open={editDialog.value}
          onClose={editDialog.onFalse}
          post={editingPost}
          onSave={handleSaveEdit}
        />

        {/* Confirm Delete Dialog */}
        <Dialog open={deleteDialog.value} onClose={deleteDialog.onFalse} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:danger-triangle-bold" sx={{ color: 'error.main', width: 24, height: 24 }} />
            Remove Wall Post
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Are you sure you want to remove this post from the Community Wall? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" color="inherit" onClick={deleteDialog.onFalse}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleConfirmDelete}>
              Remove Post
            </Button>
          </DialogActions>
        </Dialog>

        {/* Lightbox Photo Preview */}
        <Lightbox
          open={previewModal.value}
          close={previewModal.onFalse}
          slides={previewPhoto ? [{ type: 'image', src: previewPhoto }] : []}
          index={0}
        />
      </DashboardContent>
    </>
  );
}

export default CommunityWallView;
