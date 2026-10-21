import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
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
import { useBoolean } from 'src/hooks/use-boolean';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { useParams, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fDate } from 'src/utils/format-time';

import LogSessionDialog from '../log-session-dialog';
import { _teamSupervision, _teamSupervisionSessions, logTeamSupervisionSession, signOffTeamActionPoint } from '../mocks/data';
import { STATUS_LABEL_COLOR, STATUS_LABEL_TEXT, statusText } from '../supervision-table-row';

const TABLE_HEAD = [
  { id: 'expand', label: '', width: 48 },
  { id: 'date', label: 'Date', width: 140 },
  { id: 'topics', label: 'Topics discussed', minWidth: 220 },
  { id: 'actionPoints', label: 'Action points', minWidth: 160 },
];

// ----------------------------------------------------------------------

export default function SupervisionDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const { organizationId } = useCurrentOrganization();
  const logModal = useBoolean();

  // Bumped after saving a session or signing off an action point — the mock
  // helpers mutate their arrays in place rather than replacing them.
  const [reloadKey, setReloadKey] = useState(0);

  const row = useMemo(
    () => _teamSupervision.find((item) => item.id === id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, reloadKey]
  );

  const sessions = useMemo(
    () =>
      _teamSupervisionSessions
        .filter((session) => session.staffId === id)
        .sort((a, b) => dayjs(b.sessionDate).valueOf() - dayjs(a.sessionDate).valueOf()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, reloadKey]
  );

  const handleSaveSession = (session) => {
    logTeamSupervisionSession(session.staffId, session);

    if (row) {
      row.lastSession = dayjs(session.dateHeld).format('YYYY-MM-DD');
      row.nextDue = dayjs(session.nextDue).format('D MMM');
      row.status = 'booked';
      row.overdueDays = undefined;
    }

    setReloadKey((key) => key + 1);
    logModal.onFalse();
  };

  const handleSignOff = (sessionId, actionPointId) => {
    signOffTeamActionPoint(sessionId, actionPointId);
    setReloadKey((key) => key + 1);
  };

  if (!row) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
            Back
          </Button>
        </Box>
        <EmptyContent filled title="Staff member not found" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading="Supervision details"
        links={[
          { name: 'Dashboard', href: paths.lineManager.root },
          { name: 'Supervision', href: paths.lineManager.supervision },
          { name: row.name },
        ]}
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:calendar-add-bold" />}
            onClick={logModal.onTrue}
          >
            Book session
          </Button>
        }
        sx={{ mb: 3 }}
      />

      <Card sx={{ p: 3, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar alt={row.name} src={row.avatar} sx={{ width: 56, height: 56 }}>
              {row.name?.charAt(0)}
            </Avatar>
            <Stack>
              <Typography variant="subtitle1">{row.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {row.role}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'row', sm: 'column' }} spacing={{ xs: 2, sm: 0.5 }} alignItems={{ xs: 'center', sm: 'flex-end' }}>
            <Label color={STATUS_LABEL_COLOR[row.status]}>{STATUS_LABEL_TEXT[row.status]}</Label>
            <Typography variant="body2" color={row.status === 'overdue' ? 'error.main' : 'text.secondary'}>
              {statusText(row)}
            </Typography>
          </Stack>
        </Stack>
      </Card>

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Session history
      </Typography>
      <Card>
        <TableContainer sx={{ overflow: 'unset' }}>
          <Scrollbar>
            <Table>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody key={reloadKey}>
                {sessions.map((session) => (
                  <SessionRow key={session._id} session={session} onSignOff={handleSignOff} />
                ))}

                <TableNoData notFound={!sessions.length} title="No sessions logged yet" />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>

      <LogSessionDialog
        open={logModal.value}
        row={row}
        organizationId={organizationId}
        onClose={logModal.onFalse}
        onSave={handleSaveSession}
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function SessionRow({ session, onSignOff }) {
  const expanded = useBoolean();
  const actionPoints = session.actionPoints || [];
  const signedOffCount = actionPoints.filter((point) => point.signedOff).length;
  const hasExpandableContent = !!actionPoints.length || !!session.notes;

  return (
    <>
      <TableRow hover>
        <TableCell>
          {hasExpandableContent && (
            <IconButton size="small" onClick={expanded.onToggle}>
              <Iconify
                icon="eva:arrow-ios-downward-fill"
                sx={{ transform: expanded.value ? 'rotate(180deg)' : 'none' }}
              />
            </IconButton>
          )}
        </TableCell>
        <TableCell>{fDate(session.sessionDate)}</TableCell>
        <TableCell>
          {session.topics?.length ? (
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {session.topics.map((topic) => (
                <Chip key={topic} label={topic} size="small" variant="soft" />
              ))}
            </Stack>
          ) : (
            '—'
          )}
        </TableCell>
        <TableCell>{actionPoints.length ? `${signedOffCount}/${actionPoints.length} signed off` : '—'}</TableCell>
      </TableRow>

      {hasExpandableContent && (
        <TableRow>
          <TableCell colSpan={TABLE_HEAD.length} sx={{ py: 0, borderBottom: expanded.value ? undefined : 'none' }}>
            <Collapse in={expanded.value} unmountOnExit>
              <Stack spacing={1.5} sx={{ py: 2, pl: 5, pr: 2 }}>
                {session.notes && (
                  <Typography variant="body2" color="text.secondary">
                    {session.notes}
                  </Typography>
                )}

                {!!actionPoints.length && (
                  <Stack spacing={0.5}>
                    {actionPoints.map((point) => (
                      <Stack key={point.id} direction="row" alignItems="center" spacing={1}>
                        <Checkbox
                          size="small"
                          checked={point.signedOff}
                          onChange={() => onSignOff(session._id, point.id)}
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
                )}
              </Stack>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}