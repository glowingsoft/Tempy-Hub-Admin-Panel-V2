import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useCanManageKiosk } from 'src/auth/hooks';
import { toast } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData, TableBodySkeleton } from 'src/components/table';
import { useBoolean } from 'src/hooks/use-boolean';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { useParams, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { DataUsageSummaryCard } from 'src/sections/data-usage/data-usage-summary-card';
import { useGetKioskByIdQuery, useToggleKioskLockMutation } from 'src/store/Reducer/kiosks-api';
import { fDateTime } from 'src/utils/format-time';

import { isKioskLocked } from '../kiosk-lock-utils';
import QuickAddKioskModal from '../quick-add-kiosk-modal';

// ----------------------------------------------------------------------

const VISIT_TABLE_HEAD = [
  { id: 'visitor', label: 'Visitor Name', minWidth: 180 },
  { id: 'personType', label: 'Person Type', width: 140 },
  { id: 'method', label: 'Method', width: 130 },
  { id: 'purpose', label: 'Purpose', minWidth: 160 },
  { id: 'arrivedAt', label: 'Arrival Time', minWidth: 160 },
  { id: 'checkInAt', label: 'Check-In', minWidth: 160 },
  { id: 'checkOutAt', label: 'Check-Out', minWidth: 160 },
  { id: 'status', label: 'Status', align: 'center', width: 130 },
];

function DetailRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.25 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box textAlign="right">
        {typeof value === 'string' || typeof value === 'number' ? (
          <Typography variant="subtitle2" fontWeight={600}>
            {value}
          </Typography>
        ) : (
          value || '—'
        )}
      </Box>
    </Stack>
  );
}

DetailRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

// ----------------------------------------------------------------------

export function KioskDetailView({ ownerDashboard = false }) {
  const canManageKiosk = useCanManageKiosk();
  const { id } = useParams();
  const router = useRouter();
  const { organizationId } = useCurrentOrganization();

  const editModal = useBoolean();
  const confirmLock = useBoolean();

  const {
    data: kioskResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetKioskByIdQuery(
    { kioskId: id, organizationId },
    { skip: !id || !organizationId }
  );

  const kiosk = kioskResponse?.data || null;
  const isLocked = isKioskLocked(kiosk);

  const [toggleKioskLock, { isLoading: isTogglingLock }] = useToggleKioskLockMutation();

  const handleToggleLock = async () => {
    if (!id) return;
    try {
      await toggleKioskLock({ kioskId: id, organizationId }).unwrap();
      toast.success(isLocked ? 'Kiosk device unlocked successfully' : 'Kiosk device locked successfully');
      confirmLock.onFalse();
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || error?.message || 'Failed to toggle kiosk lock');
    }
  };

  const rootPath = ownerDashboard ? paths.owner.root : paths.siteManager.root;
  const kioskListPath = ownerDashboard ? paths.owner.kiosk : paths.siteManager.kiosk;

  const handleBack = () => {
    router.push(kioskListPath);
  };

  if (!isLoading && !kiosk) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="text"
            color="primary"
            onClick={handleBack}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            sx={{ px: 0, fontWeight: 600 }}
          >
            Back
          </Button>
        </Box>
        <EmptyContent
          filled
          title="Kiosk Not Found"
          description="The kiosk device you are looking for does not exist or could not be loaded."
          action={
            <Button variant="contained" onClick={handleBack}>
              Return to Kiosks List
            </Button>
          }
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  const presenceColor = kiosk?.presence === 'online' ? 'success' : 'error';
  const setupColor =
    kiosk?.setupStatus === 'registered'
      ? 'success'
      : kiosk?.setupStatus === 'pending'
      ? 'warning'
      : 'default';

  const headingTitle = kiosk?.locationLabel || kiosk?.deviceId || 'Kiosk Detail';
  const recentVisits = Array.isArray(kiosk?.recentVisits) ? kiosk.recentVisits : [];

  return (
    <DashboardContent>
      {/* Back button */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="text"
          color="primary"
          onClick={handleBack}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ px: 0, fontWeight: 600 }}
        >
          Back
        </Button>
      </Box>

      {/* Breadcrumbs Header */}
      <CustomBreadcrumbs
        heading={headingTitle}
        links={[
          { name: ownerDashboard ? 'Owner Dashboard' : 'Dashboard', href: rootPath },
          { name: 'Kiosks', href: kioskListPath },
          { name: headingTitle },
        ]}
        action={
          canManageKiosk ? (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                color={isLocked ? 'error' : 'inherit'}
                startIcon={<Iconify icon={isLocked ? 'solar:lock-bold' : 'solar:lock-unlocked-bold'} />}
                onClick={confirmLock.onTrue}
              >
                {isLocked ? 'Unlock Device' : 'Lock Device'}
              </Button>

              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="solar:pen-bold" />}
                onClick={editModal.onTrue}
              >
                Edit Kiosk
              </Button>
            </Stack>
          ) : null
        }
        sx={{ mb: 3 }}
      />

      {/* Main Dossier Banner Card */}
      <Card sx={{ p: 3, mb: 3 }}>
        {isLoading ? (
          <Skeleton variant="rounded" height={80} />
        ) : (
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2.5}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            {/* Identity & Device Avatar */}
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                }}
              >
                <Iconify
                  icon={
                    kiosk?.deviceType?.toLowerCase().includes('ipad') ||
                    kiosk?.deviceType?.toLowerCase().includes('tablet')
                      ? 'solar:tablet-bold'
                      : 'solar:monitor-bold'
                  }
                  width={32}
                />
              </Avatar>

              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="h6" fontWeight={700}>
                    {kiosk?.locationLabel || kiosk?.deviceId || 'Kiosk'}
                  </Typography>

                  {kiosk?.deviceId && (
                    <Label variant="soft" color="default">
                      {kiosk.deviceId}
                    </Label>
                  )}
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Site: {kiosk?.branch?.name || '—'} {kiosk?.branch?.code ? `(${kiosk.branch.code})` : ''} ·{' '}
                  Reception: {kiosk?.receptionIdentifier || '—'}
                </Typography>

                <Typography variant="caption" color="text.disabled">
                  Created: {fDateTime(kiosk?.createdAt) || '—'} · Last Updated: {fDateTime(kiosk?.updatedAt) || '—'}
                </Typography>
              </Stack>
            </Stack>

            {/* Status Badges */}
            <Stack
              direction={{ xs: 'row', md: 'column' }}
              spacing={{ xs: 1.5, md: 0.75 }}
              alignItems={{ xs: 'center', md: 'flex-end' }}
            >
              <Stack direction="row" spacing={1}>
                <Label variant="soft" color={presenceColor} sx={{ px: 1.5, py: 0.5, fontWeight: 700, textTransform: 'capitalize' }}>
                  {kiosk?.presence || 'offline'}
                </Label>

                <Label variant="soft" color={setupColor} sx={{ px: 1.5, py: 0.5, textTransform: 'capitalize' }}>
                  {kiosk?.setupStatus || 'registered'}
                </Label>
              </Stack>

              {kiosk?.lastHeartbeatAt && (
                <Typography variant="caption" color="text.secondary">
                  Last Heartbeat: {fDateTime(kiosk.lastHeartbeatAt)}
                </Typography>
              )}
            </Stack>
          </Stack>
        )}
      </Card>

      {/* KPI Metric Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          {isLoading ? (
            <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
          ) : (
            <DataUsageSummaryCard
              title="Visitors On Site"
              total={kiosk?.visitorsOnSite ?? 0}
              color="primary"
              icon="solar:users-group-rounded-bold-duotone"
            />
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          {isLoading ? (
            <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
          ) : (
            <DataUsageSummaryCard
              title="Visitor Check-Ins"
              total={kiosk?.visitorCheckIns ?? 0}
              color="success"
              icon="solar:login-2-bold-duotone"
            />
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          {isLoading ? (
            <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
          ) : (
            <DataUsageSummaryCard
              title="Visitor Check-Outs"
              total={kiosk?.visitorCheckOuts ?? 0}
              color="warning"
              icon="solar:logout-2-bold-duotone"
            />
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          {isLoading ? (
            <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
          ) : (
            <DataUsageSummaryCard
              title="Connection Status"
              total={kiosk?.presence === 'online' ? 'Online' : 'Offline'}
              color={presenceColor}
              icon={kiosk?.presence === 'online' ? 'solar:check-circle-bold-duotone' : 'solar:close-circle-bold-duotone'}
            />
          )}
        </Grid>
      </Grid>

      {/* Two Column Layout: Kiosk Hardware Info + Branch Settings */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Device & Hardware Specifications */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: 1 }}>
            <CardHeader
              title="Device Specifications"
              subheader="Terminal hardware and identification details"
              sx={{ p: 0, mb: 2 }}
            />

            <Divider sx={{ mb: 2 }} />

            {isLoading ? (
              <Skeleton variant="rounded" height={180} />
            ) : (
              <Stack spacing={0.5}>
                <DetailRow label="Device ID" value={kiosk?.deviceId || '—'} />
                <DetailRow label="Location Label" value={kiosk?.locationLabel || '—'} />
                <DetailRow label="Reception Identifier" value={kiosk?.receptionIdentifier || '—'} />
                <DetailRow label="Device Type" value={kiosk?.deviceType || '—'} />
                <DetailRow label="NFC Tag ID" value={kiosk?.nfcTagId || '—'} />
                <DetailRow
                  label="Kiosk Mode"
                  value={
                    <Label variant="soft" color="info" sx={{ textTransform: 'capitalize' }}>
                      {kiosk?.kioskMode || 'Setup'}
                    </Label>
                  }
                />
                <DetailRow
                  label="Fire Evacuation"
                  value={
                    <Label variant="soft" color={kiosk?.fireEvacuation ? 'error' : 'default'}>
                      {kiosk?.fireEvacuation ? 'Enabled' : 'Disabled'}
                    </Label>
                  }
                />
                <DetailRow
                  label="Last Check-In"
                  value={fDateTime(kiosk?.lastCheckInAt) || '—'}
                />
              </Stack>
            )}
          </Card>
        </Grid>

        {/* Site & Branch Details */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: 1 }}>
            <CardHeader
              title="Site & Branch Information"
              subheader="Assigned facility location and site settings"
              sx={{ p: 0, mb: 2 }}
            />

            <Divider sx={{ mb: 2 }} />

            {isLoading ? (
              <Skeleton variant="rounded" height={180} />
            ) : (
              <Stack spacing={0.5}>
                <DetailRow label="Site Name" value={kiosk?.branch?.name || '—'} />
                <DetailRow label="Site Code" value={kiosk?.branch?.code || '—'} />
                <DetailRow label="Timezone" value={kiosk?.branch?.timezone || 'Europe/London'} />
                <DetailRow
                  label="Breaks Allowed"
                  value={
                    <Label color={kiosk?.branch?.settings?.enableBreaks ? 'success' : 'default'}>
                      {kiosk?.branch?.settings?.enableBreaks ? 'Enabled' : 'Disabled'}
                    </Label>
                  }
                />
                <DetailRow
                  label="Paid Breaks"
                  value={
                    <Label color={kiosk?.branch?.settings?.paidBreaks ? 'success' : 'default'}>
                      {kiosk?.branch?.settings?.paidBreaks ? 'Yes' : 'No'}
                    </Label>
                  }
                />
                <DetailRow
                  label="Phone Check-In"
                  value={
                    <Label color={kiosk?.branch?.settings?.allowPhoneCheckIn ? 'info' : 'default'}>
                      {kiosk?.branch?.settings?.allowPhoneCheckIn ? 'Allowed' : 'Not Allowed'}
                    </Label>
                  }
                />
                <DetailRow
                  label="Late Grace Period"
                  value={`${kiosk?.branch?.settings?.lateGraceMinutes ?? 0} mins`}
                />
                <DetailRow
                  label="Leave Requests"
                  value={
                    <Label color={kiosk?.branch?.settings?.enableLeaveRequests ? 'success' : 'default'}>
                      {kiosk?.branch?.settings?.enableLeaveRequests ? 'Enabled' : 'Disabled'}
                    </Label>
                  }
                />
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Recent Visits Table Card */}
      <Card>
        <CardHeader
          title="Recent Visits"
          subheader="Latest visitor sign-in and sign-out activities logged at this kiosk"
          sx={{ mb: 1.5 }}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size="medium" sx={{ minWidth: 900 }}>
              <TableHeadCustom headLabel={VISIT_TABLE_HEAD} />

              <TableBody>
                {isLoading || isFetching ? (
                  <TableBodySkeleton rowCount={3} cellCount={VISIT_TABLE_HEAD.length} />
                ) : recentVisits.length > 0 ? (
                  recentVisits.map((visit) => {
                    const statusColorMap = {
                      checkedIn: 'success',
                      checkedOut: 'default',
                      awaitingApproval: 'warning',
                      rejected: 'error',
                    };

                    return (
                      <TableRow key={visit._id || visit.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" noWrap>
                            {visit.name || 'Anonymous Visitor'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {visit.personType || 'visitor'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={visit.method === 'walkIn' ? 'Walk-in' : visit.method || '—'}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {visit.purposeOfVisit || '—'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {fDateTime(visit.arrivedAt) || '—'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {fDateTime(visit.checkInAt) || '—'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {fDateTime(visit.checkOutAt) || '—'}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Label
                            variant="soft"
                            color={statusColorMap[visit.status] || 'default'}
                            sx={{ textTransform: 'capitalize' }}
                          >
                            {visit.status === 'awaitingApproval'
                              ? 'Awaiting Approval'
                              : visit.status === 'checkedOut'
                              ? 'Checked Out'
                              : visit.status === 'checkedIn'
                              ? 'Checked In'
                              : visit.status || '—'}
                          </Label>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableNoData notFound={!recentVisits.length} title="No recent visits recorded" />
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>
      </Card>

      {/* Edit Kiosk Modal */}
      <QuickAddKioskModal
        open={editModal.value}
        onClose={editModal.onFalse}
        currentKiosk={kiosk}
        ownerDashboard={ownerDashboard}
      />

      {/* Confirm Lock / Unlock Dialog */}
      <ConfirmDialog
        open={confirmLock.value}
        onClose={confirmLock.onFalse}
        title={isLocked ? 'Unlock Kiosk Device' : 'Lock Kiosk Device'}
        content={
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to {isLocked ? 'unlock' : 'lock'} this kiosk terminal (
            <strong>{kiosk?.locationLabel || kiosk?.deviceId || 'Kiosk'}</strong>)?
          </Typography>
        }
        action={
          <LoadingButton
            variant="contained"
            color={isLocked ? 'primary' : 'warning'}
            loading={isTogglingLock}
            onClick={handleToggleLock}
          >
            {isLocked ? 'Unlock Device' : 'Lock Device'}
          </LoadingButton>
        }
      />
    </DashboardContent>
  );
}

KioskDetailView.propTypes = {
  ownerDashboard: PropTypes.bool,
};
