import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Lightbox } from 'src/components/lightbox';
import { LoadingScreen } from 'src/components/loading-screen';
import { toast } from 'src/components/snackbar';
import { TablePaginationCustom, useTable } from 'src/components/table';
import { CONFIG } from 'src/config-global';
import { useBoolean } from 'src/hooks/use-boolean';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useDebounce } from 'src/hooks/use-debounce';
import { DashboardContent } from 'src/layouts/dashboard';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import {
  useGetFamilyPostsQuery,
  useGetTaggableResidentsQuery,
  useRemoveFamilyPostMutation,
  useUpdateFamilyPostMutation,
} from 'src/store/Reducer/family-posts-api';
import { varAlpha } from 'src/theme/styles';

import { CommunityWallPostCard } from '../community-wall-post-card';
import { CommunityWallSidebar } from '../community-wall-sidebar';
import { EditWallPostDialog } from '../edit-wall-post-dialog';
import { NewWallPostDialog } from '../new-wall-post-dialog';
import {
  FAMILY_POST_AUDIENCE_OPTIONS,
  FAMILY_POST_DATE_OPTIONS,
  FAMILY_POST_SORT_OPTIONS,
  FAMILY_POST_TAB_OPTIONS,
  getPostId,
} from '../utils';

// ----------------------------------------------------------------------

export function CommunityWallView() {
  const familyPaths = useFamilyEngagementPaths();
  const { organizationId, isOwner, user } = useCurrentOrganization();
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 20 });

  const siteManagerBranchId = user?.branchId || user?.branch?._id || '';
  const [ownerBranchId, setOwnerBranchId] = useState('');
  const branchId = isOwner ? ownerBranchId : siteManagerBranchId;

  const { data: branchesData } = useGetBranchesQuery(
    { organizationId, page: 1, limit: 100 },
    { skip: !isOwner || !organizationId }
  );
  const branches = branchesData?.data ?? [];

  useEffect(() => {
    if (!isOwner || !branches.length) return;
    if (!ownerBranchId || !branches.some((branch) => branch._id === ownerBranchId)) {
      setOwnerBranchId(branches[0]._id);
    }
  }, [branches, isOwner, ownerBranchId]);

  const [currentTab, setCurrentTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const trimmedKeyword = useDebounce(searchQuery, 400).trim();

  const [selectedAuthorId, setSelectedAuthorId] = useState('');
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  const [selectedDays, setSelectedDays] = useState(30);
  const [selectedSort, setSelectedSort] = useState('newest');

  const [authorAnchor, setAuthorAnchor] = useState(null);
  const [residentAnchor, setResidentAnchor] = useState(null);
  const [groupAnchor, setGroupAnchor] = useState(null);
  const [dateAnchor, setDateAnchor] = useState(null);
  const [sortAnchor, setSortAnchor] = useState(null);

  const newPostDialog = useBoolean();
  const [editingPost, setEditingPost] = useState(null);
  const editDialog = useBoolean();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const deleteDialog = useBoolean();
  const [previewSlides, setPreviewSlides] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const previewModal = useBoolean();

  const tabParams = useMemo(() => {
    if (currentTab === 'pinned') return { pinned: true };
    if (currentTab === 'photos') return { hasPhotos: true };
    if (currentTab === 'scheduled') return { status: 'scheduled' };
    if (currentTab === 'drafts') return { status: 'draft' };
    return { status: 'published' };
  }, [currentTab]);

  const { data, isLoading, isFetching, isError } = useGetFamilyPostsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      branchId,
      ...tabParams,
      ...(selectedAuthorId ? { authorId: selectedAuthorId } : {}),
      ...(selectedResidentId ? { residentId: selectedResidentId } : {}),
      ...(selectedAudience ? { audience: selectedAudience } : {}),
      ...(selectedDays ? { days: selectedDays } : {}),
      ...(selectedSort ? { sort: selectedSort } : {}),
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
    },
    { skip: !organizationId || !branchId }
  );

  const { data: taggableResidents = [] } = useGetTaggableResidentsQuery(
    { organizationId, branchId },
    { skip: !organizationId || !branchId }
  );

  const [updateFamilyPost] = useUpdateFamilyPostMutation();
  const [removeFamilyPost] = useRemoveFamilyPostMutation();

  const posts = data?.data ?? [];
  const meta = data?.meta ?? {};
  const statusCounts = meta.counts ?? {};
  const totalRecords = meta.totalRecords ?? posts.length;
  const loading = isLoading || isFetching;
  const authors = meta.activity?.authors ?? [];

  const getTabCount = useCallback(
    (tab) => statusCounts[tab.countKey] ?? 0,
    [statusCounts]
  );

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    Boolean(selectedAuthorId) ||
    Boolean(selectedResidentId) ||
    Boolean(selectedAudience) ||
    selectedDays !== 30;

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedAuthorId('');
    setSelectedResidentId('');
    setSelectedAudience('');
    setSelectedDays(30);
    setSelectedSort('newest');
    table.onResetPage();
  }, [table]);

  const handleTogglePin = async (post) => {
    try {
      await updateFamilyPost({
        organizationId,
        postId: getPostId(post),
        title: post.title || '',
        message: post.message || '',
        isPinned: !post.isPinned,
      }).unwrap();
      toast.success(post.isPinned ? 'Post unpinned' : 'Post pinned to top of wall');
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to update pin');
    }
  };

  const handleConfirmDelete = async () => {
    const postId = getPostId(deleteTarget);
    if (!postId) return;
    try {
      await removeFamilyPost({ organizationId, postId }).unwrap();
      toast.success('Post removed from community wall');
      setDeleteTarget(null);
      deleteDialog.onFalse();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to remove post');
    }
  };

  const handlePreviewPhoto = useCallback(
    (photoUrl, allPhotos = []) => {
      const photoList = allPhotos.length ? allPhotos : [photoUrl];
      setPreviewSlides(photoList.map((url) => ({ src: typeof url === 'string' ? url : url.url || '' })));
      setPreviewIndex(Math.max(0, photoList.indexOf(photoUrl)));
      previewModal.onTrue();
    },
    [previewModal]
  );

  const selectedAuthor = authors.find((author) => author.authorId === selectedAuthorId);
  const selectedResident = taggableResidents.find((resident) => resident.residentId === selectedResidentId);
  const selectedAudienceOption = FAMILY_POST_AUDIENCE_OPTIONS.find((option) => option.value === selectedAudience);
  const selectedDateOption = FAMILY_POST_DATE_OPTIONS.find((option) => option.value === selectedDays);
  const selectedSortOption = FAMILY_POST_SORT_OPTIONS.find((option) => option.value === selectedSort);

  return (
    <>
      <Helmet>
        <title>{`Community Wall | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent>
        <CustomBreadcrumbs
          heading="Community Wall"
          links={[
            { name: 'Dashboard', href: familyPaths.dashboardRoot },
            { name: 'Family Engagement', href: familyPaths.familyOverview },
            { name: 'Community Wall' },
          ]}
          action={
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
              {isOwner && (
                <TextField
                  select
                  size="small"
                  label="Site"
                  value={ownerBranchId}
                  onChange={(event) => {
                    setOwnerBranchId(event.target.value);
                    table.onResetPage();
                  }}
                  sx={{ minWidth: { xs: 1, sm: 240 } }}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch._id} value={branch._id} sx={{ textTransform: 'capitalize' }}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="solar:pen-new-square-bold" />}
                onClick={newPostDialog.onTrue}
                disabled={!branchId}
              >
                Create post
              </Button>
            </Stack>
          }
          sx={{ mb: { xs: 2.5, md: 3 } }}
        />

        <Card sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, value) => {
              setCurrentTab(value);
              table.onResetPage();
            }}
            sx={{
              px: 2.5,
              boxShadow: (theme) =>
                `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }}
          >
            {FAMILY_POST_TAB_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={tab.value === 'all' || tab.value === currentTab ? 'filled' : 'soft'}
                    color={tab.color}
                  >
                    {getTabCount(tab)}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <Stack spacing={2} sx={{ p: 2.5 }}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                table.onResetPage();
              }}
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

        <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap" sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={(event) => setAuthorAnchor(event.currentTarget)}
            endIcon={<Iconify icon="solar:alt-arrow-down-linear" width={14} />}
            sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
          >
            Author{selectedAuthor ? `: ${selectedAuthor.authorName}` : ''}
          </Button>
          <Menu anchorEl={authorAnchor} open={Boolean(authorAnchor)} onClose={() => setAuthorAnchor(null)}>
            <MenuItem
              selected={!selectedAuthorId}
              onClick={() => {
                setSelectedAuthorId('');
                setAuthorAnchor(null);
                table.onResetPage();
              }}
            >
              All authors
            </MenuItem>
            {authors.map((author) => (
              <MenuItem
                key={author.authorId}
                selected={selectedAuthorId === author.authorId}
                onClick={() => {
                  setSelectedAuthorId(author.authorId);
                  setAuthorAnchor(null);
                  table.onResetPage();
                }}
              >
                {author.authorName}
              </MenuItem>
            ))}
          </Menu>

          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={(event) => setResidentAnchor(event.currentTarget)}
            endIcon={<Iconify icon="solar:alt-arrow-down-linear" width={14} />}
            sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
          >
            Resident{selectedResident ? `: ${selectedResident.name}` : ''}
          </Button>
          <Menu anchorEl={residentAnchor} open={Boolean(residentAnchor)} onClose={() => setResidentAnchor(null)}>
            <MenuItem
              selected={!selectedResidentId}
              onClick={() => {
                setSelectedResidentId('');
                setResidentAnchor(null);
                table.onResetPage();
              }}
            >
              All residents
            </MenuItem>
            {taggableResidents.map((resident) => (
              <MenuItem
                key={resident.residentId}
                selected={selectedResidentId === resident.residentId}
                onClick={() => {
                  setSelectedResidentId(resident.residentId);
                  setResidentAnchor(null);
                  table.onResetPage();
                }}
              >
                {resident.roomNumber ? `${resident.name} (Room ${resident.roomNumber})` : resident.name}
              </MenuItem>
            ))}
          </Menu>

          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={(event) => setGroupAnchor(event.currentTarget)}
            endIcon={<Iconify icon="solar:alt-arrow-down-linear" width={14} />}
            sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
          >
            Group{selectedAudienceOption ? `: ${selectedAudienceOption.label}` : ''}
          </Button>
          <Menu anchorEl={groupAnchor} open={Boolean(groupAnchor)} onClose={() => setGroupAnchor(null)}>
            <MenuItem
              selected={!selectedAudience}
              onClick={() => {
                setSelectedAudience('');
                setGroupAnchor(null);
                table.onResetPage();
              }}
            >
              All groups
            </MenuItem>
            {FAMILY_POST_AUDIENCE_OPTIONS.map((option) => (
              <MenuItem
                key={option.value}
                selected={selectedAudience === option.value}
                onClick={() => {
                  setSelectedAudience(option.value);
                  setGroupAnchor(null);
                  table.onResetPage();
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>

          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={(event) => setDateAnchor(event.currentTarget)}
            endIcon={<Iconify icon="solar:alt-arrow-down-linear" width={14} />}
            sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
          >
            {selectedDateOption?.label || 'Last 30 days'}
          </Button>
          <Menu anchorEl={dateAnchor} open={Boolean(dateAnchor)} onClose={() => setDateAnchor(null)}>
            {FAMILY_POST_DATE_OPTIONS.map((option) => (
              <MenuItem
                key={option.label}
                selected={selectedDays === option.value}
                onClick={() => {
                  setSelectedDays(option.value);
                  setDateAnchor(null);
                  table.onResetPage();
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>

          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={(event) => setSortAnchor(event.currentTarget)}
            endIcon={<Iconify icon="solar:alt-arrow-down-linear" width={14} />}
            sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
          >
            {selectedSortOption?.label || 'Newest first'}
          </Button>
          <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}>
            {FAMILY_POST_SORT_OPTIONS.map((option) => (
              <MenuItem
                key={option.value}
                selected={selectedSort === option.value}
                onClick={() => {
                  setSelectedSort(option.value);
                  setSortAnchor(null);
                  table.onResetPage();
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>

          {hasActiveFilters && (
            <Button color="error" size="small" onClick={handleResetFilters} startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}>
              Clear
            </Button>
          )}
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            {!branchId ? (
              <Card sx={{ p: 5, textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {isOwner ? 'Select a site to view posts' : 'No site assigned'}
                </Typography>
              </Card>
            ) : loading && !posts.length ? (
              <LoadingScreen />
            ) : posts.length ? (
              <Stack spacing={2.5}>
                {posts.map((post) => (
                  <CommunityWallPostCard
                    key={getPostId(post)}
                    post={post}
                    onPin={handleTogglePin}
                    onEdit={(item) => {
                      setEditingPost(item);
                      editDialog.onTrue();
                    }}
                    onRemove={(item) => {
                      setDeleteTarget(item);
                      deleteDialog.onTrue();
                    }}
                    onPreviewPhoto={handlePreviewPhoto}
                  />
                ))}
                <Card>
                  <TablePaginationCustom
                    page={table.page}
                    count={totalRecords}
                    dense={table.dense}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                    onChangeDense={table.onChangeDense}
                  />
                </Card>
              </Stack>
            ) : (
              <Card sx={{ p: 5, textAlign: 'center' }}>
                <Iconify icon="solar:letter-unread-bold" width={48} sx={{ color: 'text.disabled', mb: 1.5 }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  {isError ? 'Unable to load posts' : 'No posts found'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {searchQuery
                    ? `No posts matched "${searchQuery}".`
                    : 'No posts in this category yet. Click Create post to share an update.'}
                </Typography>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} lg={4}>
            <CommunityWallSidebar gazette={meta.gazette} attention={meta.attention} activity={meta.activity} />
          </Grid>
        </Grid>

        <NewWallPostDialog
          open={newPostDialog.value}
          onClose={newPostDialog.onFalse}
          organizationId={organizationId}
          branchId={branchId}
        />

        <EditWallPostDialog
          open={editDialog.value}
          onClose={() => {
            editDialog.onFalse();
            setEditingPost(null);
          }}
          post={editingPost}
          organizationId={organizationId}
        />

        <Dialog open={deleteDialog.value} onClose={deleteDialog.onFalse} maxWidth="xs" fullWidth>
          <DialogTitle>Remove wall post</DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Remove this post from the Community Wall? This cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" color="inherit" onClick={deleteDialog.onFalse}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleConfirmDelete}>
              Remove post
            </Button>
          </DialogActions>
        </Dialog>

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
