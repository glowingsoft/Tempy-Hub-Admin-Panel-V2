import { useState, useMemo, useEffect, useCallback } from 'react';
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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
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
import { toast } from 'src/components/snackbar';

import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { _communityWallPosts } from 'src/sections/family-engagement/mocks/data';
import { CommunityWallPostCard } from '../community-wall-post-card';
import { CommunityWallSidebar } from '../community-wall-sidebar';
import { NewWallPostDialog } from '../new-wall-post-dialog';
import { EditWallPostDialog } from '../edit-wall-post-dialog';

// ----------------------------------------------------------------------

const TAB_OPTIONS = [
  { value: 'all', label: 'All posts', color: 'default' },
  { value: 'pinned', label: 'Pin', color: 'info' },
  { value: 'photos', label: 'Photos', color: 'primary' },
  { value: 'scheduled', label: 'Scheduled', color: 'warning' },
  { value: 'drafts', label: 'Draft', color: 'default' },
];

const AUTHOR_OPTIONS = [
  'All',
  'Jane Smith',
  'Daniel Mensah',
  'Tom Lee',
  'Sarah Jenkins',
  'Amara Silva',
];
const RESIDENT_OPTIONS = [
  'All',
  'John Smith',
  'Mary Johnson',
  'Robert Brown',
  'Linda Davis',
  'James Taylor',
];
const GROUP_OPTIONS = [
  'All',
  'All families & residents',
  'Willow House families',
  'Rosewood Court families',
  'Selected families (3)',
];
const DATE_OPTIONS = ['Last 30 days', 'Last 7 days', 'Last 90 days', 'All time'];
const SORT_OPTIONS = ['Newest first', 'Oldest first', 'Most popular'];

// ----------------------------------------------------------------------

export function CommunityWallView() {
  const familyPaths = useFamilyEngagementPaths();

  const [posts, setPosts] = useState(_communityWallPosts);

  useEffect(() => {
    setPosts(_communityWallPosts);
  }, []);

  const [currentTab, setCurrentTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown filter states
  const [selectedAuthor, setSelectedAuthor] = useState('All');
  const [selectedResident, setSelectedResident] = useState('All');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedDate, setSelectedDate] = useState('Last 30 days');
  const [selectedSort, setSelectedSort] = useState('Newest first');

  // Anchor elements for filter menus
  const [authorAnchor, setAuthorAnchor] = useState(null);
  const [residentAnchor, setResidentAnchor] = useState(null);
  const [groupAnchor, setGroupAnchor] = useState(null);
  const [dateAnchor, setDateAnchor] = useState(null);
  const [sortAnchor, setSortAnchor] = useState(null);

  // Dialog states
  const newPostDialog = useBoolean();
  const [editingPost, setEditingPost] = useState(null);
  const editDialog = useBoolean();
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const deleteDialog = useBoolean();

  // Multi-image Lightbox preview state
  const [previewSlides, setPreviewSlides] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const previewModal = useBoolean();

  // Role detection for breadcrumbs
  const breadcrumbLinks = [
    { name: 'Dashboard', href: familyPaths.dashboardRoot },
    { name: 'Family Engagement', href: familyPaths.familyOverview },
    { name: 'Community Wall' },
  ];

  // Tab count helper for moderation-style tabs
  const getTabCount = useCallback(
    (tabValue) => {
      if (tabValue === 'all') return posts.length;
      if (tabValue === 'pinned') return posts.filter((p) => p.isPinned).length;
      if (tabValue === 'photos') return posts.filter((p) => p.photos && p.photos.length > 0).length;
      if (tabValue === 'scheduled') return posts.filter((p) => p.status === 'scheduled').length;
      if (tabValue === 'drafts') return posts.filter((p) => p.status === 'draft').length;
      return 0;
    },
    [posts]
  );

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedAuthor !== 'All' ||
    selectedResident !== 'All' ||
    selectedGroup !== 'All' ||
    selectedDate !== 'Last 30 days';

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedAuthor('All');
    setSelectedResident('All');
    setSelectedGroup('All');
    setSelectedDate('Last 30 days');
    setSelectedSort('Newest first');
  }, []);

  // Filtered & sorted posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Filter by Tab
    if (currentTab === 'pinned') {
      result = result.filter((p) => p.isPinned);
    } else if (currentTab === 'photos') {
      result = result.filter((p) => p.photos && p.photos.length > 0);
    } else if (currentTab === 'drafts') {
      result = result.filter((p) => p.status === 'draft');
    } else if (currentTab === 'scheduled') {
      result = result.filter((p) => p.status === 'scheduled');
    } else if (currentTab === 'reported') {
      result = result.filter((p) => p.isReported);
    } else {
      result = result.filter((p) => !p.status || p.status === 'published');
    }

    // Filter by Author
    if (selectedAuthor !== 'All') {
      result = result.filter((p) => p.author?.name?.toLowerCase().includes(selectedAuthor.toLowerCase()));
    }

    // Filter by Resident (strictly using residents from moderation)
    if (selectedResident !== 'All') {
      result = result.filter((p) =>
        p.taggedResidents?.some((r) => r.name.toLowerCase().includes(selectedResident.toLowerCase()))
      );
    }

    // Filter by Group
    if (selectedGroup !== 'All') {
      result = result.filter((p) => p.audience?.toLowerCase().includes(selectedGroup.toLowerCase()));
    }

    // Filter by Search Query
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

    // Sorting
    return result.sort((a, b) => {
      if (selectedSort === 'Oldest first') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (selectedSort === 'Most popular') {
        return (b.reactions?.heart || 0) - (a.reactions?.heart || 0);
      }
      // Newest first default (pinned on top)
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [posts, currentTab, selectedAuthor, selectedResident, selectedGroup, selectedSort, searchQuery]);

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
          const reactions = { ...(p.reactions || { heart: 0 }) };

          if (currentReaction === reactionType) {
            reactions[reactionType] = Math.max(0, (reactions[reactionType] || 1) - 1);
            reactions.userReaction = null;
          } else {
            reactions[reactionType] = (reactions[reactionType] || 0) + 1;
            reactions.userReaction = reactionType;
          }

          return { ...p, reactions };
        }
        return p;
      })
    );
  };

  // Preview full photo in Lightbox
  const handlePreviewPhoto = useCallback(
    (photoUrl, allPhotos = []) => {
      const photoList = allPhotos && allPhotos.length > 0 ? allPhotos : [photoUrl];
      const slides = photoList.map((url) => ({
        src: typeof url === 'string' ? url : url.src || url.preview || '',
      }));
      const initialIdx = Math.max(0, photoList.indexOf(photoUrl));
      setPreviewSlides(slides);
      setPreviewIndex(initialIdx >= 0 ? initialIdx : 0);
      previewModal.onTrue();
    },
    [previewModal]
  );

  return (
    <>
      <Helmet>
        <title>{`Community Wall | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent>
        {/* Top Header with 'Create post' Button */}
        <CustomBreadcrumbs
          heading="Community Wall"
          links={breadcrumbLinks}
          action={
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="solar:pen-new-square-bold" />}
              onClick={newPostDialog.onTrue}
            >
              Create post
            </Button>
          }
          sx={{ mb: { xs: 2.5, md: 3 } }}
        />

        {/* 1. Filter Card: Moderation-style Tabs at top and Search + Filters toolbar under that */}
        <Card sx={{ mb: 3 }}>
          {/* Status Tabs - identical UI to StatusTabsFilter in Moderation */}
          <Tabs
            value={currentTab}
            onChange={(_, val) => setCurrentTab(val)}
            sx={{
              px: 2.5,
              boxShadow: (theme) =>
                `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }}
          >
            {TAB_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={((tab.value === 'all' || tab.value === currentTab) && 'filled') || 'soft'}
                    color={tab.color || 'default'}
                  >
                    {getTabCount(tab.value)}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <Stack spacing={2} sx={{ p: 2.5 }}>
            {/* Search Bar - Exactly like Moderation Toolbar */}
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resident, post, or author..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Card>

        {/* 2. Filter Dropdowns Bar (Under the Card, NO second search) */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          flexWrap="wrap"
          sx={{ mb: 3 }}
        >
          {/* Author filter */}
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={(e) => setAuthorAnchor(e.currentTarget)}
            endIcon={<Iconify icon="solar:alt-arrow-down-linear" width={14} />}
            sx={{
              bgcolor: 'background.paper',
              borderColor: 'divider',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textTransform: 'none',
              px: 1.75,
              py: 0.6,
              color: selectedAuthor !== 'All' ? 'primary.main' : 'text.primary',
            }}
          >
            Author{selectedAuthor !== 'All' ? `: ${selectedAuthor}` : ''}
          </Button>
          <Menu anchorEl={authorAnchor} open={Boolean(authorAnchor)} onClose={() => setAuthorAnchor(null)}>
            {AUTHOR_OPTIONS.map((author) => (
              <MenuItem
                key={author}
                selected={selectedAuthor === author}
                onClick={() => {
                  setSelectedAuthor(author);
                  setAuthorAnchor(null);
                }}
                sx={{ fontSize: '0.8125rem' }}
              >
                {author === 'All' ? 'All Authors' : author}
              </MenuItem>
            ))}
          </Menu>

          {/* Resident filter (strictly using residents from moderation) */}
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={(e) => setResidentAnchor(e.currentTarget)}
            endIcon={<Iconify icon="solar:alt-arrow-down-linear" width={14} />}
            sx={{
              bgcolor: 'background.paper',
              borderColor: 'divider',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textTransform: 'none',
              px: 1.75,
              py: 0.6,
              color: selectedResident !== 'All' ? 'primary.main' : 'text.primary',
            }}
          >
            Resident{selectedResident !== 'All' ? `: ${selectedResident}` : ''}
          </Button>
          <Menu anchorEl={residentAnchor} open={Boolean(residentAnchor)} onClose={() => setResidentAnchor(null)}>
            {RESIDENT_OPTIONS.map((resident) => (
              <MenuItem
                key={resident}
                selected={selectedResident === resident}
                onClick={() => {
                  setSelectedResident(resident);
                  setResidentAnchor(null);
                }}
                sx={{ fontSize: '0.8125rem' }}
              >
                {resident === 'All' ? 'All Residents' : resident}
              </MenuItem>
            ))}
          </Menu>

          {/* Group filter */}
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={(e) => setGroupAnchor(e.currentTarget)}
            endIcon={<Iconify icon="solar:alt-arrow-down-linear" width={14} />}
            sx={{
              bgcolor: 'background.paper',
              borderColor: 'divider',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textTransform: 'none',
              px: 1.75,
              py: 0.6,
              color: selectedGroup !== 'All' ? 'primary.main' : 'text.primary',
            }}
          >
            Group{selectedGroup !== 'All' ? `: ${selectedGroup}` : ''}
          </Button>
          <Menu anchorEl={groupAnchor} open={Boolean(groupAnchor)} onClose={() => setGroupAnchor(null)}>
            {GROUP_OPTIONS.map((group) => (
              <MenuItem
                key={group}
                selected={selectedGroup === group}
                onClick={() => {
                  setSelectedGroup(group);
                  setGroupAnchor(null);
                }}
                sx={{ fontSize: '0.8125rem' }}
              >
                {group === 'All' ? 'All Groups' : group}
              </MenuItem>
            ))}
          </Menu>

          {/* Date filter */}
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={(e) => setDateAnchor(e.currentTarget)}
            endIcon={<Iconify icon="solar:alt-arrow-down-linear" width={14} />}
            sx={{
              bgcolor: 'background.paper',
              borderColor: 'divider',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textTransform: 'none',
              px: 1.75,
              py: 0.6,
            }}
          >
            {selectedDate}
          </Button>
          <Menu anchorEl={dateAnchor} open={Boolean(dateAnchor)} onClose={() => setDateAnchor(null)}>
            {DATE_OPTIONS.map((dateOpt) => (
              <MenuItem
                key={dateOpt}
                selected={selectedDate === dateOpt}
                onClick={() => {
                  setSelectedDate(dateOpt);
                  setDateAnchor(null);
                }}
                sx={{ fontSize: '0.8125rem' }}
              >
                {dateOpt}
              </MenuItem>
            ))}
          </Menu>

          {/* Sort filter */}
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={(e) => setSortAnchor(e.currentTarget)}
            endIcon={<Iconify icon="solar:alt-arrow-down-linear" width={14} />}
            sx={{
              bgcolor: 'background.paper',
              borderColor: 'divider',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textTransform: 'none',
              px: 1.75,
              py: 0.6,
            }}
          >
            {selectedSort}
          </Button>
          <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}>
            {SORT_OPTIONS.map((sortOpt) => (
              <MenuItem
                key={sortOpt}
                selected={selectedSort === sortOpt}
                onClick={() => {
                  setSelectedSort(sortOpt);
                  setSortAnchor(null);
                }}
                sx={{ fontSize: '0.8125rem' }}
              >
                {sortOpt}
              </MenuItem>
            ))}
          </Menu>

          {hasActiveFilters && (
            <Button
              color="error"
              size="small"
              onClick={handleResetFilters}
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              sx={{
                fontWeight: 600,
                fontSize: '0.8125rem',
                textTransform: 'none',
              }}
            >
              Clear
            </Button>
          )}
        </Stack>

        {/* 3. Main 2-Column Content: Left = Feed, Right = Sidebar */}
        <Grid container spacing={3}>
          {/* Left Column: Feed of Community Wall Posts */}
          <Grid item xs={12} lg={8}>
            {filteredPosts.length > 0 ? (
              <Stack spacing={2.5}>
                {filteredPosts.map((post) => (
                  <CommunityWallPostCard
                    key={post.id}
                    post={post}
                    onPin={handleTogglePin}
                    onEdit={handleOpenEdit}
                    onRemove={handleOpenDelete}
                    onReactionToggle={handleReactionToggle}
                    onPreviewPhoto={handlePreviewPhoto}
                  />
                ))}
              </Stack>
            ) : (
              <Card sx={{ p: 5, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
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
          </Grid>

          {/* Right Column: Sidebar Widgets */}
          <Grid item xs={12} lg={4}>
            <CommunityWallSidebar />
          </Grid>
        </Grid>

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

        {/* Multi-image Lightbox Preview */}
        <Lightbox
          open={previewModal.value}
          close={previewModal.onFalse}
          slides={previewSlides}
          index={previewIndex}
        />
      </DashboardContent>
    </>
  );
}

export default CommunityWallView;
