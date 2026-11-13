import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useCanManage } from 'src/auth/hooks';
import { ModuleSlug } from 'src/auth/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { LoadingScreen } from 'src/components/loading-screen';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';
import { getAssignedBranch } from 'src/sections/org-rollup/utils';
import { useGetPeepRecordByIdQuery } from 'src/store/Reducer/peep-floor-plan-api';
import { fDateTime } from 'src/utils/format-time';
import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';

import { getPeepLevelMeta, getPeepRecordById } from '../mocks/data';

export function PeepRecordDetailView({ ownerDashboard = true }) {
  const canManagePeep = useCanManage(ModuleSlug.PEEP_FLOOR_PLAN);
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
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <LoadingScreen sx={{ py: 10 }} />
      </Box>
    );
  }

  if (!organizationId && !mockRecord) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <EmptyContent filled title="Organization context is unavailable." sx={{ py: 10 }} />
      </Box>
    );
  }

  if (isError || !record || !siteManagerRecordAllowed) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          color="primary"
          onClick={() => router.push(base.peepAndFloorPlans.records.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent
          filled
          title={
            siteManagerRecordAllowed
              ? 'PEEP record could not be found or loaded.'
              : 'You do not have access to this PEEP record.'
          }
          sx={{ py: 10 }}
        />
      </Box>
    );
  }

  const recordsPath = recordBranchId ? base.peepAndFloorPlans.records.bySite(recordBranchId) : base.peepAndFloorPlans.records.root;

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button
          color="primary"
          onClick={() => router.push(recordsPath)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
        >
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        links={[
          { name: 'Dashboard', href: base.root },
          { name: 'PEEP & Floor Plans', href: base.peepAndFloorPlans.root },
          { name: 'PEEP Records', href: recordsPath },
          { name: residentName },
        ]}
        action={
          canManagePeep ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push(base.peepAndFloorPlans.records.edit(id))}
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Edit
            </Button>
          ) : null
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        <Typography variant="h6">PEEP record details</Typography>
        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'grid',
            rowGap: 2.5,
            columnGap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          }}
        >
          <DetailItem label="Resident" value={residentName} />
          <DetailItem label="Email" value={record.resident?.email || record.email} />
          <DetailItem label="Room" value={record.resident?.roomNumber || record.roomNumber} />
          <DetailItem label="Site" value={branchName} />
          <DetailItem label="Floor" value={floorName} />
          <DetailItem
            label="PEEP Level"
            value={
              <Label variant="soft" color={level.color}>
                {level.label}
              </Label>
            }
          />
          <DetailItem label="Consent Status" value={formatStatus(record.consentStatus)} />
          <DetailItem label="Review Due" value={formatDate(record.reviewDueAt)} />
          <DetailItem label="Last Reviewed" value={formatDate(record.lastReviewedAt)} />
          <DetailItem label="Primary Route" value={record.primaryRoute} />
          <DetailItem label="Secondary Route" value={record.secondaryRoute} />
          <DetailItem label="Equipment Required" value={record.equipmentRequired} />
          <DetailItem label="Responsible Staff" value={record.responsibleStaff} />
          <DetailItem
            label="Support Needs"
            value={record.supportNeeds}
            sx={{ gridColumn: { sm: 'span 2' } }}
          />
          {record.mcaBestInterestNotes && (
            <DetailItem
              label="MCA Best-Interest Notes"
              value={record.mcaBestInterestNotes}
              sx={{ gridColumn: { sm: 'span 2' } }}
            />
          )}
        </Box>
      </Card>
    </Box>
  );
}

function DetailItem({ label, value, sx }) {
  const content = value === null || value === undefined || value === '' ? '—' : value;

  return (
    <Stack spacing={0.5} sx={sx}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
        {content}
      </Typography>
    </Stack>
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