import dayjs from 'dayjs';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { useParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { fDateTime } from 'src/utils/format-time';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { DashboardContent } from 'src/layouts/dashboard';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetShiftQuery } from 'src/store/Reducer/shifts-api';
import { getShiftStatusMeta, getShiftVisibilityLabel } from '../mocks/data';
import { ShiftDetailSkeleton } from '../shift-detail-skeleton';
import { getShiftStaffName } from '../utils';

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

// ----------------------------------------------------------------------

export function ShiftDetailView() {
  const { id } = useParams();
  const { organizationId } = useCurrentOrganization();

  const { data: apiShift, isLoading, isFetching } = useGetShiftQuery(
    { shiftId: id, organizationId },
    { skip: !id }
  );

  const shift = apiShift?.data || apiShift;

  if (isLoading || isFetching) {
    return <ShiftDetailSkeleton />;
  }

  if (!shift) {
    return (
      <DashboardContent>
        <EmptyContent filled title="Shift not found" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  const status = getShiftStatusMeta(shift.status);
  const isCancelled = shift.status === 'cancelled';
  const siteName = shift.branch?.name || shift.branchId?.name || '—';
  const staffName = getShiftStaffName(shift)
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const staffEmail = shift.staff?.email || shift.staff?.user?.email || '';
  const employeeCode = shift.staff?.employeeCode || '';
  const isUnassigned = !shift.staffId && staffName === 'Open / Unassigned';
  const editHref =
    shift?.organizationId?._id || shift?.organizationId || organizationId
      ? `${paths.owner.shifts.edit(shift._id)}?orgId=${shift?.organizationId?._id || shift?.organizationId || organizationId
      }`
      : paths.owner.shifts.edit(shift._id);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={staffName}
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          // { name: 'Rota' },
          { name: 'Shifts', href: paths.owner.shifts.root },
          { name: staffName },
        ]}
        action={
          !isCancelled && (
            <Button
              component={RouterLink}
              href={editHref}
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Edit
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
            sx={{
              width: 72,
              height: 72,
              typography: 'h4',
              bgcolor: isUnassigned ? 'warning.main' : 'primary.main',
              color: 'white',
            }}
          >
            {isUnassigned ? <Iconify icon="solar:calendar-date-bold" width={32} /> : getInitials(staffName)}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>
              {staffName}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25, textTransform: 'capitalize' }}>
              {siteName}
            </Typography>

            {staffEmail && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {String(staffEmail).toLowerCase()}
              </Typography>
            )}

            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mt: 1.25 }}>
              <Label variant="soft" color={status.color} sx={{ textTransform: 'capitalize' }}>
                {status.label}
              </Label>
              <Label variant="soft" color="default" sx={{ textTransform: 'capitalize' }}>
                {getShiftVisibilityLabel(shift.visibility)}
              </Label>
              {employeeCode && (
                <Label variant="soft" color="info">
                  {employeeCode}
                </Label>
              )}
              {shift.urgentCover && (
                <Label variant="soft" color="error">
                  Urgent cover
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
          value={fDateTime(shift.startsAt)}
          capitalize={false}
        />
        <SummaryTile
          icon="solar:calendar-mark-bold"
          label="End"
          value={fDateTime(shift.endsAt)}
          capitalize={false}
        />
        <SummaryTile
          icon="solar:clock-circle-bold"
          label="Duration"
          value={formatDuration(shift.startsAt, shift.endsAt)}
          capitalize={false}
        />
      </Box>

      <Card sx={{ p: { xs: 2.5, md: 3 } }}>
        <Typography variant="h6">Shift details</Typography>
        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'grid',
            rowGap: 2,
            columnGap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          }}
        >
          <DetailItem label="Site" value={siteName} />
          <DetailItem label="Staff" value={staffName} />
          <DetailItem label="Status" value={status.label} />
          <DetailItem label="Visibility" value={getShiftVisibilityLabel(shift.visibility)} />
          <DetailItem label="Urgent cover" value={shift.urgentCover ? 'Yes' : 'No'} />
          <DetailItem label="Opened at" value={fDateTime(shift.openedAt)} />
          <DetailItem label="Filled at" value={fDateTime(shift.filledAt)} />
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 4 }}
          sx={{ color: 'text.secondary' }}
        >
          <Typography variant="caption">Created {fDateTime(shift.createdAt)}</Typography>
          <Typography variant="caption">Updated {fDateTime(shift.updatedAt)}</Typography>
        </Stack>
      </Card>
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

function DetailItem({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
        {value}
      </Typography>
    </Stack>
  );
}
