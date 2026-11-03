import PropTypes from 'prop-types';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { useParams, usePathname, useRouter } from 'src/routes/hooks';
import { useGetCompetencyByIdQuery } from 'src/store/Reducer/competencies-api';

function DetailItem({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Stack>
  );
}

DetailItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

function formatBoolean(value) {
  return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : '—';
}

function formatDuration(value, unit) {
  if (value == null) return '—';
  return `${value} ${unit}${value === 1 ? '' : 's'}`;
}

function capitalizeFirstLetter(value) {
  if (typeof value !== 'string' || !value) return '—';
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export default function RequirementDetailView() {
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { organizationId } = useCurrentOrganization();

  const isSiteManager = pathname.startsWith(paths.siteManager.root);
  const isOwner = pathname.startsWith(paths.owner.root);
  const requirementsPath = isSiteManager
    ? paths.siteManager.requirements
    : isOwner
      ? paths.owner.requirements
      : paths.lineManager.requirements;

  const { currentData: requirement, isLoading, isError, error } = useGetCompetencyByIdQuery(
    { organizationId, requirementId: id },
    { skip: !organizationId || !id }
  );

  const jobTitles = Array.isArray(requirement?.jobTitles) ? requirement.jobTitles : [];
  const departments = Array.isArray(requirement?.departments) ? requirement.departments : [];
  const assignments = Array.isArray(requirement?.assignments) ? requirement.assignments : [];

  if (isLoading) {
    return (
      <DashboardContent>
        <LoadingScreen sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  if (isError || !requirement) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button
            color="primary"
            onClick={() => router.push(requirementsPath)}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            Back
          </Button>
        </Box>
        {isError ? (
          <Alert severity="error">
            {error?.data?.message || error?.error || 'Failed to load requirement details.'}
          </Alert>
        ) : (
          <EmptyContent
            filled
            title="Requirement not found"
            description="Could not load the requested requirement details."
            sx={{ py: 10 }}
          />
        )}
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box sx={{ mb: 2 }}>
        <Button
          color="primary"
          onClick={() => router.push(requirementsPath)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
        >
          Back
        </Button>
      </Box>

      <Card sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">{requirement.name || 'Requirement'}</Typography>
            {requirement.type && (
              <Chip
                label={requirement.type}
                size="small"
                color={requirement.type === 'competency' ? 'info' : 'success'}
                sx={{ textTransform: 'capitalize' }}
              />
            )}
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <DetailItem label="Renewal interval" value={formatDuration(requirement.renewalMonths, 'month')} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DetailItem
                label="First completion"
                value={formatDuration(requirement.firstCompletionDays, 'day')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DetailItem
                label="Amber period"
                value={formatDuration(requirement.amberDaysOverride, 'day')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DetailItem label="Evidence required" value={formatBoolean(requirement.evidenceRequired)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DetailItem
                label="Staff evidence allowed"
                value={formatBoolean(requirement.staffEvidenceAllowed)}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Applicable job titles
                </Typography>
                {jobTitles.length ? (
                  <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
                    {jobTitles.map((jobTitle) => (
                      <Chip key={jobTitle._id} label={jobTitle.name} size="small" variant="soft" />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" fontWeight={600}>
                    —
                  </Typography>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Applicable departments
                </Typography>
                {departments.length ? (
                  <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
                    {departments.map((department) => (
                      <Chip key={department._id} label={department.name} size="small" variant="soft" />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" fontWeight={600}>
                    —
                  </Typography>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Card>

      <Card sx={{ mt: 3 }}>
        <Box sx={{ p: 2.5 }}>
          <Typography variant="h6">Assigned staff</Typography>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 480 }}>
            <TableHead>
              <TableRow>
                <TableCell>Staff member</TableCell>
                <TableCell>Job title</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.length ? (
                assignments.map((assignment, index) => (
                  <TableRow key={assignment.assignmentId || assignment._id || index} hover>
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography variant="body2">{capitalizeFirstLetter(assignment.staff?.name)}</Typography>
                        {assignment.staff?.email && (
                          <Typography variant="caption" color="text.secondary">
                            {assignment.staff.email}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>{assignment.staff?.jobTitle?.name || '—'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ color: 'text.secondary' }}>
                    No staff assigned
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </DashboardContent>
  );
}
