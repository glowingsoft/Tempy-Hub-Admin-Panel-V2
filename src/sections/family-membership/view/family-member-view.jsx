import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';

import { useParams, useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { fDate, fDateTime } from 'src/utils/format-time';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';

import {
  FAMILY_MEMBER_STATUS_OPTIONS,
  getFamilyMemberStatusMeta,
  getFamilyRoleLabel,
  getMockFamilyMemberById,
  mockFamilyMembers,
} from '../mocks/data';
import { useFamilyMemberActions } from '../use-family-membership-actions';
import { FamilyMemberActionDialog } from '../family-membership-action-dialog';
import { FamilyMemberTableRow } from '../family-membership-table-row';
import { FamilyMembershipNewEditForm } from '../family-membership-new-edit-form';

// ----------------------------------------------------------------------
// Reusable Detail Layout Components (exact match to staff detail pages)
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
// 1. MEMBER LIST VIEW
// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  ...FAMILY_MEMBER_STATUS_OPTIONS,
];

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: '5%' },
  { id: 'name', label: 'Family Member', width: '21%' },
  { id: 'relationship', label: 'Relationship', width: '14%' },
  { id: 'resident', label: 'Resident', width: '19%' },
  { id: 'role', label: 'Role', width: '12%' },
  { id: 'status', label: 'Status', width: '10%', align: 'center' },
  { id: 'createdAt', label: 'Joined At', width: '11%' },
  { id: 'actions', label: 'Actions', width: '8%', align: 'center', sx: { pr: 3 } },
];

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search family member, email, or resident...' }),
];

export function FamilyMemberListView() {
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });
  const familyPaths = useFamilyEngagementPaths();

  const [tableData, setTableData] = useState(() => [...mockFamilyMembers]);

  const filters = useSetState({
    search: '',
    status: 'all',
  });

  const debouncedSearch = useDebounce(filters.state.search, 300);

  const handleChanged = useCallback((updatedItem) => {
    if (!updatedItem) {
      setTableData([...mockFamilyMembers]);
    } else {
      setTableData((prev) =>
        prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
      );
    }
  }, []);

  const { askDeactivate, askDelete, confirmProps } = useFamilyMemberActions({
    onChanged: handleChanged,
  });

  const counts = useMemo(
    () => ({
      all: tableData.length,
      active: tableData.filter((i) => i.status === 'active').length,
      inactive: tableData.filter((i) => i.status === 'inactive').length,
    }),
    [tableData]
  );

  const filteredData = useMemo(() => {
    let list = [...tableData];
    if (filters.state.status !== 'all') {
      list = list.filter((i) => i.status === filters.state.status);
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.email?.toLowerCase().includes(q) ||
          i.residentName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tableData, filters.state.status, debouncedSearch]);

  const notFound = !filteredData.length;

  const handleFilterChange = useCallback(
    (field, value) => {
      filters.setState({ [field]: value });
      table.onResetPage();
    },
    [filters, table]
  );

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Members"
        links={[
          { name: 'Dashboard', href: familyPaths.dashboardRoot },
          { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.dashboardRoot },
          { name: 'Memberships', href: familyPaths.familyMemberships?.members?.root },
          { name: 'Members' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <StatusTabsFilterWrapper
          options={STATUS_OPTIONS}
          value={filters.state.status}
          onChange={(val) => handleFilterChange('status', val)}
          counts={counts}
        />

        <FlexibleTableToolbar
          filters={filters.state}
          filterFields={FILTER_FIELDS}
          onFilterChange={handleFilterChange}
          onResetFilter={() => {
            filters.resetState();
            table.onResetPage();
          }}
          isFiltered={filters.state.status !== 'all' || Boolean(filters.state.search)}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table
              size={table.dense ? 'small' : 'medium'}
              sx={{ width: '100%' }}
            >
              <TableHeadCustom
                headLabel={TABLE_HEAD}
              />

              <TableBody>
                {filteredData
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row, idx) => (
                    <FamilyMemberTableRow
                      key={row._id}
                      row={row}
                      serialNumber={table.page * table.rowsPerPage + idx + 1}
                      onDeactivate={askDeactivate}
                      onDelete={askDelete}
                      detailPath={familyPaths.familyMemberships?.members?.detail(row._id) || '#'}
                      editPath={familyPaths.familyMemberships?.members?.edit(row._id) || '#'}
                    />
                  ))}

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          count={filteredData.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>

      <FamilyMemberActionDialog {...confirmProps} />
    </Box>
  );
}

// ----------------------------------------------------------------------
// 2. MEMBER DETAIL VIEW (Exact match to staff member-detail-view)
// ----------------------------------------------------------------------

export function FamilyMemberDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();

  const [reloadKey, setReloadKey] = useState(0);

  const listPath = familyPaths.familyMemberships?.members?.root || familyPaths.familyOverview;

  const handleChanged = useCallback(
    (item) => {
      if (item === null) {
        router.push(listPath);
        return;
      }
      setReloadKey((key) => key + 1);
    },
    [router, listPath]
  );

  const { askDeactivate, askDelete, confirmProps } = useFamilyMemberActions({
    onChanged: handleChanged,
  });

  const member = useMemo(() => getMockFamilyMemberById(id), [id, reloadKey]);

  if (!member) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(listPath)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Family member not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  const status = getFamilyMemberStatusMeta(member.status);
  const isActive = member.status === 'active';
  const editPath = familyPaths.familyMemberships?.members?.edit(member._id) || '#';

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={member.name}
        links={[
          { name: 'Dashboard', href: familyPaths.dashboardRoot },
          { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.dashboardRoot },
          { name: 'Members', href: listPath },
          { name: member.name },
        ]}
        action={
          <Stack direction="row" spacing={1.5}>
            {isActive ? (
              <Button
                color="error"
                variant="outlined"
                onClick={() => askDeactivate(member)}
                startIcon={<Iconify icon="solar:user-block-bold" />}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                color="success"
                variant="outlined"
                onClick={() => askDeactivate(member)}
                startIcon={<Iconify icon="solar:user-check-bold" />}
              >
                Reactivate
              </Button>
            )}

            <Button
              color="error"
              variant="outlined"
              onClick={() => askDelete(member)}
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            >
              Delete
            </Button>

            <Button
              component={RouterLink}
              href={editPath}
              variant="contained"
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Edit
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <DetailCard title="Member details">
          <DetailItem label="Name" value={member.name} />
          <DetailItem label="Email" value={member.email} />
          <DetailItem label="Role" value={getFamilyRoleLabel(member.role)} />
          <DetailItem
            label="Status"
            value={
              <Label variant="soft" color={status.color}>
                {status.label}
              </Label>
            }
          />
          <DetailItem label="Phone" value={member.phone || '—'} />
          <DetailItem label="Relationship" value={member.relationship || '—'} />
          <DetailItem label="Next of kin" value={member.isNok ? 'Yes (Primary)' : 'No'} />
          <DetailItem label="Start date" value={fDate(member.createdAt)} />
        </DetailCard>

        <DetailCard title="Linked resident">
          <DetailItem label="Resident name" value={member.residentName || '—'} />
          <DetailItem label="Room" value={member.room ? `Room ${member.room}` : '—'} />
          <DetailItem label="Care site / Branch" value={member.branch || '—'} />
        </DetailCard>

        <DetailCard title="Membership">
          <DetailItem
            label="Status"
            value={
              <Label variant="soft" color={status.color}>
                {status.label}
              </Label>
            }
          />
          <DetailItem label="Last active at" value={fDateTime(member.lastActiveAt)} />
          <DetailItem label="Deactivated at" value={fDateTime(member.deactivatedAt)} />
          <DetailItem label="Created at" value={fDateTime(member.createdAt)} />
          <DetailItem label="Updated at" value={fDateTime(member.updatedAt)} />
        </DetailCard>
      </Stack>

      <FamilyMemberActionDialog {...confirmProps} />
    </Box>
  );
}

// ----------------------------------------------------------------------
// 3. MEMBER EDIT VIEW (Full-width form)
// ----------------------------------------------------------------------

export function FamilyMemberEditView() {
  const { id } = useParams();
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();

  const member = useMemo(() => getMockFamilyMemberById(id), [id]);
  const listPath = familyPaths.familyMemberships?.members?.root || familyPaths.familyOverview;

  if (!member) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(listPath)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Family member not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={member.name}
        links={[
          { name: 'Dashboard', href: familyPaths.dashboardRoot },
          { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.dashboardRoot },
          { name: 'Members', href: listPath },
          { name: member.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FamilyMembershipNewEditForm currentMembership={member} isMember />
    </Box>
  );
}