import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData } from 'src/components/table';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { DashboardContent } from 'src/layouts/dashboard';
import { useParams, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fDate } from 'src/utils/format-time';

import LogAppraisalDialog from '../log-appraisal-dialog';
import {
  _mockAppraisals,
  _mockAppraisalSessions,
  logTeamAppraisalReview,
  signOffAppraisalActionPoint,
} from '../mocks/data';

// ----------------------------------------------------------------------

const STATUS_COLOR = {
  overdue: 'error',
  due_soon: 'warning',
  completed: 'success',
  scheduled: 'info',
};

const STATUS_LABEL = {
  overdue: 'Overdue',
  due_soon: 'Due Soon',
  completed: 'Completed',
  scheduled: 'Scheduled',
};

const TABLE_HEAD = [
  { id: 'expand', label: '', width: 48 },
  { id: 'date', label: 'Review Date', width: 140 },
  { id: 'period', label: 'Review Period', minWidth: 180 },
  { id: 'conductedBy', label: 'Conducted By', minWidth: 160 },
  { id: 'actionPoints', label: 'Action Points', minWidth: 160 },
  { id: 'status', label: 'Status', align: 'center', width: 130 },
];

// ----------------------------------------------------------------------

export default function AppraisalDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const logModal = useBoolean();

  const [reloadKey, setReloadKey] = useState(0);

  const staff = useMemo(
    () => _mockAppraisals.find((item) => item.id === id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, reloadKey]
  );

  const sessions = useMemo(
    () =>
      _mockAppraisalSessions
        .filter((session) => session.staffId === id)
        .sort((a, b) => dayjs(b.sessionDate).valueOf() - dayjs(a.sessionDate).valueOf()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, reloadKey]
  );

  const handleSaveReview = (reviewData) => {
    logTeamAppraisalReview(id, reviewData);
    setReloadKey((key) => key + 1);
    toast.success(`Appraisal review successfully logged for ${staff?.name || 'staff member'}`);
    logModal.onFalse();
  };

  const handleSignOff = (sessionId, actionPointId) => {
    signOffAppraisalActionPoint(sessionId, actionPointId);
    setReloadKey((key) => key + 1);
  };

  if (!staff) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
            Back
          </Button>
        </Box>
        <EmptyContent filled title="Staff appraisal record not found" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  // Calculate action point statistics across all sessions
  const allActionPoints = sessions.flatMap((s) => s.actionPoints || []);
  const totalSignedOff = allActionPoints.filter((ap) => ap.signedOff).length;

  return (
    <DashboardContent>
      {/* Top Breadcrumbs & CTA */}
      <CustomBreadcrumbs
        heading="Appraisal Details"
        links={[
          { name: 'Dashboard', href: paths.lineManager.root },
          { name: 'Appraisals', href: paths.lineManager.appraisal },
          { name: staff.name },
        ]}
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:calendar-add-bold" />}
            onClick={logModal.onTrue}
          >
            Log Review
          </Button>
        }
        sx={{ mb: 3 }}
      />

      {/* Staff Header Dossier Card */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Avatar alt={staff.name} src={staff.avatar} sx={{ width: 64, height: 64 }}>
              {staff.name?.charAt(0)}
            </Avatar>
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={700}>
                {staff.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {staff.role} · {staff.department}
              </Typography>
              {staff.startDate && (
                <Typography variant="caption" color="text.disabled">
                  Started: {fDate(staff.startDate)}
                </Typography>
              )}
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: 'row', sm: 'column' }}
            spacing={{ xs: 1.5, sm: 0.75 }}
            alignItems={{ xs: 'center', sm: 'flex-end' }}
          >
            <Label variant="soft" color={STATUS_COLOR[staff.status] || 'default'} sx={{ px: 1.5, py: 0.75 }}>
              {STATUS_LABEL[staff.status] || staff.status}
            </Label>
            <Typography variant="body2" sx={{ color: staff.status === 'overdue' ? 'error.main' : 'text.secondary' }}>
              Next review due: {fDate(staff.nextDue)}
            </Typography>
          </Stack>
        </Stack>
      </Card>

      {/* Metric Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Current Period
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5 }}>
              {staff.period || 'Annual 2026'}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Last Review
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5 }}>
              {fDate(staff.lastReview)}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Next Due Date
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5 }}>
              {fDate(staff.nextDue)}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Action Points Signed Off
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5 }}>
              {allActionPoints.length ? `${totalSignedOff} of ${allActionPoints.length} completed` : 'None pending'}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Appraisal History Table */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="h6">Appraisal Review History</Typography>
        <Typography variant="caption" color="text.secondary">
          {sessions.length} {sessions.length === 1 ? 'record' : 'records'} on file
        </Typography>
      </Stack>

      <Card>
        <TableContainer sx={{ overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 720 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody key={reloadKey}>
                {sessions.map((session) => (
                  <AppraisalSessionRow key={session._id} session={session} onSignOff={handleSignOff} />
                ))}

                <TableNoData notFound={!sessions.length} title="No appraisal reviews logged yet" />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>

      {/* Log Review Modal */}
      <LogAppraisalDialog
        open={logModal.value}
        row={staff}
        onClose={logModal.onFalse}
        onSave={handleSaveReview}
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function AppraisalSessionRow({ session, onSignOff }) {
  const expanded = useBoolean();
  const actionPoints = session.actionPoints || [];
  const signedOffCount = actionPoints.filter((point) => point.signedOff).length;
  const hasExpandableContent = !!actionPoints.length || !!session.notes || !!session.document;

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ width: 48, pr: 0 }}>
          {hasExpandableContent && (
            <IconButton size="small" onClick={expanded.onToggle} sx={{ color: 'text.secondary' }}>
              <Iconify
                icon={expanded.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
              />
            </IconButton>
          )}
        </TableCell>

        <TableCell>{fDate(session.sessionDate)}</TableCell>

        <TableCell>
          <Typography variant="body2" fontWeight={600}>
            {session.period}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {session.conductedBy || 'Line Manager'}
          </Typography>
        </TableCell>

        <TableCell>
          {actionPoints.length ? (
            <Chip
              size="small"
              variant="soft"
              color={signedOffCount === actionPoints.length ? 'success' : 'default'}
              label={`${signedOffCount}/${actionPoints.length} signed off`}
            />
          ) : (
            <Typography variant="caption" color="text.disabled">
              None
            </Typography>
          )}
        </TableCell>

        <TableCell align="center">
          <Label variant="soft" color={STATUS_COLOR[session.status] || 'success'}>
            {STATUS_LABEL[session.status] || session.status}
          </Label>
        </TableCell>
      </TableRow>

      {hasExpandableContent && (
        <TableRow>
          <TableCell colSpan={TABLE_HEAD.length} sx={{ py: 0, bgcolor: 'background.neutral' }}>
            <Collapse in={expanded.value} unmountOnExit>
              <Stack spacing={2} sx={{ py: 2.5, pl: { xs: 2, sm: 6 }, pr: 3 }}>
                {/* Review Notes */}
                {session.notes && (
                  <Stack spacing={0.5}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                      Discussion & Performance Notes:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'text.primary' }}>
                      {session.notes}
                    </Typography>
                  </Stack>
                )}

                {/* Action Points / Objectives Checklist */}
                {!!actionPoints.length && (
                  <Stack spacing={1}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                      Agreed Action Points & Goals:
                    </Typography>
                    <Stack spacing={0.75}>
                      {actionPoints.map((point) => (
                        <Stack key={point.id} direction="row" alignItems="center" spacing={1}>
                          <Checkbox
                            size="small"
                            checked={point.signedOff}
                            onChange={() => onSignOff(session._id, point.id)}
                            color="success"
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: point.signedOff ? 'text.disabled' : 'text.primary',
                              textDecoration: point.signedOff ? 'line-through' : 'none',
                            }}
                          >
                            {point.text}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                )}

                {/* Attached Document */}
                {session.document && (
                  <Stack spacing={0.5}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                      Appraisal Documentation:
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        width: 'fit-content',
                      }}
                    >
                      <Iconify icon="solar:document-text-bold" sx={{ color: 'primary.main', width: 20, height: 20 }} />
                      <Typography variant="body2" fontWeight={600}>
                        {session.document.name}
                      </Typography>
                      {session.document.size && (
                        <Typography variant="caption" color="text.disabled">
                          ({session.document.size})
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                )}
              </Stack>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
