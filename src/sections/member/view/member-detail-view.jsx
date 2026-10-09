import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

import { getOwnerOrganizationId } from 'src/sections/branch/utils';
import { useGetMemberQuery } from 'src/store/Reducer/members-api';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useParams, useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

import { fDate, fDateTime } from 'src/utils/format-time';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

import {
  getMemberPermissionLabels,
  getMemberRoleLabel,
  getMemberStatusMeta,
} from '../mocks/data';
import { useMemberActions } from '../use-member-actions';
import { MemberActionDialog } from '../member-action-dialog';

// ----------------------------------------------------------------------

export function MemberDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useSelector((state) => state.user);
  const organizationId = getOwnerOrganizationId(user);

  const [, setReloadKey] = useState(0);
  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  const { askDeactivate, confirmProps } = useMemberActions({ onChanged: refresh });

  const {
    data: member,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMemberQuery(
    { membershipId: id, organizationId },
    { skip: !id || !organizationId }
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Retry
            </Button>
          }
        >
          {error?.data?.message || 'Unable to load member details.'}
        </Alert>
      </Box>
    );
  }

  if (!member) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(paths.owner.memberships.members.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Member not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  const status = getMemberStatusMeta(member.status);
  const permissionLabels = getMemberPermissionLabels(member.permissions);
  const departmentNames = (member.departments || []).map((dep) => dep.name).join(', ');
  const isActive = member.status === 'active';

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={member.name}
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Members', href: paths.owner.memberships.members.root },
          { name: member.name },
        ]}
        action={
          <Stack direction="row" spacing={1.5}>
            {isActive && (
              <Button
                color="error"
                variant="outlined"
                onClick={() => askDeactivate(member)}
                startIcon={<Iconify icon="solar:user-block-bold" />}
              >
                Deactivate
              </Button>
            )}

            <Button
              component={RouterLink}
              href={paths.owner.memberships.members.edit(member._id)}
              variant="contained"
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Edit
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <DetailCard title="Member details">
          <DetailItem label="Name" value={member.name} />
          <DetailItem label="Email" value={member.email} />
          <DetailItem label="Role" value={getMemberRoleLabel(member.role)} />
          <DetailItem
            label="Status"
            value={
              <Label variant="soft" color={status.color}>
                {status.label}
              </Label>
            }
          />
          <DetailItem label="Site" value={member.branch?.name || '—'} />
          <DetailItem label="Job title" value={member.jobTitle?.name || '—'} />
          <DetailItem label="Departments" value={departmentNames || '—'} />
          <DetailItem label="Start date" value={fDate(member.startDate)} />
        </DetailCard>

        <Card sx={{ p: 3 }}>
          <Typography variant="h6">Permissions</Typography>
          <Divider sx={{ my: 2 }} />
          {permissionLabels.length ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {permissionLabels.map((label) => (
                <Chip key={label} label={label} size="small" variant="soft" />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No permissions assigned.
            </Typography>
          )}
        </Card>

        <DetailCard title="Membership">
          <DetailItem label="Organization" value={member.organization?.name || '—'} />
          <DetailItem label="Deactivated at" value={fDateTime(member.deactivatedAt)} />
          <DetailItem label="Created at" value={fDateTime(member.createdAt)} />
          <DetailItem label="Updated at" value={fDateTime(member.updatedAt)} />
        </DetailCard>
      </Stack>

      <MemberActionDialog {...confirmProps} />
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
