import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
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
  FAMILY_INVITATION_STATUS_OPTIONS,
  getFamilyInvitationStatusMeta,
  getFamilyRoleLabel,
  getMockFamilyInvitationById,
  mockFamilyInvitations,
} from '../mocks/data';
import { useFamilyMembershipActions } from '../use-family-membership-actions';
import { FamilyMembershipActionDialog } from '../family-membership-action-dialog';
import { FamilyMembershipTableRow } from '../family-membership-table-row';
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
// 1. INVITATIONS LIST VIEW
// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  ...FAMILY_INVITATION_STATUS_OPTIONS,
];

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: '5%' },
  { id: 'name', label: 'Invited Member', width: '21%' },
  { id: 'relationship', label: 'Relationship', width: '14%' },
  { id: 'resident', label: 'Resident', width: '19%' },
  { id: 'role', label: 'Role', width: '12%' },
  { id: 'status', label: 'Status', width: '10%', align: 'center' },
  { id: 'createdAt', label: 'Started At', width: '11%' },
  { id: 'actions', label: 'Actions', width: '8%', align: 'center', sx: { pr: 3 } },
];

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search name, email, or resident...' }),
];

export function FamilyInvitationListView() {
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();

  const [tableData, setTableData] = useState(() => [...mockFamilyInvitations]);

  const filters = useSetState({
    search: '',
    status: 'all',
  });

  const debouncedSearch = useDebounce(filters.state.search, 300);

  const handleChanged = useCallback((updatedItem) => {
    if (!updatedItem) {
      setTableData([...mockFamilyInvitations]);
    } else {
      setTableData((prev) =>
        prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
      );
    }
  }, []);

  const { resend, askRevoke, askDelete, confirmProps } = useFamilyMembershipActions({
    onChanged: handleChanged,
  });

  const counts = useMemo(
    () => ({
      all: tableData.length,
      pending: tableData.filter((i) => i.status === 'pending').length,
      accepted: tableData.filter((i) => i.status === 'accepted').length,
      revoked: tableData.filter((i) => i.status === 'revoked').length,
      expired: tableData.filter((i) => i.status === 'expired').length,
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

  const newPath = familyPaths.familyMemberships?.invitations?.new || '#';

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Invitations"
        links={[
          { name: 'Dashboard', href: familyPaths.dashboardRoot },
          { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.dashboardRoot },
          { name: 'Memberships', href: familyPaths.familyMemberships?.invitations?.root },
          { name: 'Invitations' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={newPath}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Invite Family Member
          </Button>
        }
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
                    <FamilyMembershipTableRow
                      key={row._id}
                      row={row}
                      serialNumber={table.page * table.rowsPerPage + idx + 1}
                      onResend={resend}
                      onRevoke={askRevoke}
                      onDelete={askDelete}
                      detailPath={familyPaths.familyMemberships?.invitations?.detail(row._id) || '#'}
                      editPath={familyPaths.familyMemberships?.invitations?.edit(row._id) || '#'}
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

      <FamilyMembershipActionDialog {...confirmProps} />
    </Box>
  );
}

// ----------------------------------------------------------------------
// 2. INVITATION DETAIL VIEW (Exact match to staff membership-detail-view)
// ----------------------------------------------------------------------

export function FamilyInvitationDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();

  const [reloadKey, setReloadKey] = useState(0);

  const listPath = familyPaths.familyMemberships?.invitations?.root || familyPaths.familyOverview;

  const handleChanged = useCallback(
    (invitation) => {
      if (invitation === null) {
        router.push(listPath);
        return;
      }
      setReloadKey((key) => key + 1);
    },
    [router, listPath]
  );

  const { resend, askRevoke, askDelete, confirmProps } = useFamilyMembershipActions({
    onChanged: handleChanged,
  });

  const invitation = useMemo(() => getMockFamilyInvitationById(id), [id, reloadKey]);

  if (!invitation) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(listPath)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Invitation not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  const status = getFamilyInvitationStatusMeta(invitation.status);
  const isPending = invitation.status === 'pending';
  const isRevoked = invitation.status === 'revoked';
  const editPath = familyPaths.familyMemberships?.invitations?.edit(invitation._id) || '#';

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={invitation.name}
        links={[
          { name: 'Dashboard', href: familyPaths.dashboardRoot },
          { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.dashboardRoot },
          { name: 'Invitations', href: listPath },
          { name: invitation.name },
        ]}
        action={
          <Stack direction="row" spacing={1.5}>
            {isPending && (
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => resend(invitation)}
                startIcon={<Iconify icon="solar:refresh-bold" />}
              >
                Resend
              </Button>
            )}

            {isPending && (
              <Button
                color="error"
                variant="outlined"
                onClick={() => askRevoke(invitation)}
                startIcon={<Iconify icon="solar:close-circle-bold" />}
              >
                Revoke
              </Button>
            )}

            {isRevoked ? (
              <Button
                color="error"
                variant="contained"
                onClick={() => askDelete(invitation)}
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              >
                Delete
              </Button>
            ) : (
              <Button
                component={RouterLink}
                href={editPath}
                variant="contained"
                startIcon={<Iconify icon="solar:pen-bold" />}
              >
                Edit
              </Button>
            )}
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <DetailCard title="Member details">
          <DetailItem label="Name" value={invitation.name} />
          <DetailItem label="Email" value={invitation.email} />
          <DetailItem label="Role" value={getFamilyRoleLabel(invitation.role)} />
          <DetailItem
            label="Status"
            value={
              <Label variant="soft" color={status.color}>
                {status.label}
              </Label>
            }
          />
          <DetailItem label="Phone" value={invitation.phone || '—'} />
          <DetailItem label="Relationship" value={invitation.relationship || '—'} />
          <DetailItem label="Next of kin" value={invitation.isNok ? 'Yes (Primary)' : 'No'} />
          <DetailItem label="Start date" value={fDate(invitation.createdAt)} />
        </DetailCard>

        <DetailCard title="Linked resident">
          <DetailItem label="Resident name" value={invitation.residentName || '—'} />
          <DetailItem label="Room" value={invitation.room ? `Room ${invitation.room}` : '—'} />
          <DetailItem label="Care site / Branch" value={invitation.branch || '—'} />
        </DetailCard>

        <DetailCard title="Invitation">
          <DetailItem label="Expires at" value={fDateTime(invitation.expiresAt)} />
          <DetailItem label="Last sent at" value={fDateTime(invitation.lastSentAt)} />
          <DetailItem label="Send count" value={invitation.sendCount ?? 1} />
          <DetailItem label="Accepted at" value={fDateTime(invitation.acceptedAt)} />
          <DetailItem label="Revoked at" value={fDateTime(invitation.revokedAt)} />
          <DetailItem
            label="Accept link"
            value={
              invitation.acceptUrl ? (
                <Link
                  href={invitation.acceptUrl}
                  target="_blank"
                  rel="noopener"
                  sx={{ wordBreak: 'break-all' }}
                >
                  {invitation.acceptUrl}
                </Link>
              ) : (
                '—'
              )
            }
          />
          <DetailItem label="Created at" value={fDateTime(invitation.createdAt)} />
          <DetailItem label="Updated at" value={fDateTime(invitation.updatedAt)} />
        </DetailCard>
      </Stack>

      <FamilyMembershipActionDialog {...confirmProps} />
    </Box>
  );
}

// ----------------------------------------------------------------------
// 3. INVITATION CREATE VIEW (Full-width form)
// ----------------------------------------------------------------------

export function FamilyInvitationCreateView() {
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();
  const listPath = familyPaths.familyMemberships?.invitations?.root || familyPaths.familyOverview;

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading="New Family Invitation"
        links={[
          { name: 'Dashboard', href: familyPaths.dashboardRoot },
          { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.dashboardRoot },
          { name: 'Invitations', href: listPath },
          { name: 'New Invitation' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FamilyMembershipNewEditForm />
    </Box>
  );
}

// ----------------------------------------------------------------------
// 4. INVITATION EDIT VIEW (Full-width form)
// ----------------------------------------------------------------------

export function FamilyInvitationEditView() {
  const { id } = useParams();
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();

  const invitation = useMemo(() => getMockFamilyInvitationById(id), [id]);
  const listPath = familyPaths.familyMemberships?.invitations?.root || familyPaths.familyOverview;

  if (!invitation) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(listPath)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Invitation not found" sx={{ py: 10 }} />
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
        heading={invitation.name}
        links={[
          { name: 'Dashboard', href: familyPaths.dashboardRoot },
          { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.dashboardRoot },
          { name: 'Invitations', href: listPath },
          { name: invitation.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FamilyMembershipNewEditForm currentMembership={invitation} />
    </Box>
  );
}