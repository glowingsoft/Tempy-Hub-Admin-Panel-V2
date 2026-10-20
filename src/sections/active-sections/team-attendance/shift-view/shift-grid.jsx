import dayjs from 'dayjs';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { AttendanceStatusChip } from 'src/sections/user/attendance-status-chip';

import { getPunctualityLabel } from '../utils';

// ----------------------------------------------------------------------

const formatTime = (value) => (value ? dayjs(value).format('hh:mm A') : null);

function getDayRecordId(day) {
  return day?._id || day?.attendanceDayId || null;
}

function ShiftWeekTable({ week, onViewRecord }) {
  const dates = Array.isArray(week?.dates) ? week.dates : [];
  const staffRows = Array.isArray(week?.staff) ? week.staff : [];

  return (
    <TableContainer sx={{ position: 'relative' }}>
      <Scrollbar>
        <Table sx={{ minWidth: 760 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 220 }}>Staff</TableCell>
              {dates.map((date) => (
                <TableCell key={date} align="center" sx={{ minWidth: 130 }}>
                  {fDate(date, 'ddd, DD MMM')}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ minWidth: 90 }}>
                Late
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {staffRows.map((row) => {
              const staff = row?.staff || {};
              const days = row?.days || {};
              const lateCount = row?.totals?.lateCount ?? 0;

              return (
                <TableRow key={staff._id || staff.email} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                      {/* <Avatar src={staff.photoUrl || undefined} sx={{ width: 36, height: 36, fontSize: 16, textTransform: 'capitalize' }}>
                        {staff.name?.charAt(0)}
                      </Avatar> */}

                      <Avatar alt={staff.name} src={staff?.photoUrl || undefined} sx={{ width: 36, height: 36, fontSize: 16, textTransform: 'capitalize' }}>
                        {staff.name?.charAt(0)}
                      </Avatar>

                      <Stack sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          noWrap
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {staff.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                          {staff.email || '—'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TableCell>

                  {dates.map((date) => {
                    const day = days[date];
                    const kind = day?.kind;

                    if (!day || kind === 'empty') {
                      return (
                        <TableCell key={date} align="center">
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            —
                          </Typography>
                        </TableCell>
                      );
                    }

                    const isLeave = kind === 'leave' || day.presenceStatus === 'onLeave';
                    const dayId = getDayRecordId(day);
                    const timeRange = isLeave
                      ? 'On leave'
                      : day.clockOutAt
                        ? `${formatTime(day.clockInAt) || '—'} – ${formatTime(day.clockOutAt)}`
                        : formatTime(day.clockInAt) || '—';

                    const fallbackRecord = {
                      ...day,
                      workDate: date,
                      staff,
                    };

                    return (
                      <TableCell
                        key={date}
                        align="center"
                        sx={{ cursor: dayId && onViewRecord ? 'pointer' : 'default' }}
                        onClick={() => {
                          if (dayId) onViewRecord?.(dayId, fallbackRecord);
                        }}
                      >
                        <Stack spacing={0.5} alignItems="center">
                          <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                            {timeRange}
                          </Typography>
                          <AttendanceStatusChip
                            status={
                              isLeave
                                ? day.leaveType
                                  ? `On leave (${day.leaveType})`
                                  : 'On leave'
                                : getPunctualityLabel(day.punctualityStatus)
                            }
                          />
                        </Stack>
                      </TableCell>
                    );
                  })}

                  <TableCell align="center">
                    <Label color={lateCount ? 'warning' : 'default'} variant="soft">
                      {lateCount}
                    </Label>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );
}

function ShiftGridSkeleton() {
  return (
    <TableContainer sx={{ position: 'relative' }}>
      <Scrollbar>
        <Table sx={{ minWidth: 760 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 220 }}>Staff</TableCell>
              {[...Array(7)].map((_, i) => (
                <TableCell key={i} align="center" sx={{ minWidth: 130 }}>
                  <Skeleton sx={{ mx: 'auto', width: 72, height: 16 }} />
                </TableCell>
              ))}
              <TableCell align="center" sx={{ minWidth: 90 }}>
                Late
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                    <Skeleton variant="circular" width={36} height={36} sx={{ flexShrink: 0 }} />
                    <Stack spacing={0.5} sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Skeleton sx={{ width: 120, height: 16 }} />
                      <Skeleton sx={{ width: 160, height: 12 }} />
                    </Stack>
                  </Stack>
                </TableCell>

                {[...Array(7)].map((_, i) => (
                  <TableCell key={i} align="center">
                    <Stack spacing={0.5} alignItems="center">
                      <Skeleton sx={{ width: 80, height: 14 }} />
                      <Skeleton
                        variant="rounded"
                        sx={{ width: 60, height: 22, borderRadius: 0.75 }}
                      />
                    </Stack>
                  </TableCell>
                ))}

                <TableCell align="center">
                  <Skeleton
                    variant="rounded"
                    sx={{ mx: 'auto', width: 28, height: 22, borderRadius: 0.75 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );
}

export function AttendanceShiftGrid({ weeks = [], onViewRecord, loading = false }) {
  const safeWeeks = Array.isArray(weeks) ? weeks : [];
  const hasStaff = safeWeeks.some((week) => (week?.staff || []).length);

  if (loading) {
    return <ShiftGridSkeleton />;
  }

  if (!hasStaff) {
    return (
      <EmptyContent
        filled
        title="No shifts available"
        description="Attendance for this period will appear here once staff clock in."
        sx={{ py: 8 }}
      />
    );
  }

  return (
    <Stack>
      {safeWeeks.map((week, index) => (
        <Box key={week?.weekStart || index}>
          {safeWeeks.length > 1 && week?.weekStart && (
            <Typography variant="subtitle2" sx={{ px: 2.5, py: 1.5, color: 'text.secondary' }}>
              Week of {fDate(week.weekStart, 'DD MMM YYYY')}
            </Typography>
          )}
          <ShiftWeekTable week={week} onViewRecord={onViewRecord} />
        </Box>
      ))}
    </Stack>
  );
}
