import { useMemo } from 'react';
import dayjs from 'dayjs';

import Avatar from '@mui/material/Avatar';
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

import { getPunctualityLabel } from './utils';

// ----------------------------------------------------------------------

const formatTime = (value) => (value ? dayjs(value).format('hh:mm A') : null);

// ----------------------------------------------------------------------

export function TeamAttendanceShiftGrid({ records = [], onViewRecord }) {
  const safeRecords = Array.isArray(records) ? records : [];

  const staffList = useMemo(() => {
    const byId = new Map();
    safeRecords.forEach((row) => {
      if (row?.staff?._id && !byId.has(row.staff._id)) {
        byId.set(row.staff._id, row.staff);
      }
    });
    return [...byId.values()].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [safeRecords]);

  const dates = useMemo(
    () => [...new Set(safeRecords.map((row) => row?.workDate).filter(Boolean))].sort(),
    [safeRecords]
  );

  if (!staffList.length) {
    return (
      <EmptyContent
        filled
        title="No shifts to show"
        description="Attendance for this period will appear here once staff clock in."
        sx={{ py: 8 }}
      />
    );
  }

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
            {staffList.map((staff) => {
              const staffRecords = safeRecords.filter((row) => row?.staff?._id === staff._id);
              const lateCount = staffRecords.filter((row) => row?.punctualityStatus === 'late').length;

              return (
                <TableRow key={staff._id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                      <Avatar sx={{ width: 36, height: 36 }}>{staff.name?.charAt(0)}</Avatar>
                      <Stack sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {staff.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                          {staff.email || '—'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TableCell>

                  {dates.map((date) => {
                    const record = staffRecords.find((row) => row?.workDate === date);

                    if (!record) {
                      return (
                        <TableCell key={date} align="center">
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            —
                          </Typography>
                        </TableCell>
                      );
                    }

                    const timeRange = record.clockOutAt
                      ? `${formatTime(record.clockInAt) || '—'} – ${formatTime(record.clockOutAt)}`
                      : formatTime(record.clockInAt) || '—';

                    return (
                      <TableCell
                        key={date}
                        align="center"
                        sx={{ cursor: onViewRecord ? 'pointer' : 'default' }}
                        onClick={() => onViewRecord?.(record._id || record.id, record)}
                      >
                        <Stack spacing={0.5} alignItems="center">
                          <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                            {timeRange}
                          </Typography>
                          <AttendanceStatusChip status={getPunctualityLabel(record.punctualityStatus)} />
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