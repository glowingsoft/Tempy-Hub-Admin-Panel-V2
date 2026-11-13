import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useCanApprove } from 'src/auth/hooks';
import { ModuleSlug } from 'src/auth/permissions';
import { useParams } from 'src/routes/hooks';

import { fDate, fDateTime } from 'src/utils/format-time';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { DashboardContent } from 'src/layouts/dashboard';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetLeaveRequestQuery } from 'src/store/Reducer/leave-requests-api';
import { LeaveRequestActionDialog } from '../leave-request-action-dialog';
import { LeaveRequestDetailSkeleton } from '../leave-request-detail-skeleton';
import { getLeaveRequestStatusMeta, getLeaveTypeLabel } from '../mocks/data';
import { useLeaveRequestActions } from '../use-leave-request-actions';
import { getLeaveRequestContext, getLeaveRequestStaffName } from '../utils';

// ----------------------------------------------------------------------

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatSource(value) {
  if (!value) return '—';
  return String(value)
    .replace(/([A-Z])/g, ' $1')
    .trim();
}

function displayName(user) {
  return user?.name || '—';
}

function displayEmail(user) {
  return user?.email ? String(user.email).toLowerCase() : '';
}

// ----------------------------------------------------------------------

export function LeaveRequestDetailView({ variant = 'owner' }) {
  const canApproveLeave = useCanApprove(ModuleSlug.LEAVE);
  const { id } = useParams();
  const ctx = getLeaveRequestContext(variant);
  const { organizationId } = useCurrentOrganization();

  const { data: request, isLoading } = useGetLeaveRequestQuery(
    { leaveRequestId: id, organizationId },
    { skip: !id }
  );

  const reqOrgId =
    (typeof request?.organizationId === 'object'
      ? request?.organizationId?._id
      : request?.organizationId) || organizationId;

  const { askApprove, askReject, dialogProps } = useLeaveRequestActions({
    organizationId: reqOrgId,
  });

  if (isLoading) {
    return <LeaveRequestDetailSkeleton />;
  }

  if (!request) {
    return (
      <DashboardContent>
        <EmptyContent filled title="Leave request not found" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  const status = getLeaveRequestStatusMeta(request.status);
  const isPending = request.status === 'pending';
  const staffName = getLeaveRequestStaffName(request)?.replace(/\b\w/g, (c) => c.toUpperCase());
  const staffEmail = request.staff?.email ? String(request.staff.email).toLowerCase() : '';
  const employeeCode = request.staff?.employeeCode || '';
  const siteName = request.branch?.name || '—';
  const orgName = request.organization?.name || '—';
  const leaveType = getLeaveTypeLabel(request.leaveType);
  const decidedByName = displayName(request.decidedByUser);
  const createdByName = displayName(request.createdByUser);
  const recordedByName = request.recordedByUser ? displayName(request.recordedByUser) : '';

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={staffName}
        links={[
          { name: 'Dashboard', href: ctx.dashboardHref },
          { name: ctx.heading, href: ctx.listHref },
          { name: staffName },
        ]}
        action={
          canApproveLeave && isPending && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                color="error"
                variant="outlined"
                onClick={() => askReject(request)}
                startIcon={<Iconify icon="solar:close-circle-bold" />}
              >
                Reject
              </Button>
              <Button
                color="success"
                variant="contained"
                onClick={() => askApprove(request)}
                startIcon={<Iconify icon="solar:check-circle-bold" />}
              >
                Approve
              </Button>
            </Stack>
          )
        }
        sx={{ mb: 3 }}
      />

      <Card sx={{ p: { xs: 2.5, md: 3 }, mb: 2.5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Avatar
            alt={staffName}
            sx={{ width: 72, height: 72, typography: 'h4', bgcolor: 'primary.main', color: 'white' }}
          >
            {getInitials(staffName)}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>
              {staffName}
            </Typography>

            {staffEmail && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                {staffEmail}
              </Typography>
            )}

            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mt: 1.25 }}>
              <Label variant="soft" color={status.color} sx={{ textTransform: 'capitalize' }}>
                {status.label}
              </Label>
              <Label variant="soft" color="default">
                {leaveType}
              </Label>
              {employeeCode && (
                <Label variant="soft" color="info">
                  {employeeCode}
                </Label>
              )}
            </Stack>
          </Box>
        </Stack>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          mb: 2.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        }}
      >
        <SummaryTile
          icon="solar:calendar-date-bold"
          label="Start"
          value={fDate(request.startDate)}
          capitalize={false}
        />
        <SummaryTile
          icon="solar:calendar-mark-bold"
          label="End"
          value={fDate(request.endDate)}
          capitalize={false}
        />
        <SummaryTile
          icon="solar:clock-circle-bold"
          label="Total days"
          value={`${request.totalDays ?? '—'} day${request.totalDays === 1 ? '' : 's'}`}
          capitalize={false}
        />
      </Box>

      <Card sx={{ p: { xs: 2.5, md: 3 }, mb: 2.5 }}>
        <Typography variant="h6">Request details</Typography>
        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'grid',
            rowGap: 2,
            columnGap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          }}
        >
          <DetailItem label="Site" value={siteName} capitalize />
          <DetailItem label="Organization" value={orgName} capitalize />
          <DetailItem label="Leave type" value={leaveType} />
          <DetailItem label="Source" value={formatSource(request.source)} capitalize />
          <DetailItem label="Reason" value={request.reason || '—'} />
          <DetailItem
            label="Attachment"
            value={
              request.attachmentUrl ? (
                <Link href={request.attachmentUrl} target="_blank" rel="noopener noreferrer">
                  View attachment
                </Link>
              ) : (
                '—'
              )
            }
          />
        </Box>
      </Card>

      <Card sx={{ p: { xs: 2.5, md: 3 } }}>
        <Typography variant="h6">Decision</Typography>
        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'grid',
            rowGap: 2,
            columnGap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            mb: 2.5,
          }}
        >
          <PersonItem
            label="Decided by"
            name={request.decidedByUser ? decidedByName : '—'}
            email={displayEmail(request.decidedByUser)}
          />
          <DetailItem label="Decided at" value={fDateTime(request.decidedAt)} />
          <DetailItem label="Decision note" value={request.decisionNote || '—'} />
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Box
          sx={{
            display: 'grid',
            rowGap: 2,
            columnGap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            mb: 2.5,
          }}
        >
          <PersonItem
            label="Created by"
            name={createdByName}
            email={displayEmail(request.createdByUser)}
          />
          {recordedByName ? (
            <PersonItem
              label="Recorded by"
              name={recordedByName}
              email={displayEmail(request.recordedByUser)}
            />
          ) : (
            <DetailItem label="Recorded by" value="—" />
          )}
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 4 }}
          sx={{ color: 'text.secondary' }}
        >
          <Typography variant="caption">Created {fDateTime(request.createdAt)}</Typography>
          <Typography variant="caption">Updated {fDateTime(request.updatedAt)}</Typography>
        </Stack>
      </Card>

      <LeaveRequestActionDialog {...dialogProps} />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function SummaryTile({ icon, label, value, capitalize = true }) {
  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.lighter',
            color: 'primary.dark',
          }}
        >
          <Iconify icon={icon} width={22} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {label}
          </Typography>
          <Typography variant="subtitle2" noWrap sx={capitalize ? { textTransform: 'capitalize' } : undefined}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

function DetailItem({ label, value, capitalize = false }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        component="div"
        sx={{ fontWeight: 600, ...(capitalize ? { textTransform: 'capitalize' } : {}) }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function PersonItem({ label, name, email }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
        {name}
      </Typography>
      {email ? (
        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'none' }}>
          {email}
        </Typography>
      ) : null}
    </Stack>
  );
}
