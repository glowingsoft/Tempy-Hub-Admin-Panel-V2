import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { LoadingScreen } from 'src/components/loading-screen';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';
import { getAssignedBranch } from 'src/sections/org-rollup/utils';
import { useGetPeepRecordByIdQuery } from 'src/store/Reducer/peep-floor-plan-api';
import { fDateTime } from 'src/utils/format-time';
import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';

import { getPeepLevelMeta, getPeepRecordById } from '../mocks/data';

export function PeepRecordDetailView({ ownerDashboard = true }) {
  const { id } = useParams();
  const router = useRouter();
  const { user: reduxUser } = useSelector((state) => state.user);
  const { organizationId: currentOrgId, user: currentUser } = useCurrentOrganization();
  const organizationId = currentOrgId || getOwnerOrganizationId(reduxUser);
  const user = currentUser || reduxUser;
  const assignedBranch = getAssignedBranch(user);
  const base = ownerDashboard ? paths.owner : paths.siteManager;
  const mockRecord = useMemo(() => (id ? getPeepRecordById(id) : null), [id]);

  const {
    data: apiRecord,
    isLoading,
    isFetching,
    isError,
  } = useGetPeepRecordByIdQuery({ peepRecordId: id, organizationId }, { skip: !id || !organizationId || Boolean(mockRecord) });

  const record = apiRecord || mockRecord;
  const recordBranchId = typeof record?.branch === 'object' ? record.branch?._id : record?.branchId || record?.branch;
  const siteManagerRecordAllowed = ownerDashboard || Boolean(assignedBranch?.id && recordBranchId && recordBranchId === assignedBranch.id);

  const residentName = record?.resident?.name || record?.residentName || record?.name || 'PEEP record';
  const branchName =
    (typeof record?.branch === 'object' ? record.branch?.name : null) ||
    record?.branchName ||
    (typeof record?.branch === 'string' ? record.branch : null) ||
    assignedBranch?.name ||
    '—';
  const floorName = record?.floor || record?.pin?.floorPlan?.name || record?.floorPlan?.name || record?.floorNumber || '—';
  const level = getPeepLevelMeta(record?.peepLevel || record?.level);

  if ((isLoading || isFetching) && !record) {
    return (
      <DashboardContent>
        <LoadingScreen sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  if (!organizationId && !mockRecord) {
    return (
      <DashboardContent>
        <EmptyContent filled title="Organization context is unavailable." sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  if (isError || !record || !siteManagerRecordAllowed) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button onClick={() => router.push(base.peepAndFloorPlans.records.root)} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
            Back to PEEP Records
          </Button>
        </Box>
        <EmptyContent filled title={siteManagerRecordAllowed ? 'PEEP record could not be found or loaded.' : 'You do not have access to this PEEP record.'} sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  const recordsPath = recordBranchId ? base.peepAndFloorPlans.records.bySite(recordBranchId) : base.peepAndFloorPlans.records.root;

  return (
    <DashboardContent>
      <Box sx={{ mb: 2 }}>
        <Button onClick={() => router.push(recordsPath)} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back to PEEP Records
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading="PEEP Record Details"
        links={[
          { name: 'Dashboard', href: base.root },
          { name: 'PEEP & Floor Plans', href: base.peepAndFloorPlans.root },
          { name: 'PEEP Records', href: recordsPath },
          { name: 'PEEP Record Details' },
        ]}
        action={
          <Button variant="contained" onClick={() => router.push(base.peepAndFloorPlans.records.edit(id))} startIcon={<Iconify icon="solar:pen-bold" />}>
            Edit
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          PEEP record details
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <DetailSection title="Resident and site">
              <DetailItem label="Resident" value={residentName} />
              <DetailItem label="Email" value={record.resident?.email || record.email} />
              <DetailItem label="Room" value={record.resident?.roomNumber || record.roomNumber} />
              <DetailItem label="Site" value={branchName} />
              <DetailItem label="Floor" value={floorName} />
            </DetailSection>
          </Grid>

          <Grid xs={12} md={6}>
            <DetailSection title="PEEP and review">
              <DetailItem
                label="PEEP level"
                value={
                  <Label variant="soft" color={level.color}>
                    {level.label}
                  </Label>
                }
              />
              <DetailItem label="Consent status" value={formatStatus(record.consentStatus)} />
              <DetailItem label="Review due" value={formatDate(record.reviewDueAt)} />
              <DetailItem label="Last reviewed" value={formatDate(record.lastReviewedAt)} />
            </DetailSection>
          </Grid>

          <Grid xs={12}>
            <DetailSection title="Support and evacuation">
              <Grid container spacing={2.5}>
                <Grid xs={12} md={6}>
                  <DetailItem label="Support needs" value={record.supportNeeds} />
                </Grid>
                <Grid xs={12} md={6}>
                  <DetailItem label="Primary route" value={record.primaryRoute} />
                </Grid>
                <Grid xs={12} md={6}>
                  <DetailItem label="Secondary route" value={record.secondaryRoute} />
                </Grid>
                <Grid xs={12} md={6}>
                  <DetailItem label="Equipment required" value={record.equipmentRequired} />
                </Grid>
                <Grid xs={12} md={6}>
                  <DetailItem label="Responsible staff" value={record.responsibleStaff} />
                </Grid>
                {record.mcaBestInterestNotes && (
                  <Grid xs={12}>
                    <DetailItem label="MCA best-interest notes" value={record.mcaBestInterestNotes} />
                  </Grid>
                )}
              </Grid>
            </DetailSection>
          </Grid>
        </Grid>
      </Card>
    </DashboardContent>
  );
}

function DetailSection({ title, children }) {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {children}
    </Stack>
  );
}

function DetailItem({ label, value }) {
  const content = value === null || value === undefined || value === '' ? '—' : value;

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>
        {content}
      </Typography>
    </Box>
  );
}

function formatDate(value) {
  return value ? fDateTime(value) : '—';
}

function formatStatus(value) {
  if (!value) return '—';

  return value
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
