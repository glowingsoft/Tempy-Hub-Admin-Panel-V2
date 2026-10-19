import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import { fDateTime } from 'src/utils/format-time';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

import { useGetShiftClaimsQuery } from 'src/store/Reducer/shift-claims-api';
import {
  getMockShiftClaimById,
  getShiftClaimStatusMeta,
  getShiftClaimVisibilityLabel,
} from '../mocks/data';
import { getShiftClaimStaffName } from '../utils';
import { useShiftClaimActions } from '../use-shift-claim-actions';
import { ShiftClaimActionDialog } from '../shift-claim-action-dialog';

// ----------------------------------------------------------------------

export function ShiftClaimDetailView() {
  const { id } = useParams();
  const router = useRouter();

  const { organizationId } = useCurrentOrganization();

  const { data: apiResponse, isLoading, refetch } = useGetShiftClaimsQuery(
    { organizationId, limit: 100 },
    { skip: !organizationId }
  );

  const claim = useMemo(
    () => apiResponse?.data?.find((c) => c._id === id) || getMockShiftClaimById(id),
    [apiResponse, id]
  );

  const claimOrgId =
    (typeof claim?.organizationId === 'object' ? claim?.organizationId?._id : claim?.organizationId) ||
    organizationId;

  const { askApprove, confirmProps } = useShiftClaimActions({
    organizationId: claimOrgId,
    onChanged: refetch,
  });

  if (isLoading) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 4 }}>
          Loading shift claim...
        </Typography>
      </Box>
    );
  }

  if (!claim) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(paths.owner.shiftClaims.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Shift claim not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  const status = getShiftClaimStatusMeta(claim.status);
  const canApprove = claim.status === 'open' || claim.status === 'pending';

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading="Shift claim details"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Rota' },
          { name: 'Shift Claims', href: paths.owner.shiftClaims.root },
          { name: 'Details' },
        ]}
        action={
          canApprove && (
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
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <DetailCard title="Shift claim">
          <DetailItem label="Site" value={claim.branch?.name || '—'} />
          <DetailItem label="Site code" value={claim.branch?.code || '—'} />
          <DetailItem label="Staff" value={getShiftClaimStaffName(claim)} />
          <DetailItem label="Employee code" value={claim.staff?.employeeCode || '—'} />
          <DetailItem label="Email" value={claim.staff?.email || '—'} />
          <DetailItem
            label="Status"
            value={
              <Label variant="soft" color={status.color}>
                {status.label}
              </Label>
            }
          />
          <DetailItem label="Visibility" value={getShiftClaimVisibilityLabel(claim.visibility)} />
          <DetailItem
            label="Urgent cover"
            value={
              claim.urgentCover ? (
                <Label variant="soft" color="error">
                  Urgent
                </Label>
              ) : (
                'No'
              )
            }
          />
          <DetailItem label="Start" value={fDateTime(claim.startsAt)} />
          <DetailItem label="End" value={fDateTime(claim.endsAt)} />
        </DetailCard>

        <DetailCard title="Activity">
          <DetailItem label="Opened at" value={fDateTime(claim.openedAt)} />
          <DetailItem label="Filled at" value={fDateTime(claim.filledAt)} />
          <DetailItem label="Created at" value={fDateTime(claim.createdAt)} />
          <DetailItem label="Updated at" value={fDateTime(claim.updatedAt)} />
        </DetailCard>
      </Stack>

      <ShiftClaimActionDialog {...confirmProps} />
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
