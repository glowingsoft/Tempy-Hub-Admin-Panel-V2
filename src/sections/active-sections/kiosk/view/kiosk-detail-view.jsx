import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData } from 'src/components/table';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { DashboardContent } from 'src/layouts/dashboard';
import { useParams, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { mockKiosks } from '../mocks/data';
import QuickAddKioskModal from '../quick-add-kiosk-modal';

// ----------------------------------------------------------------------

const ACTIVITY_TABLE_HEAD = [
  { id: 'time', label: 'Time', width: 140 },
  { id: 'user', label: 'User / Visitor', minWidth: 180 },
  { id: 'type', label: 'Event Type', width: 160 },
  { id: 'method', label: 'Method', width: 140 },
  { id: 'status', label: 'Status', align: 'center', width: 120 },
];

const MOCK_KIOSK_ACTIVITIES = [
  {
    id: 'act-1',
    time: '10:42 AM Today',
    user: 'Sarah Jenkins',
    role: 'Care Assistant',
    type: 'Staff Check-In',
    method: 'PIN',
    status: 'success',
  },
  {
    id: 'act-2',
    time: '10:15 AM Today',
    user: 'Michael Chang',
    role: 'Visitor (Elsie Hall)',
    type: 'Visitor Sign-In',
    method: 'QR Code',
    status: 'success',
  },
  {
    id: 'act-3',
    time: '09:58 AM Today',
    user: 'Amara Nwosu',
    role: 'Senior Carer',
    type: 'Break Start',
    method: 'Employee ID',
    status: 'success',
  },
  {
    id: 'act-4',
    time: '08:02 AM Today',
    user: 'David Ross',
    role: 'Maintenance Technician',
    type: 'Staff Check-In',
    method: 'Employee ID',
    status: 'success',
  },
  {
    id: 'act-5',
    time: '07:45 AM Today',
    user: 'Elena Rostova',
    role: 'Registered Nurse',
    type: 'Staff Check-Out',
    method: 'PIN',
    status: 'success',
  },
];

function DetailRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2" fontWeight={600} textAlign="right">
        {value || '—'}
      </Typography>
    </Stack>
  );
}

DetailRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

// ----------------------------------------------------------------------

export function KioskDetailView({ ownerDashboard = false }) {
  const { id } = useParams();
  const router = useRouter();

  const editModal = useBoolean();
  const [locked, setLocked] = useState(false);

  const kiosk = useMemo(() => {
    return mockKiosks.find((item) => item._id === id || item.kioskCode === id);
  }, [id]);

  const rootPath = ownerDashboard ? paths.owner.root : paths.siteManager.root;
  const kioskListPath = ownerDashboard ? paths.owner.kiosk : paths.siteManager.kiosk;

  const handleBack = () => {
    router.push(kioskListPath);
  };

  const handleToggleLock = () => {
    setLocked((prev) => !prev);
    toast.success(locked ? 'Kiosk unlocked successfully' : 'Kiosk locked for maintenance');
  };

  if (!kiosk) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button onClick={handleBack} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
            Back to Kiosks
          </Button>
        </Box>
        <EmptyContent
          filled
          title="Kiosk Not Found"
          description="The kiosk device you are looking for does not exist or has been removed."
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

  const statusColor =
    kiosk.status === 'online' ? 'success' : kiosk.status === 'offline' ? 'error' : 'warning';

  const setupColor =
    kiosk.setupStatus === 'registered'
      ? 'success'
      : kiosk.setupStatus === 'pending'
      ? 'warning'
      : 'default';

  const checkInMethodsMap = {
    employee_id: 'Employee ID',
    pin: 'Name & PIN',
    qr_code: 'QR Code',
    qr: 'QR Code',
    express: 'Express Tap',
  };

  return (
    <DashboardContent>
      {/* Back button */}
      <Box sx={{ mb: 2 }}>
        <Button onClick={handleBack} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back to Kiosks
        </Button>
      </Box>

      {/* Breadcrumbs Header */}
      <CustomBreadcrumbs
        heading={kiosk.name}
        links={[
          { name: ownerDashboard ? 'Owner Dashboard' : 'Dashboard', href: rootPath },
          { name: 'Kiosks', href: kioskListPath },
          { name: kiosk.name },
        ]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color={locked ? 'error' : 'inherit'}
              startIcon={
                <Iconify icon={locked ? 'solar:lock-bold' : 'solar:lock-unlocked-bold'} />
              }
              onClick={handleToggleLock}
            >
              {locked ? 'Unlock Kiosk' : 'Lock Kiosk'}
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
        }
        sx={{ mb: 3 }}
      />

      {/* Main Kiosk Dossier Card */}
      <Card sx={{ p: 3, mb: 3 }}>
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
                width: 64,
                height: 64,
                bgcolor: 'primary.lighter',
                color: 'primary.main',
              }}
            >
              <Iconify
                icon={
                  kiosk.device?.type === 'ipad'
                    ? 'solar:tablet-bold'
                    : kiosk.device?.type === 'android'
                    ? 'solar:tablet-bold'
                    : 'solar:monitor-bold'
                }
                width={32}
              />
            </Avatar>

            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" fontWeight={700}>
                  {kiosk.name}
                </Typography>
                <Label variant="soft" color="default">
                  {kiosk.kioskCode}
                </Label>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {kiosk.site?.name || kiosk.site} {kiosk.site?.code ? `(${kiosk.site.code})` : ''} ·{' '}
                Device: {kiosk.device?.name || '—'}
              </Typography>

              {kiosk.registrationDate && (
                <Typography variant="caption" color="text.disabled">
                  Registered: {kiosk.registrationDate} · Last active: {kiosk.lastActive || '—'}
                </Typography>
              )}
            </Stack>
          </Stack>

          {/* Status Badges */}
          <Stack
            direction={{ xs: 'row', md: 'column' }}
            spacing={{ xs: 1.5, md: 0.75 }}
            alignItems={{ xs: 'center', md: 'flex-end' }}
          >
            <Stack direction="row" spacing={1}>
              <Label variant="soft" color={statusColor} sx={{ px: 1.5, py: 0.5, fontWeight: 700 }}>
                {kiosk.status ? kiosk.status.toUpperCase() : 'OFFLINE'}
              </Label>
              <Label variant="soft" color={setupColor} sx={{ px: 1.5, py: 0.5 }}>
                {kiosk.setupStatus === 'registered' ? 'Registered' : 'Pending Setup'}
              </Label>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              IP: {kiosk.lastIp || '192.168.1.101'}
            </Typography>
          </Stack>
        </Stack>
      </Card>

      {/* KPI Metric Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              textTransform="uppercase"
            >
              Total Activity
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
              {kiosk.activity?.total ?? 50}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total transactions recorded
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              textTransform="uppercase"
            >
              Staff Check-Ins
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: 'success.main' }}>
              {kiosk.activity?.checkIns ?? 32}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Completed check-ins
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              textTransform="uppercase"
            >
              Staff Check-Outs
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: 'info.main' }}>
              {kiosk.activity?.checkOuts ?? 18}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Completed check-outs
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              textTransform="uppercase"
            >
              Visitors Signed In
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: 'warning.main' }}>
              {kiosk.activity?.visitors ?? 4}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Visitor sessions logged
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Two-Column Specification Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Device & Hardware Specs */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <CardHeader
              title="Hardware & Network"
              subheader="Assigned device details and network connectivity"
              sx={{ p: 0, mb: 2 }}
            />
            <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

            <Stack spacing={1}>
              <DetailRow label="Device Name" value={kiosk.device?.name || 'Reception iPad'} />
              <DetailRow
                label="Device Platform / OS"
                value={
                  <Chip
                    size="small"
                    label={kiosk.device?.type ? kiosk.device.type.toUpperCase() : 'TABLET'}
                    variant="outlined"
                  />
                }
              />
              <DetailRow label="IP Address" value={kiosk.lastIp || '192.168.1.101'} />
              <DetailRow label="Kiosk Code" value={kiosk.kioskCode} />
              <DetailRow
                label="Assigned Site"
                value={`${kiosk.site?.name || kiosk.site} ${
                  kiosk.site?.code ? `(${kiosk.site.code})` : ''
                }`}
              />
              <DetailRow
                label="Registration Date"
                value={kiosk.registrationDate || 'Aug 10, 2026'}
              />
              <DetailRow label="Last Heartbeat" value={kiosk.lastActive || '2 minutes ago'} />
            </Stack>
          </Card>
        </Grid>

        {/* Operational Rules & Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <CardHeader
              title="Operational Configuration"
              subheader="Enabled check-in modes and terminal policies"
              sx={{ p: 0, mb: 2 }}
            />
            <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

            <Stack spacing={1}>
              <DetailRow
                label="Reception Identifier"
                value={kiosk.settings?.receptionIdentifier || 'FRONT-DESK'}
              />
              <DetailRow
                label="Screen Auto-Timeout"
                value={`${kiosk.settings?.screenTimeout ?? 60} seconds`}
              />
              <DetailRow
                label="Allow Staff Check-Out"
                value={
                  <Label color={kiosk.settings?.allowCheckOut ? 'success' : 'error'}>
                    {kiosk.settings?.allowCheckOut ? 'Enabled' : 'Disabled'}
                  </Label>
                }
              />
              <DetailRow
                label="Break Tracking"
                value={
                  <Label color={kiosk.settings?.enableBreaks ? 'success' : 'default'}>
                    {kiosk.settings?.enableBreaks ? 'Enabled' : 'Disabled'}
                  </Label>
                }
              />
              <DetailRow
                label="Phone / Remote Check-In"
                value={
                  <Label color={kiosk.settings?.phoneCheckIn ? 'info' : 'default'}>
                    {kiosk.settings?.phoneCheckIn ? 'Allowed' : 'Not Allowed'}
                  </Label>
                }
              />
              <Box sx={{ pt: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Allowed Check-in Methods:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {(kiosk.settings?.checkInMethods?.length
                    ? kiosk.settings.checkInMethods
                    : ['pin', 'employee_id']
                  ).map((m) => (
                    <Chip
                      key={m}
                      size="small"
                      label={checkInMethodsMap[m] || m}
                      color="primary"
                      variant="soft"
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity Table Card */}
      <Card>
        <CardHeader
          title="Recent Activity"
          subheader="Latest check-in, check-out, and visitor records logged at this terminal"
          sx={{ mb: 1.5 }}
        />

        <TableContainer>
          <Scrollbar>
            <Table size="medium">
              <TableHeadCustom headLabel={ACTIVITY_TABLE_HEAD} />

              <TableBody>
                {MOCK_KIOSK_ACTIVITIES.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.time}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack>
                        <Typography variant="subtitle2">{row.user}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.role}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Label
                        variant="soft"
                        color={
                          row.type.includes('Check-In')
                            ? 'success'
                            : row.type.includes('Check-Out')
                            ? 'info'
                            : row.type.includes('Break')
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {row.type}
                      </Label>
                    </TableCell>

                    <TableCell>
                      <Chip size="small" variant="outlined" label={row.method} />
                    </TableCell>

                    <TableCell align="center">
                      <Label variant="soft" color="success">
                        Successful
                      </Label>
                    </TableCell>
                  </TableRow>
                ))}

                <TableNoData notFound={false} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>

      {/* Edit Kiosk Modal */}
      <QuickAddKioskModal
        open={editModal.value}
        onClose={editModal.onFalse}
        currentKiosk={kiosk}
      />
    </DashboardContent>
  );
}

KioskDetailView.propTypes = {
  ownerDashboard: PropTypes.bool,
};
