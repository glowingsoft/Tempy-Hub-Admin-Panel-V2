import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useParams, useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { fDateTime } from 'src/utils/format-time';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { LoadingScreen } from 'src/components/loading-screen';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';

import { useGetBranchQuery } from 'src/store/Reducer/branches-api';
import { getBranchStatusMeta } from '../mocks/data';

// ----------------------------------------------------------------------

const MANAGER_TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'name', label: 'Manager Name', minWidth: 220 },
  { id: 'email', label: 'Email', minWidth: 220 },
  { id: 'role', label: 'Role', minWidth: 160 },
];

function getInitials(name) {
  return String(name || '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatRole(role) {
  if (!role) return 'Site Manager';
  if (role === 'siteManager') return 'Site Manager';
  if (role === 'lineManager') return 'Line Manager';
  if (role === 'orgAdmin') return 'Org Admin';
  return role.replace(/([A-Z])/g, ' $1').trim();
}

const yesNo = (value) => (value ? 'Yes' : 'No');

export function BranchDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const { organizationId, user } = useCurrentOrganization();
  const { data: response, isLoading, isError, error } = useGetBranchQuery(
    { branchId: id, organizationId },
    { skip: !id || !organizationId }
  );
  const branch = response
    ? {
      ...response,
      organization:
        response.organization ??
        user?.access?.organizations?.find((organization) => organization._id === organizationId),
      settings: {
        ...response.settings,
        breaksPaid: response.settings?.breaksPaid ?? response.settings?.paidBreaks,
      },
      activation:
        response.activation ??
        (response.activatedAt
          ? { activatedAt: response.activatedAt, activatedBy: response.activatedBy }
          : null),
      manager: response.manager ?? response.managerInvitation ?? null,
      managers: Array.isArray(response.managers) && response.managers.length > 0
        ? response.managers
        : response.manager
          ? [response.manager]
          : [],
    }
    : null;

  if (isLoading) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <LoadingScreen sx={{ py: 10 }} />
      </Box>
    );
  }

  if (isError) {
    const errorMessage =
      error?.data?.message || error?.data?.error || error?.error || 'Unable to load site details.';

    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          color="primary"
          onClick={() => router.push(paths.owner.sites.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title={errorMessage} sx={{ py: 10 }} />
      </Box>
    );
  }

  if (!branch) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          color="primary"
          onClick={() => router.push(paths.owner.sites.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Site not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  const status = getBranchStatusMeta(branch.status);
  const { settings = {}, activation, managers = [] } = branch;

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button color="primary" onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={branch.name}
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Sites', href: paths.owner.sites.root },
          { name: branch.name },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.owner.sites.edit(branch._id)}
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:pen-bold" />}
          >
            Edit Site
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <DetailCard title="Site details">
          <DetailItem label="Name" value={branch.name} />
          <DetailItem label="Code" value={branch.code || '—'} />
          <DetailItem
            label="Status"
            value={
              <Label variant="soft" color={status.color}>
                {status.label}
              </Label>
            }
          />
          <DetailItem label="Assembly point" value={branch.assemblyPoint || '—'} />
          <DetailItem label="Address" value={branch.address || '—'} />
          <DetailItem label="Organization" value={branch.organization?.name || '—'} />
          <DetailItem label="Created At" value={fDateTime(branch.createdAt)} />
          <DetailItem label="Updated At" value={fDateTime(branch.updatedAt)} />
        </DetailCard>

        <DetailCard title="Attendance settings">
          <DetailItem label="Enable breaks" value={yesNo(settings.enableBreaks)} />
          {settings.enableBreaks && (
            <>
              <DetailItem label="Paid breaks" value={yesNo(settings.breaksPaid)} />
              {!settings.breaksPaid && (
                <DetailItem
                  label="Unpaid break rules"
                  value={
                    settings.breakRules?.length
                      ? settings.breakRules
                        .map((rule) => `${rule.minHours}h+ shift → ${rule.unpaidMinutes} min`)
                        .join(', ')
                      : '—'
                  }
                />
              )}
            </>
          )}
          <DetailItem label="Late grace minutes" value={settings.lateGraceMinutes !== undefined && settings.lateGraceMinutes !== null ? `${settings.lateGraceMinutes} mins` : '—'} />
          <DetailItem
            label="Auto clock-out after shift end"
            value={
              settings.autoClockOutHoursAfterShiftEnd !== undefined &&
                settings.autoClockOutHoursAfterShiftEnd !== null
                ? `${settings.autoClockOutHoursAfterShiftEnd} hrs`
                : '3 hrs'
            }
          />
          <DetailItem
            label="Auto clock-out after clock-in (unscheduled)"
            value={
              settings.autoClockOutHoursAfterClockIn !== undefined &&
                settings.autoClockOutHoursAfterClockIn !== null
                ? `${settings.autoClockOutHoursAfterClockIn} hrs`
                : '10 hrs'
            }
          />
          <DetailItem
            label="Visitor auto check-out after visit end"
            value={
              settings.visitorAutoCheckoutHoursAfterVisitUntil !== undefined &&
                settings.visitorAutoCheckoutHoursAfterVisitUntil !== null
                ? `${settings.visitorAutoCheckoutHoursAfterVisitUntil} hrs`
                : '1 hr'
            }
          />
          <DetailItem
            label="Visitor auto check-out after check-in"
            value={
              settings.visitorAutoCheckoutHoursAfterCheckIn !== undefined &&
                settings.visitorAutoCheckoutHoursAfterCheckIn !== null
                ? `${settings.visitorAutoCheckoutHoursAfterCheckIn} hrs`
                : '10 hrs'
            }
          />
          <DetailItem label="Allow phone check-in" value={yesNo(settings.allowPhoneCheckIn)} />
          <DetailItem label="Enable leave requests" value={yesNo(settings.enableLeaveRequests)} />
        </DetailCard>

        <DetailCard title="Activation">
          {activation ? (
            <>
              <DetailItem label="Activated at" value={fDateTime(activation.activatedAt)} />
              <DetailItem label="Activated by" value={activation.activatedBy || '—'} />
            </>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This site has not been activated yet.
            </Typography>
          )}
        </DetailCard>

        <Card>
          <Box sx={{ p: 3, pb: 2 }}>
            <Typography variant="h6">Site managers</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Managers assigned to oversee operations and staff at this site.
            </Typography>
          </Box>

          <Divider sx={{ mb: 1.5 }} />

          <Scrollbar>
            <Table sx={{ minWidth: 600 }}>
              <TableHeadCustom headLabel={MANAGER_TABLE_HEAD} />

              <TableBody>
                {managers.length > 0 ? (
                  managers.map((mgr, index) => (
                    <TableRow key={mgr.membershipId || mgr.userId || mgr._id || index} hover>
                      <TableCell sx={{ color: 'text.secondary', width: 60 }}>{index + 1}</TableCell>

                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar
                            alt={mgr.name}
                            src={mgr.image || mgr.profileIcon || undefined}
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: 'primary.lighter',
                              color: 'primary.main',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                            }}
                          >
                            {getInitials(mgr.name)}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                              {mgr.name || '—'}
                            </Typography>
                            {mgr.isDesignatedSiteManager && (
                              <Label variant="soft" color="info" sx={{ mt: 0.5, height: 20, fontSize: '0.65rem' }}>
                                Designated
                              </Label>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {mgr.email || '—'}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Label variant="soft" color="primary">
                          {formatRole(mgr.role || mgr.jobTitle?.name)}
                        </Label>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <EmptyContent filled title="No managers assigned" sx={{ py: 6 }} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Card>
      </Stack>
    </Box>
  );
}

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
