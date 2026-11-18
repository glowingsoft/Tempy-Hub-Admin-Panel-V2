import PropTypes from 'prop-types';
import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { fDateTime } from 'src/utils/format-time';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { TableNoData, TableHeadCustom, TableBodySkeleton, TablePaginationCustom, useTable } from 'src/components/table';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { getUserBranchId } from 'src/utils/organization';
import { ALL_BRANCHES_VALUE, OwnerBranchSelect } from 'src/sections/branch/owner-branch-select';
import {
  useGetAnnouncementsQuery,
  useGetStaffAnnouncementsQuery,
} from 'src/store/Reducer/announcements-api';

import { AnnouncementTableRow } from '../announcement-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 50 },
  { id: 'createdBy', label: 'Created by', minWidth: 180 },
  { id: 'branch', label: 'Site', minWidth: 140 },
  { id: 'category', label: 'Category', minWidth: 140 },
  { id: 'subject', label: 'Announcement', minWidth: 260 },
  { id: 'createdAt', label: 'Date', minWidth: 160 },
  { id: 'actions', label: 'Actions', width: 90, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.search({
    placeholder: 'Search announcements...',
  }),
];

// ----------------------------------------------------------------------

export function AnnouncementListView({
  rootPath,
  ownerDashboard = false,
  staffDashboard = false,
}) {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const router = useRouter();

  const [selectedBranchId, setSelectedBranchId] = useState(ALL_BRANCHES_VALUE);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const { organizationId, user } = useCurrentOrganization();

  const userAssignedBranchId = useMemo(
    () => getUserBranchId(user, organizationId) || user?.branchId || (typeof user?.branch === 'object' ? user?.branch?._id : user?.branch) || null,
    [user, organizationId]
  );

  const queryBranchId = useMemo(() => {
    if (ownerDashboard) {
      return selectedBranchId !== ALL_BRANCHES_VALUE ? selectedBranchId : undefined;
    }
    return userAssignedBranchId || undefined;
  }, [ownerDashboard, selectedBranchId, userAssignedBranchId]);

  const filters = useSetState({
    search: '',
  });

  const debouncedSearch = useDebounce(filters.state.search, 300);

  const adminQuery = useGetAnnouncementsQuery(
    {
      page: table.page + 1,
      limit: table.rowsPerPage,
      branchId: queryBranchId,
      keyword: debouncedSearch,
      organizationId,
    },
    {
      skip: !organizationId || staffDashboard,
    }
  );

  const staffQuery = useGetStaffAnnouncementsQuery(
    {
      page: table.page + 1,
      limit: table.rowsPerPage,
      keyword: debouncedSearch,
      organizationId,
    },
    {
      skip: !organizationId || !staffDashboard,
    }
  );

  const { data, isLoading, isFetching, error } = staffDashboard ? staffQuery : adminQuery;

  const announcementsList = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  const totalRecords = data?.meta?.totalRecords ?? announcementsList.length;

  const resolvedRootPath =
    rootPath ||
    (staffDashboard
      ? paths.staff.dashboard
      : ownerDashboard
        ? paths.owner.root
        : paths.siteManager.root);
  const newAnnouncementHref = ownerDashboard ? paths.owner.announcements.new : paths.siteManager.announcements.new;

  const handleBranchChange = useCallback(
    (nextBranchId) => {
      setSelectedBranchId(nextBranchId);
      table.onResetPage();
    },
    [table]
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      table.onResetPage();
      filters.setState({ [key]: value });
    },
    [filters, table]
  );

  const handleSearchChange = useCallback(
    (event) => {
      table.onResetPage();
      filters.setState({ search: event.target.value });
    },
    [filters, table]
  );

  const handleViewRow = useCallback(
    (row) => {
      const rowId = row._id || row.id;
      if (staffDashboard && rowId) {
        router.push(paths.staff.announcementDetail(rowId));
      } else {
        setSelectedAnnouncement(row);
      }
    },
    [staffDashboard, router]
  );

  const loading = isLoading || isFetching;
  const notFound = !loading && !announcementsList.length;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Announcements"
        links={[{ name: 'Dashboard', href: resolvedRootPath }, { name: 'Announcements' }]}
        action={
          !staffDashboard ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
              {ownerDashboard && <OwnerBranchSelect value={selectedBranchId} onChange={handleBranchChange} />}
              <Button component={RouterLink} href={newAnnouncementHref} variant="contained" color="primary" startIcon={<Iconify icon="mingcute:add-line" />}>
                Add announcement
              </Button>
            </Stack>
          ) : null
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error?.data?.message || error?.message || 'Failed to load announcements.'}
        </Alert>
      )}

      <Card>
        <FlexibleTableToolbar filterFields={FILTER_FIELDS} filterValues={filters.state} onFilterChange={handleFilterChange} onSearchChange={handleSearchChange} />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 980 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} rowCount={announcementsList.length} />

              <TableBody>
                {loading ? (
                  <TableBodySkeleton rowCount={table.rowsPerPage} cellCount={TABLE_HEAD.length} dense={table.dense} />
                ) : (
                  <>
                    {announcementsList.map((row, index) => {
                      const branchName =
                        row.branchName ||
                        (typeof row.branch === 'object' ? row.branch?.name : row.branch) ||
                        row.site ||
                        '—';

                      return (
                        <AnnouncementTableRow
                          key={row._id || row.id || index}
                          row={row}
                          serialNumber={table.page * table.rowsPerPage + index + 1}
                          branchName={branchName}
                          onView={handleViewRow}
                        />
                      );
                    })}

                    <TableNoData notFound={notFound} />
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={totalRecords}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      {/* Announcement Details Dialog */}
      {selectedAnnouncement && (
        <Dialog
          open={Boolean(selectedAnnouncement)}
          onClose={() => setSelectedAnnouncement(null)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {selectedAnnouncement.subject || selectedAnnouncement.title || 'Announcement Details'}
            </Typography>
            <IconButton onClick={() => setSelectedAnnouncement(null)} size="small">
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                {selectedAnnouncement.category && (
                  <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {selectedAnnouncement.category}
                  </Typography>
                )}
                {(selectedAnnouncement.createdAt || selectedAnnouncement.date) && (
                  <Typography variant="caption" color="text.secondary">
                    Published: {fDateTime(selectedAnnouncement.createdAt || selectedAnnouncement.date)}
                  </Typography>
                )}
                {(selectedAnnouncement.branchName || selectedAnnouncement.branch?.name) && (
                  <Typography variant="caption" color="text.secondary">
                    Site: {selectedAnnouncement.branchName || selectedAnnouncement.branch?.name}
                  </Typography>
                )}
              </Stack>
              <Divider />
              <Box
                sx={{
                  typography: 'body1',
                  '& p': { mb: 1.5 },
                  '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
                }}
                dangerouslySetInnerHTML={{
                  __html: selectedAnnouncement.description || selectedAnnouncement.content || 'No description provided.',
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setSelectedAnnouncement(null)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </DashboardContent>
  );
}

AnnouncementListView.propTypes = {
  rootPath: PropTypes.string,
  ownerDashboard: PropTypes.bool,
  staffDashboard: PropTypes.bool,
};
