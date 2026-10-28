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
import { fDateTime } from 'src/utils/format-time';
import { useGetSupervisionByIdQuery } from 'src/store/Reducer/supervision-api';

import LogSessionDialog from '../log-session-dialog';
import { CompleteSupervisionDialog } from '../complete-supervision-dialog';
import { SessionSignOffDialog } from '../../common/session-sign-off-dialog';
import { STATUS_LABEL_COLOR, STATUS_LABEL_TEXT } from '../supervision-table-row';

// ----------------------------------------------------------------------

export default function SupervisionDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { organizationId } = useCurrentOrganization();

  const logModal = useBoolean();
  const completeModal = useBoolean();
  const signOffModal = useBoolean();

  const {
    data: supervisionData,
    isLoading,
    isError,
    refetch,
  } = useGetSupervisionByIdQuery(
    { organizationId, supervisionId: id },
    { skip: !organizationId || !id }
  );

  const supervision = supervisionData?.data || supervisionData;

  const dashboardRoutes = useMemo(() => {
    if (pathname.startsWith('/site-manager')) {
      return {
        dashboardName: 'Dashboard',
        dashboardHref: paths.siteManager.root,
        supervisionHref: paths.siteManager.supervision,
        signOffHref: paths.siteManager.supervisionSignOff(id),
      };
    }
    if (pathname.startsWith('/owner-dashboard')) {
      return {
        dashboardName: 'Dashboard',
        dashboardHref: paths.owner.root,
        supervisionHref: paths.owner.supervision,
        signOffHref: paths.owner.supervisionSignOff(id),
      };
    }
    return {
      dashboardName: 'Dashboard',
      dashboardHref: paths.lineManager.root,
      supervisionHref: paths.lineManager.supervision,
      signOffHref: paths.lineManager.supervisionSignOff(id),
    };
  }, [pathname, id]);

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button color="primary" onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
            Back
          </Button>
        </Box>
        <LoadingScreen sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  if (isError || !supervision) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button color="primary" onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
            Back
          </Button>
        </Box>
        <EmptyContent
          filled
          title="Supervision session not found"
          description="Could not load the requested supervision session details."
          action={
            <Button variant="contained" onClick={() => router.push(dashboardRoutes.supervisionHref)}>
              Return to Supervisions
            </Button>
          }
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  const staff = supervision.staff || supervision.staffProfile || supervision.staffUser || {};
  const staffName = staff.name || supervision.staffName || supervision.name || '—';
  const staffEmail = staff.email || supervision.email || '—';
  const staffCode = staff.employeeCode || supervision.employeeCode || '';
  const staffAvatar = staff.image || supervision.image || '';
  const branchName = supervision.branch?.name || staff.branch?.name || '';
  const conductedBy = supervision.conductedBy || '—';
  const status = supervision.status || 'scheduled';
  const isScheduled = status === 'scheduled';
  const isCompleted = status === 'completed';
  const isSignedOff = Boolean(supervision.signedOff || supervision.signature);
  const topics = supervision.topics || [];
  const actionPoints = supervision.actionPoints || [];

  return (
    <DashboardContent>
      <Box sx={{ mb: 2 }}>
        <Button color="primary" onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      {/* Top Breadcrumbs & Actions */}
      <CustomBreadcrumbs
        heading="Supervision details"
        links={[
          { name: dashboardRoutes.dashboardName, href: dashboardRoutes.dashboardHref },
          { name: 'Supervision', href: dashboardRoutes.supervisionHref },
          { name: staffName },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            {isScheduled && !pathname.startsWith('/line-manager') && (
              <Button
                variant="contained"
                color="success"
                startIcon={<Iconify icon="solar:check-circle-bold" />}
                onClick={completeModal.onTrue}
              >
                Complete session
              </Button>
            )}
            <Button
              variant={isScheduled ? 'outlined' : 'contained'}
              color="primary"
              startIcon={<Iconify icon={isScheduled ? 'solar:calendar-mark-bold' : 'solar:calendar-add-bold'} />}
              onClick={logModal.onTrue}
            >
              {isScheduled ? 'Reschedule supervision' : 'Book supervision'}
            </Button>

            {isCompleted && (
              <Button
                variant={isSignedOff ? 'outlined' : 'contained'}
                color="primary"
                startIcon={<Iconify icon={isSignedOff ? 'solar:document-text-bold' : 'solar:pen-bold'} />}
                onClick={() => router.push(dashboardRoutes.signOffHref)}
              >
                {isSignedOff ? 'View signed document' : 'Sign off session'}
              </Button>
            )}

            {!isCompleted && (
              <Button
                variant={isScheduled ? 'outlined' : 'contained'}
                color="primary"
                startIcon={<Iconify icon={isScheduled ? 'solar:calendar-mark-bold' : 'solar:calendar-add-bold'} />}
                onClick={logModal.onTrue}
              >
                {isScheduled ? 'Reschedule supervision' : 'Book supervision'}
              </Button>
            )}
          </Stack>
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
              color={STATUS_LABEL_COLOR[status] || 'default'}
              sx={{ px: 1.5, py: 0.75, textTransform: 'capitalize' }}
            >
              {STATUS_LABEL_TEXT[status] || status}
            </Label>
            {supervision.scheduledAt && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Scheduled:{' '}
                <Box component="span" sx={{ textTransform: 'capitalize' }}>
                  {fDateTime(supervision.scheduledAt)}
                </Box>
              </Typography>
            )}
            {supervision.completedAt && (
              <Typography variant="caption" sx={{ color: 'success.main' }}>
                Completed:{' '}
                <Box component="span" sx={{ textTransform: 'capitalize' }}>
                  {fDateTime(supervision.completedAt)}
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
              {supervision.scheduledAt ? fDateTime(supervision.scheduledAt) : '—'}
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
              Location
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5, textTransform: 'capitalize' }}>
              {supervision.locationLabel || 'Office'}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
              Created At
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5, textTransform: 'capitalize' }}>
              {supervision.createdAt ? fDateTime(supervision.createdAt) : '—'}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Topics Discussed */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize' }}>
          Topics Discussed
        </Typography>
        {topics.length > 0 ? (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {topics.map((topic, index) => (
              <Chip
                key={index}
                label={topic}
                color="info"
                variant="soft"
                sx={{ textTransform: 'capitalize' }}
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            No topics listed
          </Typography>
        )}
      </Card>

      {/* Meeting Notes */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1.5, textTransform: 'capitalize' }}>
          Meeting Notes
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: supervision.notes ? 'text.primary' : 'text.secondary',
            whiteSpace: 'pre-line',
            lineHeight: 1.7,
            textTransform: 'capitalize',
          }}
        >
          {supervision.notes || 'No meeting notes provided.'}
        </Typography>
      </Card>

      {/* Action Points */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize' }}>
          Action Points ({actionPoints.length})
        </Typography>

        {actionPoints.length > 0 ? (
          <Stack spacing={2} divider={<Divider />}>
            {actionPoints.map((point, index) => {
              const text = typeof point === 'string' ? point : point.text;
              const signedOff = typeof point === 'object' && point.signedOffAt;
              const signedOffBy = typeof point === 'object' ? point.signedOffBy : '';

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
                        Signed off on {fDateTime(point.signedOffAt)}
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
            No action points recorded for this session.
          </Typography>
        )}
      </Card>

      {/* Formal Signed Off Document Card */}
      {(supervision.signature || supervision.signedOff) && (
        <Card sx={{ p: 3, mt: 3, border: (theme) => `1px solid ${theme.palette.success.light}` }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6">Formal Electronic Sign-Off</Typography>
              <Typography variant="caption" color="text.secondary">
                Document recorded with valid electronic verification
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="solar:eye-bold" />}
              onClick={() => router.push(dashboardRoutes.signOffHref)}
            >
              View Document
            </Button>
          </Stack>

          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: 'background.neutral',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle2">
                Signed by: {supervision.signedOffBy || 'Manager'}
              </Typography>
              {supervision.signerRole && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Role: {supervision.signerRole}
                </Typography>
              )}
              {supervision.signedOffAt && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Date: {fDateTime(supervision.signedOffAt)}
                </Typography>
              )}
            </Box>

            {supervision.signature && (
              <Box
                component="img"
                src={supervision.signature}
                alt="Electronic Signature"
                sx={{
                  maxHeight: 70,
                  maxWidth: 200,
                  objectFit: 'contain',
                  bgcolor: '#ffffff',
                  p: 0.5,
                  borderRadius: 1,
                  border: '1px solid #e2e8f0',
                }}
              />
            )}
          </Box>
        </Card>
      )}

      {/* Reschedule / Book Dialog */}
      <LogSessionDialog
        open={logModal.value}
        row={supervision}
        organizationId={organizationId}
        onClose={logModal.onFalse}
        onSave={() => {
          logModal.onFalse();
          refetch();
        }}
      />

      {/* Complete Dialog */}
      <CompleteSupervisionDialog
        open={completeModal.value}
        row={supervision}
        organizationId={organizationId}
        onClose={completeModal.onFalse}
        onSave={() => {
          completeModal.onFalse();
          refetch();
        }}
      />

      {/* Formal Sign-Off Dialog */}
      <SessionSignOffDialog
        open={signOffModal.value}
        onClose={signOffModal.onFalse}
        session={supervision}
        organizationId={organizationId}
        type="supervision"
        onSave={() => {
          refetch();
          signOffModal.onFalse();
        }}
        readOnly={isSignedOff}
      />
    </DashboardContent>
  );
}