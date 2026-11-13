import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
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
import { DashboardContent } from 'src/layouts/dashboard';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetMemberQuery } from 'src/store/Reducer/members-api';

import {
  getMemberPermissionLabels,
  getMemberRoleLabel,
  getMemberStatusMeta,
} from '../mocks/data';
import { MemberDetailSkeleton } from '../member-detail-skeleton';
import { useMemberActions } from '../use-member-actions';
import { MemberActionDialog } from '../member-action-dialog';
import { canEditMember } from '../utils';

// ----------------------------------------------------------------------

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

// ----------------------------------------------------------------------

export function MemberDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const { organizationId } = useCurrentOrganization();

  const { askDeactivate, confirmProps } = useMemberActions({ organizationId });

  const { data: member, isLoading } = useGetMemberQuery(
    { membershipId: id, organizationId },
    { skip: !id || !organizationId }
  );

  if (isLoading) {
    return <MemberDetailSkeleton />;
  }

  if (!member) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button
            color="primary"
            onClick={() => router.push(paths.owner.memberships.members.root)}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            Back
          </Button>
        </Box>
        <EmptyContent filled title="Member not found" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  const rawName = member.name || member.user?.name || '—';
  const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const email = member.email || member.user?.email || '';
  const status = getMemberStatusMeta(member.status);
  const permissionLabels = getMemberPermissionLabels(member.permissions);
  const roleLabel = getMemberRoleLabel(member.role);
  const branchName = member.branch?.name || '—';
  const jobTitleName = member.jobTitle?.name || '—';
  const departmentNames =
    (member.departments || []).map((department) => department.name).filter(Boolean).join(', ') || '—';
  const employeeCode = member.staffProfile?.employeeCode || '';
  const isActive = member.status === 'active';
  const showEdit = canEditMember(member);

  return (
    <DashboardContent>
      <Box sx={{ mb: 2 }}>
        <Button color="primary" onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={name}
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Members', href: paths.owner.memberships.members.root },
          { name },
        ]}
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
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

            {showEdit && (
              <Button
                component={RouterLink}
                href={paths.owner.memberships.members.edit(member._id)}
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="solar:pen-bold" />}
              >
                Edit
              </Button>
            )}
          </Stack>
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
            alt={name}
            src={member.user?.profileIcon || undefined}
            sx={{ width: 72, height: 72, typography: 'h4', bgcolor: 'primary.main', color: 'white' }}
          >
            {getInitials(name)}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>
              {name}
            </Typography>

            {email && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                {email}
              </Typography>
            )}

            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mt: 1.25 }}>
              <Label variant="soft" color={status.color} sx={{ textTransform: 'capitalize' }}>
                {status.label}
              </Label>
              <Label variant="soft" color="default" sx={{ textTransform: 'capitalize' }}>
                {roleLabel}
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
          icon="solar:buildings-2-bold"
          label="Site"
          value={branchName}
        />
        <SummaryTile
          icon="solar:case-round-bold"
          label="Job title"
          value={jobTitleName}
        />
        <SummaryTile
          icon="solar:calendar-date-bold"
          label="Start date"
          value={fDate(member.startDate || member.staffProfile?.startDate) || '—'}
          capitalize={false}
        />
      </Box>

      <Card sx={{ p: { xs: 2.5, md: 3 }, mb: 2.5 }}>
        <Typography variant="h6">Member details</Typography>
        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'grid',
            rowGap: 2,
            columnGap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          }}
        >
          <DetailItem label="Name" value={name} capitalize />
          <DetailItem label="Email" value={email || '—'} />
          <DetailItem label="Role" value={roleLabel} capitalize />
          <DetailItem label="Site" value={branchName} capitalize />
          <DetailItem label="Job title" value={jobTitleName} capitalize />
          <DetailItem label="Departments" value={departmentNames} capitalize />
        </Box>
      </Card>

      <Card sx={{ p: { xs: 2.5, md: 3 }, mb: 2.5 }}>
        <Typography variant="h6">Permissions</Typography>
        <Divider sx={{ my: 2 }} />
        {permissionLabels.length ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {permissionLabels.map((label) => (
              <Chip key={label} label={label} size="small" variant="soft" color="primary" />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No permissions assigned.
          </Typography>
        )}
      </Card>

      <Card sx={{ p: { xs: 2.5, md: 3 } }}>
        <Typography variant="h6">Membership</Typography>
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
          <DetailItem label="Organization" value={member.organization?.name || '—'} capitalize />
          <DetailItem label="Deactivated at" value={fDateTime(member.deactivatedAt)} />
          <DetailItem label="Employee code" value={employeeCode || '—'} />
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 4 }}
          sx={{ color: 'text.secondary' }}
        >
          <Typography variant="caption">Created {fDateTime(member.createdAt)}</Typography>
          <Typography variant="caption">Updated {fDateTime(member.updatedAt)}</Typography>
        </Stack>
      </Card>

      <MemberActionDialog {...confirmProps} />
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
