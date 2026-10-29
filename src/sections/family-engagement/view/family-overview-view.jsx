import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';
import { CONFIG } from 'src/config-global';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { useRouter } from 'src/routes/hooks';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetFamilyOverviewQuery } from 'src/store/Reducer/family-overview-api';

import { FamilyActivityCard } from '../family-activity-card';
import { FamilyDashboardCards } from '../family-dashboard-cards';
import { FamilyIssueChecklist } from '../family-issue-checklist';
import { useFamilyEngagementPaths } from '../hooks/use-family-engagement-paths';

// ----------------------------------------------------------------------

const iconUrl = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

const PERIOD_OPTIONS = [
  { value: '7', label: 'Last 7 days', days: 7, heading: 'LAST 7 DAYS' },
  { value: '30', label: 'Last 30 days', days: 30, heading: 'LAST 30 DAYS' },
  { value: '90', label: 'Last 90 days', days: 90, heading: 'LAST 90 DAYS' },
  { value: 'all', label: 'All time', days: null, heading: 'ALL TIME' },
];

const CHECKLIST_COPY = {
  moderation: (item) =>
    item.count > 0 ? `Clear the moderation queue (${item.count})` : 'Clear the moderation queue',
  noContent: (item) =>
    `Check the ${item.count} resident${item.count === 1 ? '' : 's'} with no content`,
  generate: (item) =>
    item.count > 0 ? `Generate all gazettes and review (${item.count})` : 'Generate all gazettes and review',
  printAndGive: () => 'Print and give to residents',
};

const metricCardSx = (clickable) => (theme) => ({
  ...(clickable ? { cursor: 'pointer' } : {}),
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.customShadows?.z8 || theme.shadows[4],
  },
});

function getClosesLabel(gazette) {
  if (!gazette?.scheduled && gazette?.closesInDays == null) {
    return gazette?.state || 'no open issue';
  }

  const days = gazette?.closesInDays;
  if (days == null) return gazette?.state || 'no open issue';
  if (days === 0) return 'closes today';
  if (days === 1) return 'closes in 1 day';
  return `closes in ${days} days`;
}

function mapChecklist(items = [], issueNumber) {
  return items.map((item, index) => ({
    id: item.key || `checklist-${index}`,
    stepNumber: index + 1,
    text: CHECKLIST_COPY[item.key]
      ? CHECKLIST_COPY[item.key](item, issueNumber)
      : item.key,
    completed: !!item.done,
  }));
}

// ----------------------------------------------------------------------

export function FamilyOverviewView() {
  const theme = useTheme();
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();
  const { organizationId, isOwner, user } = useCurrentOrganization();

  const siteManagerBranchId = user?.branchId || user?.branch?._id || '';
  const [ownerBranchId, setOwnerBranchId] = useState('');
  const [period, setPeriod] = useState('7');

  const branchId = isOwner ? ownerBranchId : siteManagerBranchId;
  const selectedPeriod = PERIOD_OPTIONS.find((option) => option.value === period) || PERIOD_OPTIONS[0];

  const { data: branchesData, isLoading: branchesLoading } = useGetBranchesQuery(
    { organizationId, page: 1, limit: 100 },
    { skip: !isOwner || !organizationId }
  );
  const branches = branchesData?.data ?? [];

  useEffect(() => {
    if (!isOwner || !branches.length) return;
    if (!ownerBranchId || !branches.some((branch) => branch._id === ownerBranchId)) {
      setOwnerBranchId(branches[0]._id);
    }
  }, [branches, isOwner, ownerBranchId]);

  const waitingForBranch = isOwner && (branchesLoading || (branches.length > 0 && !branchId));

  const { data, isLoading, isFetching, isError } = useGetFamilyOverviewQuery(
    {
      organizationId,
      ...(branchId ? { branchId } : {}),
      ...(selectedPeriod.days != null ? { days: selectedPeriod.days } : {}),
    },
    { skip: !organizationId || waitingForBranch || (!isOwner && !branchId) }
  );

  const selectedBranchName =
    branches.find((branch) => branch._id === branchId)?.name || user?.branch?.name || '';
  const siteName = data?.site?.name || selectedBranchName;
  const stats = data?.stats || {};
  const gazette = data?.gazette;
  const issueNumber = gazette?.number ? `Issue ${gazette.number}` : 'Issue';
  const checklistTasks = useMemo(
    () => mapChecklist(data?.checklist || [], issueNumber),
    [data?.checklist, issueNumber]
  );

  const showInitialLoad = (isLoading || waitingForBranch) && !data;

  return (
    <>
      <Helmet>
        <title>{`Family Overview | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent maxWidth="xl">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: { xs: 3, md: 5 } }}
        >
          <Box>
            <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
              Family overview
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {data?.site?.name || siteName}
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: 1, md: 'auto' } }}>
            {isOwner && (
              <TextField
                select
                size="small"
                label="Site"
                value={ownerBranchId}
                onChange={(event) => setOwnerBranchId(event.target.value)}
                disabled={!branches.length}
                sx={{ minWidth: { xs: 1, sm: 220 } }}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch._id} value={branch._id} sx={{ textTransform: 'capitalize' }}>
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              select
              size="small"
              label="Period"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              sx={{ minWidth: { xs: 1, sm: 180 } }}
            >
              {PERIOD_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        {showInitialLoad ? (
          <LoadingScreen sx={{ minHeight: 360 }} />
        ) : !isOwner && !branchId ? (
          <EmptyContent filled title="No site assigned to this account" sx={{ py: 10 }} />
        ) : isError && !data ? (
          <EmptyContent filled title="Unable to load family overview" sx={{ py: 10 }} />
        ) : (
          <Box sx={{ opacity: isFetching ? 0.72 : 1, transition: 'opacity 0.2s ease' }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid xs={12} sm={6} md={3}>
                <CourseWidgetSummary
                  title="uploads waiting"
                  total={stats.uploadsWaiting ?? 0}
                  color="warning"
                  icon={iconUrl('ic-file')}
                  onClick={() => router.push(familyPaths.moderation)}
                  sx={metricCardSx(true)(theme)}
                />
              </Grid>

              <Grid xs={12} sm={6} md={3}>
                <CourseWidgetSummary
                  title="residents with a family"
                  total={stats.residentsWithFamily ?? 0}
                  color="primary"
                  icon={iconUrl('ic-users')}
                  sx={metricCardSx(false)(theme)}
                />
              </Grid>

              <Grid xs={12} sm={6} md={3}>
                <CourseWidgetSummary
                  title={getClosesLabel(gazette)}
                  total={gazette?.number ? `Issue ${gazette.number}` : '—'}
                  color="info"
                  icon={iconUrl('ic-calendar')}
                  onClick={() => router.push(familyPaths.gazettes)}
                  sx={metricCardSx(true)(theme)}
                />
              </Grid>

              <Grid xs={12} sm={6} md={3}>
                <CourseWidgetSummary
                  title="residents with no content"
                  total={stats.residentsWithNoContent ?? 0}
                  color="error"
                  icon={iconUrl('ic-document')}
                  onClick={() => router.push(familyPaths.gazettes)}
                  sx={metricCardSx(true)(theme)}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid xs={12} md={6}>
                <FamilyDashboardCards navigationPaths={familyPaths} />
              </Grid>

              <Grid xs={12} md={6}>
                <FamilyActivityCard
                  activity={data?.activity}
                  periodLabel={selectedPeriod.heading}
                  onOpenModeration={() => router.push(familyPaths.moderation)}
                  onOpenNewPost={() => router.push(familyPaths.communityWall)}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid xs={12}>
                <FamilyIssueChecklist issueNumber={issueNumber} tasks={checklistTasks} />
              </Grid>
            </Grid>
          </Box>
        )}
      </DashboardContent>
    </>
  );
}

export default FamilyOverviewView;
