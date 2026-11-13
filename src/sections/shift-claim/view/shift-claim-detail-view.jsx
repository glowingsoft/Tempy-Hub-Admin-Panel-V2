import dayjs from 'dayjs';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useCanApprove } from 'src/auth/hooks';
import { ModuleSlug } from 'src/auth/permissions';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { fDateTime } from 'src/utils/format-time';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { DashboardContent } from 'src/layouts/dashboard';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetShiftClaimQuery } from 'src/store/Reducer/shift-claims-api';
import { getShiftClaimStatusMeta } from '../mocks/data';
import { ShiftClaimActionDialog } from '../shift-claim-action-dialog';
import { ShiftClaimDetailSkeleton } from '../shift-claim-detail-skeleton';
import { useShiftClaimActions } from '../use-shift-claim-actions';
import { getShiftClaimStaffName } from '../utils';

// ----------------------------------------------------------------------

function formatDuration(startsAt, endsAt) {
  if (!startsAt || !endsAt) return '—';

  const minutes = dayjs(endsAt).diff(dayjs(startsAt), 'minute');
  if (!Number.isFinite(minutes) || minutes < 0) return '—';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours && remainingMinutes) return `${hours}h ${remainingMinutes}m`;
  if (hours) return `${hours}h`;
  return `${remainingMinutes}m`;
}

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function displayEmail(user) {
  return user?.email ? String(user.email).toLowerCase() : '';
}

// ----------------------------------------------------------------------

export function ShiftClaimDetailView() {
  const canApproveClaims = useCanApprove(ModuleSlug.ROTA_SCHEDULING);
  const { id } = useParams();
  const { organizationId } = useCurrentOrganization();

  const { data: claim, isLoading } = useGetShiftClaimQuery(
    { shiftClaimId: id, organizationId },
    { skip: !id || !organizationId }
  );

  const claimOrgId =
    (typeof claim?.organizationId === 'object' ? claim?.organizationId?._id : claim?.organizationId) ||
    organizationId;

  const { askApprove, confirmProps } = useShiftClaimActions({
    organizationId: claimOrgId,
  });

  if (isLoading) {
    return <ShiftClaimDetailSkeleton />;
  }

  if (!claim) {
    return (
      <DashboardContent>
        <EmptyContent filled title="Shift claim not found" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  const status = getShiftClaimStatusMeta(claim.status);
  const shiftStatus = getShiftClaimStatusMeta(claim.shift?.status);
  const canApprove = claim.status === 'open' || claim.status === 'pending';
  const staffName = getShiftClaimStaffName(claim);
  const staffEmail = displayEmail(claim.staff);
  const employeeCode = claim.staff?.employeeCode || '';
  const siteName = claim.branch?.name || '—';
  const startsAt = claim.shift?.startsAt || claim.startsAt;
  const endsAt = claim.shift?.endsAt || claim.endsAt;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={staffName}
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Shift Claims', href: paths.owner.shiftClaims.root },
          { name: staffName },
        ]}
        action={
          canApproveClaims && canApprove && (
            <Button
              color="success"
              variant="contained"
              onClick={() => askApprove(claim)}
              startIcon={<Iconify icon="solar:check-circle-bold" />}
            >
              Approve
            </Button>
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

            <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
              {siteName}
            </Typography>

            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mt: 1.25 }}>
              <Label variant="soft" color={status.color} sx={{ textTransform: 'capitalize' }}>
                {status.label}
              </Label>
              {claim.shift?.status && (
                <Label variant="soft" color={shiftStatus.color} sx={{ textTransform: 'capitalize' }}>
                  Shift {shiftStatus.label}
                </Label>
              )}
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
          value={fDateTime(startsAt)}
          capitalize={false}
        />
        <SummaryTile
          icon="solar:calendar-mark-bold"
          label="End"
          value={fDateTime(endsAt)}
          capitalize={false}
        />
        <SummaryTile
          icon="solar:clock-circle-bold"
          label="Duration"
          value={formatDuration(startsAt, endsAt)}
          capitalize={false}
        />
      </Box>

      <Card sx={{ p: { xs: 2.5, md: 3 }, mb: 2.5 }}>
        <Typography variant="h6">Claim details</Typography>
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
          <DetailItem label="Site code" value={claim.branch?.code || '—'} />
          <DetailItem label="Staff" value={staffName} capitalize />
          <DetailItem label="Note" value={claim.note || '—'} />
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
            label="Approved by"
            name={claim.decidedByUser?.name || '—'}
            email={displayEmail(claim.decidedByUser)}
          />
          <DetailItem label="Decided at" value={fDateTime(claim.decidedAt)} />
          <DetailItem label="Decision note" value={claim.decisionNote || '—'} />
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 4 }}
          sx={{ color: 'text.secondary' }}
        >
          <Typography variant="caption">Created {fDateTime(claim.createdAt)}</Typography>
          <Typography variant="caption">Updated {fDateTime(claim.updatedAt)}</Typography>
        </Stack>
      </Card>

      <ShiftClaimActionDialog {...confirmProps} />
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
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {email}
        </Typography>
      ) : null}
    </Stack>
  );
}
