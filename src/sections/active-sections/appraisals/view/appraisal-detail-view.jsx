import { useMemo } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { LoadingScreen } from 'src/components/loading-screen';
import { useBoolean } from 'src/hooks/use-boolean';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { useParams, useRouter, usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fDateTime, fDate } from 'src/utils/format-time';
import { useGetAppraisalByIdQuery } from 'src/store/Reducer/appraisals-api';

import { BookAppraisalDialog } from '../book-appraisal-dialog';
import { APPRAISAL_STATUS_COLOR, APPRAISAL_STATUS_LABEL } from '../appraisal-table-row';

// ----------------------------------------------------------------------

export default function AppraisalDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { organizationId } = useCurrentOrganization();

  const bookModal = useBoolean();

  const {
    data: appraisalData,
    isLoading,
    isError,
    refetch,
  } = useGetAppraisalByIdQuery(
    { organizationId, appraisalId: id },
    { skip: !organizationId || !id }
  );

  const appraisal = appraisalData?.data || appraisalData;

  const dashboardRoutes = useMemo(() => {
    if (pathname.startsWith('/site-manager')) {
      return {
        dashboardName: 'Dashboard',
        dashboardHref: paths.siteManager.root,
        appraisalHref: paths.siteManager.appraisal,
      };
    }
    if (pathname.startsWith('/owner-dashboard')) {
      return {
        dashboardName: 'Dashboard',
        dashboardHref: paths.owner.root,
        appraisalHref: paths.owner.appraisal,
      };
    }
    return {
      dashboardName: 'Dashboard',
      dashboardHref: paths.lineManager.root,
      appraisalHref: paths.lineManager.appraisal,
    };
  }, [pathname]);

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
            Back
          </Button>
        </Box>
        <LoadingScreen sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  if (isError || !appraisal) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
            Back
          </Button>
        </Box>
        <EmptyContent
          filled
          title="Appraisal record not found"
          description="Could not load the requested appraisal details."
          action={
            <Button variant="contained" onClick={() => router.push(dashboardRoutes.appraisalHref)}>
              Return to Appraisals
            </Button>
          }
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  const staff = appraisal.staff || appraisal.staffProfile || appraisal.staffUser || {};
  const staffName = staff.name || appraisal.staffName || appraisal.name || '—';
  const staffEmail = staff.email || appraisal.email || '—';
  const staffCode = staff.employeeCode || appraisal.employeeCode || '';
  const staffAvatar = staff.image || appraisal.image || '';
  const branchName = appraisal.branch?.name || staff.branch?.name || '';
  const conductedBy =
    appraisal.conductedBy ||
    appraisal.conductedByName ||
    appraisal.reviewerName ||
    '—';

  const status = appraisal.status || appraisal.badge || 'scheduled';
  const isScheduled = status === 'scheduled' || status === 'booked';
  const isCompleted = status === 'completed';

  const topics = appraisal.topics || appraisal.competencies || [];
  const actionPoints = appraisal.actionPoints || appraisal.objectives || [];

  return (
    <DashboardContent>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      {/* Top Breadcrumbs & Actions */}
      <CustomBreadcrumbs
        heading="Appraisal details"
        links={[
          { name: dashboardRoutes.dashboardName, href: dashboardRoutes.dashboardHref },
          { name: 'Appraisals', href: dashboardRoutes.appraisalHref },
          { name: staffName },
        ]}
        action={
          !isCompleted ? (
            <Stack direction="row" spacing={1}>
              <Button
                variant={isScheduled ? 'outlined' : 'contained'}
                color="primary"
                startIcon={<Iconify icon={isScheduled ? 'solar:calendar-mark-bold' : 'solar:calendar-add-bold'} />}
                onClick={bookModal.onTrue}
              >
                {isScheduled ? 'Reschedule appraisal' : 'Book appraisal'}
              </Button>
            </Stack>
          ) : null
        }
        sx={{ mb: 3 }}
      />

      {/* Staff & Session Header Card */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2.5}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Avatar alt={staffName} src={staffAvatar} sx={{ width: 64, height: 64 }}>
              {staffName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                {staffName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {/* Email preserved without capitalization */}
                {staffEmail}
              </Typography>
              {(staffCode || branchName) && (
                <Stack direction="row" spacing={1} alignItems="center">
                  {staffCode && (
                    <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'capitalize' }}>
                      Code: {staffCode}
                    </Typography>
                  )}
                  {staffCode && branchName && (
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      •
                    </Typography>
                  )}
                  {branchName && (
                    <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'capitalize' }}>
                      Branch: {branchName}
                    </Typography>
                  )}
                </Stack>
              )}
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: 'row', md: 'column' }}
            spacing={{ xs: 1.5, md: 0.75 }}
            alignItems={{ xs: 'center', md: 'flex-end' }}
          >
            <Label
              variant="soft"
              color={APPRAISAL_STATUS_COLOR[status] || 'default'}
              sx={{ px: 1.5, py: 0.75, textTransform: 'capitalize' }}
            >
              {APPRAISAL_STATUS_LABEL[status] || status}
            </Label>
            {appraisal.scheduledAt && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Scheduled:{' '}
                <Box component="span" sx={{ textTransform: 'capitalize' }}>
                  {fDateTime(appraisal.scheduledAt)}
                </Box>
              </Typography>
            )}
            {appraisal.completedAt && (
              <Typography variant="caption" sx={{ color: 'success.main' }}>
                Completed:{' '}
                <Box component="span" sx={{ textTransform: 'capitalize' }}>
                  {fDateTime(appraisal.completedAt)}
                </Box>
              </Typography>
            )}
          </Stack>
        </Stack>
      </Card>

      {/* Summary Tiles Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
              Scheduled At
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5, textTransform: 'capitalize' }}>
              {appraisal.scheduledAt ? fDateTime(appraisal.scheduledAt) : (appraisal.nextDueAt ? fDate(appraisal.nextDueAt) : '—')}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
              Review Period / Kind
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5, textTransform: 'capitalize' }}>
              {appraisal.period || appraisal.periodLabel || appraisal.kind || 'Annual Review'}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
              Conducted By
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5, textTransform: 'capitalize' }}>
              {conductedBy}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
              Created At
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5, textTransform: 'capitalize' }}>
              {appraisal.createdAt ? fDateTime(appraisal.createdAt) : '—'}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Review Topics / Competencies */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize' }}>
          Review Topics & Competencies
        </Typography>
        {topics.length > 0 ? (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {topics.map((topic, index) => (
              <Chip
                key={index}
                label={typeof topic === 'string' ? topic : (topic.name || topic.title)}
                color="info"
                variant="soft"
                sx={{ textTransform: 'capitalize' }}
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            No specific review topics recorded.
          </Typography>
        )}
      </Card>

      {/* Review & Performance Notes */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1.5, textTransform: 'capitalize' }}>
          Review Notes
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: appraisal.notes ? 'text.primary' : 'text.secondary',
            whiteSpace: 'pre-line',
            lineHeight: 1.7,
            textTransform: 'capitalize',
          }}
        >
          {appraisal.notes || 'No review notes provided.'}
        </Typography>
      </Card>

      {/* Action Points / Objectives */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize' }}>
          Action Points & Objectives ({actionPoints.length})
        </Typography>

        {actionPoints.length > 0 ? (
          <Stack spacing={2} divider={<Divider />}>
            {actionPoints.map((point, index) => {
              const text = typeof point === 'string' ? point : (point.text || point.description || point.goal);
              const signedOff = typeof point === 'object' && (point.signedOffAt || point.completed || point.isDone);
              const signedOffBy = typeof point === 'object' ? (point.signedOffBy || point.completedBy) : '';

              return (
                <Stack key={point._id || index} direction="row" spacing={1.5} alignItems="flex-start">
                  <Iconify
                    icon={signedOff ? 'solar:check-circle-bold' : 'solar:record-circle-bold'}
                    sx={{
                      width: 22,
                      height: 22,
                      color: signedOff ? 'success.main' : 'warning.main',
                      mt: 0.25,
                      flexShrink: 0,
                    }}
                  />
                  <Stack spacing={0.5}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        color: signedOff ? 'text.disabled' : 'text.primary',
                        textDecoration: signedOff ? 'line-through' : 'none',
                      }}
                    >
                      {text}
                    </Typography>
                    {signedOff && (
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        Signed off
                        {point.signedOffAt ? ` on ${fDateTime(point.signedOffAt)}` : ''}
                        {signedOffBy ? ` by ${signedOffBy}` : ''}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            No action points or objectives recorded for this appraisal.
          </Typography>
        )}
      </Card>

      {/* Book / Reschedule Dialog */}
      <BookAppraisalDialog
        open={bookModal.value}
        row={appraisal}
        organizationId={organizationId}
        onClose={bookModal.onFalse}
        onSave={() => {
          bookModal.onFalse();
          refetch();
        }}
      />
    </DashboardContent>
  );
}