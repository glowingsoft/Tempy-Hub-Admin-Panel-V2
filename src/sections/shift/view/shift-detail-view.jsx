import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useParams, useRouter } from 'src/routes/hooks';

import { fDateTime } from 'src/utils/format-time';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetShiftQuery } from 'src/store/Reducer/shifts-api';
import { getMockShiftById, getShiftStatusMeta, getShiftVisibilityLabel } from '../mocks/data';
import { getShiftStaffName } from '../utils';

// ----------------------------------------------------------------------

export function ShiftDetailView() {
  const { id } = useParams();
  const router = useRouter();

  const { organizationId } = useCurrentOrganization();
  const { data: apiShift, isLoading } = useGetShiftQuery(
    { shiftId: id, organizationId },
    { skip: !id }
  );

  const mockShift = useMemo(() => getMockShiftById(id), [id]);
  const shift = apiShift?.data || apiShift || mockShift;

  if (isLoading) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 4 }}>
          Loading shift...
        </Typography>
      </Box>
    );
  }

  if (!shift) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(paths.owner.shifts.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Shift not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  const status = getShiftStatusMeta(shift.status);
  const isCancelled = shift.status === 'cancelled';

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading="Shift details"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Rota' },
          { name: 'Shifts', href: paths.owner.shifts.root },
          { name: 'Details' },
        ]}
        action={
          !isCancelled && (
            <Button
              component={RouterLink}
              href={
                shift?.organizationId?._id || shift?.organizationId || organizationId
                  ? `${paths.owner.shifts.edit(shift._id)}?orgId=${
                      shift?.organizationId?._id || shift?.organizationId || organizationId
                    }`
                  : paths.owner.shifts.edit(shift._id)
              }
              variant="contained"
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Edit
            </Button>
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <DetailCard title="Shift">
          <DetailItem
            label="Site"
            value={shift.branch?.name || shift.branchId?.name || '—'}
          />
          <DetailItem label="Staff" value={getShiftStaffName(shift)} />
          <DetailItem
            label="Status"
            value={
              <Label variant="soft" color={status.color}>
                {status.label}
              </Label>
            }
          />
          <DetailItem label="Visibility" value={getShiftVisibilityLabel(shift.visibility)} />
          <DetailItem label="Start" value={fDateTime(shift.startsAt)} />
          <DetailItem label="End" value={fDateTime(shift.endsAt)} />
          <DetailItem
            label="Urgent cover"
            value={
              shift.urgentCover ? (
                <Label variant="soft" color="error">
                  Urgent
                </Label>
              ) : (
                'No'
              )
            }
          />
        </DetailCard>

        <DetailCard title="Activity">
          <DetailItem label="Opened at" value={fDateTime(shift.openedAt)} />
          <DetailItem label="Filled at" value={fDateTime(shift.filledAt)} />
          <DetailItem label="Created at" value={fDateTime(shift.createdAt)} />
          <DetailItem label="Updated at" value={fDateTime(shift.updatedAt)} />
        </DetailCard>
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
