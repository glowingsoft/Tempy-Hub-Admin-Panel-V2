import { useCallback, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/config-global';
import { useSetState } from 'src/hooks/use-set-state';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { UserTableFiltersResult } from 'src/sections/user/user-table-filters-result';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';

import {
  mockFamilyGroupsData,
  FAMILY_GROUP_STATUS_OPTIONS,
} from '../mocks/data';
import { FamilyGroupTableRow } from '../family-group-table-row';
import { FamilyGroupManageDialog } from '../family-group-manage-dialog';

// ----------------------------------------------------------------------

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 60 },
  { id: 'resident', label: 'Resident', width: '28%', minWidth: 200 },
  { id: 'nextOfKin', label: 'Next of kin', width: '24%', minWidth: 180 },
  { id: 'members', label: 'Members', align: 'center', width: '12%', minWidth: 100 },
  { id: 'status', label: 'Status', align: 'center', width: '16%', minWidth: 140 },
  { id: 'actions', label: 'Actions', align: 'center', width: '20%', minWidth: 120 },
];

const FILTER_FIELDS = [
  createFilterField.status({
    key: 'status',
    label: 'Family groups',
    options: FAMILY_GROUP_STATUS_OPTIONS,
    showCounts: true,
  }),
  createFilterField.search({
    placeholder: 'Search resident, next of kin, or room...',
  }),
];

const getStatusColor = (currentStatus) => {
  switch (currentStatus) {
    case 'active':
      return 'success';
    case 'invite_pending':
      return 'warning';
    case 'no_family':
      return 'error';
    default:
      return 'default';
  }
};

// ----------------------------------------------------------------------
// Reusable Detail View Components (matching staff & family detail layout)
// ----------------------------------------------------------------------

function DetailCard({ title, children }) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6">{title}</Typography>
      <Divider sx={{ my: 2 }} />
      <Box
        sx={{
          display: 'grid',
          rowGap: 2.5,
          columnGap: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
        }}
      >
        {children}
      </Box>
    </Card>
  );
}

function DetailItem({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function FamilyGroupView() {
  const table = useTable();
  const theme = useTheme();
  const familyPaths = useFamilyEngagementPaths();

  const [tableData, setTableData] = useState(() => [...mockFamilyGroupsData.residents]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [manageGroup, setManageGroup] = useState(null);

  // Filters using useSetState
  const filters = useSetState({
    name: '',
    status: 'all',
  });

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((f) => f.type === 'status'),
    []
  );

  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((f) => f.type !== 'status'),
    []
  );

  const handleSearchChange = useCallback(
    (event) => {
      table.onResetPage();
      filters.setState({ name: event.target.value });
    },
    [filters, table]
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      table.onResetPage();
      filters.setState({ [key]: value });
    },
    [filters, table]
  );

  const handleResetFilters = useCallback(() => {
    table.onResetPage();
    filters.setState({ name: '', status: 'all' });
  }, [filters, table]);

  const getStatusCount = useCallback(
    (statusValue) => {
      if (statusValue === 'all') return tableData.length;
      return tableData.filter((item) => item.status === statusValue).length;
    },
    [tableData]
  );

  // Summary counts
  const summaryCounts = useMemo(() => {
    const active = tableData.filter((r) => r.status === 'active').length;
    const pending = tableData.filter((r) => r.status === 'invite_pending').length;
    const noFamily = tableData.filter((r) => r.status === 'no_family').length;
    return {
      all: tableData.length,
      active,
      pending,
      noFamily,
    };
  }, [tableData]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    const search = filters.state.name.trim().toLowerCase();
    const status = filters.state.status;

    return tableData.filter((item) => {
      if (status !== 'all' && item.status !== status) {
        return false;
      }
      if (search) {
        const residentName = (item.resident || item.name || '').toLowerCase();
        const nokMatch = (item.nextOfKin || '').toLowerCase().includes(search);
        const roomMatch = (item.room || item.roomNumber || '').toString().toLowerCase().includes(search);
        const residentMatch = residentName.includes(search);
        if (!residentMatch && !nokMatch && !roomMatch) {
          return false;
        }
      }
      return true;
    });
  }, [tableData, filters.state]);

  const dataInPage = useMemo(() => {
    const start = table.page * table.rowsPerPage;
    return filteredRows.slice(start, start + table.rowsPerPage);
  }, [filteredRows, table.page, table.rowsPerPage]);

  const canReset = filters.state.name !== '' || filters.state.status !== 'all';
  const notFound = !filteredRows.length && canReset;

  // Manage modal update handler
  const handleUpdateGroup = useCallback((updatedGroup) => {
    setTableData((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
    setSelectedGroup((current) =>
      current && current.id === updatedGroup.id ? updatedGroup : current
    );
    setManageGroup(updatedGroup);
  }, []);

  const handleOpenManage = useCallback((group) => {
    setManageGroup(group);
  }, []);

  const handleCloseManage = useCallback(() => {
    setManageGroup(null);
  }, []);

  // ----------------------------------------------------------------------
  // RENDER DETAIL VIEW (When a row or view icon is clicked)
  // ----------------------------------------------------------------------
  if (selectedGroup) {
    const groupMembers = selectedGroup.membersList || [];

    return (
      <>
        <Helmet>
          <title>{`${selectedGroup.resident} - Family Group | ${CONFIG.site.name}`}</title>
        </Helmet>

        <DashboardContent maxWidth="xl">
          <Box sx={{ mb: 2 }}>
            <Button
              onClick={() => setSelectedGroup(null)}
              startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            >
              Back to list
            </Button>
          </Box>

          <CustomBreadcrumbs
            heading={selectedGroup.resident}
            links={[
              { name: 'Dashboard', href: familyPaths.dashboardRoot },
              { name: 'Family Engagement', href: familyPaths.familyOverview },
              {
                name: 'Family Groups',
                href: '#',
                onClick: (e) => {
                  e.preventDefault();
                  setSelectedGroup(null);
                },
              },
              { name: selectedGroup.resident },
            ]}
            action={
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:users-group-rounded-bold" />}
                onClick={() => handleOpenManage(selectedGroup)}
              >
                Manage Members
              </Button>
            }
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Stack spacing={3}>
            {/* Resident details */}
            <DetailCard title="Resident details">
              <DetailItem label="Resident name" value={selectedGroup.resident} />
              <DetailItem
                label="Room number"
                value={`Room ${selectedGroup.room || selectedGroup.roomNumber || '—'}`}
              />
              <DetailItem
                label="Care site / Branch"
                value={selectedGroup.branch || 'Florence House'}
              />
              <DetailItem
                label="Family group status"
                value={
                  <Label variant="soft" color={getStatusColor(selectedGroup.status)}>
                    {selectedGroup.statusLabel}
                  </Label>
                }
              />
            </DetailCard>

            {/* Next of kin details */}
            <DetailCard title="Primary next of kin">
              <DetailItem
                label="Full name"
                value={selectedGroup.nextOfKin || 'No next of kin designated'}
              />
              <DetailItem
                label="Relationship to resident"
                value={selectedGroup.nextOfKinRelationship || '—'}
              />
              <DetailItem
                label="Email address"
                value={selectedGroup.nextOfKinEmail || '—'}
              />
              <DetailItem
                label="Phone number"
                value={selectedGroup.nextOfKinPhone || '—'}
              />
            </DetailCard>

            {/* Family Members Card */}
            <Card sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Family Members ({groupMembers.length})
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="solar:user-plus-bold" />}
                  onClick={() => handleOpenManage(selectedGroup)}
                >
                  Add Member
                </Button>
              </Stack>
              <Divider sx={{ mb: 2.5 }} />

              {groupMembers.length === 0 ? (
                <Box
                  sx={{
                    py: 5,
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.grey[500], 0.04),
                    borderRadius: 1.5,
                    border: `1px dashed ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    No family members linked
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    This resident does not have any active family contacts or portal users yet.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Iconify icon="solar:user-plus-bold" />}
                    onClick={() => handleOpenManage(selectedGroup)}
                  >
                    Add First Member
                  </Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell>Member Name</TableCell>
                        <TableCell>Relationship</TableCell>
                        <TableCell>Portal Role</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupMembers.map((member) => (
                        <TableRow key={member.id} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: member.isNok
                                    ? alpha(theme.palette.primary.main, 0.15)
                                    : alpha(theme.palette.grey[500], 0.15),
                                  color: member.isNok ? 'primary.main' : 'text.primary',
                                  fontWeight: 600,
                                }}
                              >
                                {member.name.charAt(0)}
                              </Avatar>
                              <Stack spacing={0.25}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {member.name}
                                  </Typography>
                                  {member.isNok && (
                                    <Chip
                                      size="small"
                                      label="NOK"
                                      color="primary"
                                      variant="soft"
                                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                                    />
                                  )}
                                </Stack>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {member.email}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">{member.relation}</Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">{member.role || 'Member'}</Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">{member.phone || '—'}</Typography>
                          </TableCell>

                          <TableCell align="center">
                            <Label
                              variant="soft"
                              color={member.status?.toLowerCase() === 'active' ? 'success' : 'warning'}
                            >
                              {member.status || 'Active'}
                            </Label>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>

            {/* Group summary card */}
            <DetailCard title="Group summary">
              <DetailItem label="Total linked members" value={selectedGroup.members || 0} />
              <DetailItem
                label="Active portal users"
                value={groupMembers.filter((m) => m.status?.toLowerCase() === 'active').length}
              />
              <DetailItem
                label="Pending invites"
                value={groupMembers.filter((m) => m.status?.toLowerCase().includes('pending')).length}
              />
              <DetailItem label="Group ID" value={selectedGroup.id} />
            </DetailCard>
          </Stack>

          {/* Manage Modal */}
          <FamilyGroupManageDialog
            open={Boolean(manageGroup)}
            onClose={handleCloseManage}
            group={manageGroup}
            onUpdateGroup={handleUpdateGroup}
          />
        </DashboardContent>
      </>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER LIST VIEW (Table with KPI summary cards)
  // ----------------------------------------------------------------------
  return (
    <>
      <Helmet>
        <title>{`Family Groups | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent maxWidth="xl">
        {/* Custom Header & Breadcrumbs */}
        <CustomBreadcrumbs
          heading="Family Groups"
          links={[
            { name: 'Dashboard', href: familyPaths.dashboardRoot },
            { name: 'Family Engagement', href: familyPaths.familyOverview },
            { name: 'Family Groups' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:users-group-rounded-bold" />}
              onClick={() => {
                if (tableData[0]) handleOpenManage(tableData[0]);
              }}
            >
              Manage Family Group
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* Top Summary KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="Total Family Groups"
              total={summaryCounts.all}
              color="primary"
              icon={icon('ic-users')}
              sx={{
                border: (t) => `1px solid ${t.palette.divider}`,
                cursor: 'default',
                userSelect: 'none',
              }}
            />
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="Active Groups"
              total={summaryCounts.active}
              color="success"
              icon={icon('ic-user')}
              sx={{
                border: (t) => `1px solid ${t.palette.divider}`,
                cursor: 'default',
                userSelect: 'none',
              }}
            />
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="Invite Pending"
              total={summaryCounts.pending}
              color="warning"
              icon={icon('ic-mail')}
              sx={{
                border: (t) => `1px solid ${t.palette.divider}`,
                cursor: 'default',
                userSelect: 'none',
              }}
            />
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="No Family Linked"
              total={summaryCounts.noFamily}
              color="error"
              icon={icon('ic-disabled')}
              sx={{
                border: (t) => `1px solid ${t.palette.divider}`,
                cursor: 'default',
                userSelect: 'none',
              }}
            />
          </Grid>
        </Grid>

        {/* Table in Card Container */}
        <Card sx={{ mb: 4 }}>
          {/* Status Tabs Filter for Family Groups */}
          <StatusTabsFilterWrapper
            filterField={statusFilterField}
            value={filters.state.status}
            onChange={handleFilterChange}
            getCount={getStatusCount}
          />

          {/* Flexible Toolbar with Search */}
          <FlexibleTableToolbar
            filterFields={toolbarFilterFields}
            filterValues={filters.state}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
          />

          {/* Active Filters Result Bar */}
          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              totalResults={filteredRows.length}
              onResetPage={handleResetFilters}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          {/* Table Container */}
          <TableContainer>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {dataInPage.map((row, index) => (
                    <FamilyGroupTableRow
                      key={row.id}
                      row={row}
                      serialNumber={table.page * table.rowsPerPage + index + 1}
                      isSelected={selectedGroup?.id === row.id}
                      onSelectRow={(item) => setSelectedGroup(item)}
                      onView={(item) => setSelectedGroup(item)}
                      onManage={(item) => handleOpenManage(item)}
                    />
                  ))}

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>

            <TablePaginationCustom
              page={table.page}
              count={filteredRows.length}
              dense={table.dense}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              onChangeDense={table.onChangeDense}
            />
          </TableContainer>
        </Card>

        {/* Manage Modal */}
        <FamilyGroupManageDialog
          open={Boolean(manageGroup)}
          onClose={handleCloseManage}
          group={manageGroup}
          onUpdateGroup={handleUpdateGroup}
        />
      </DashboardContent>
    </>
  );
}

export default FamilyGroupView;