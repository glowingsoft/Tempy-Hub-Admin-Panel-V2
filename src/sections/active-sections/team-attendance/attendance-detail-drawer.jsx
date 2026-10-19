import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { fDate, fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { AttendanceStatusChip } from 'src/sections/user/attendance-status-chip';
import { useGetAttendanceByIdQuery } from 'src/store/Reducer/attendance-api';

// ----------------------------------------------------------------------

const formatTime = (value) => (value ? dayjs(value).format('hh:mm A') : '—');

export function AttendanceDetailDrawer({ open, onClose, attendanceDayId, fallbackRecord }) {
  const {
    data: apiRecord,
    isLoading,
    isFetching,
  } = useGetAttendanceByIdQuery(attendanceDayId, {
    skip: !attendanceDayId || !open,
  });

  const record = apiRecord || fallbackRecord;

  if (!open) return null;

  const staff = record?.staff;
  const branch = record?.branch;
  const breaks = Array.isArray(record?.breaks) ? record.breaks : [];
  const workedMinutes = record?.workedMinutes || 0;
  const workedHours = `${Math.floor(workedMinutes / 60)}h ${workedMinutes % 60}m`;

  const punctualityStatus =
    record?.punctualityStatus === 'onTime' ? 'On time' : record?.punctualityStatus || 'Unknown';
  const presenceStatus = record?.presenceStatus || '—';

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      slotProps={{ backdrop: { invisible: false } }}
      PaperProps={{
        sx: {
          width: { xs: 1, sm: 460 },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2.5, pb: 2 }}
      >
        <Typography variant="h6">Attendance Details</Typography>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Stack>

      <Divider />

      <Scrollbar sx={{ flexGrow: 1 }}>
        {isLoading && !record ? (
          <Box sx={{ py: 10 }}>
            <LoadingScreen />
          </Box>
        ) : !record ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No record found.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3} sx={{ p: 2.5 }}>
            {/* Staff profile summary card */}
            <Card sx={{ p: 2, bgcolor: 'background.neutral' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 52, height: 52 }}>
                  {staff?.name?.charAt(0) || 'U'}
                </Avatar>
                <Stack spacing={0.5} sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography variant="subtitle1" noWrap>
                    {staff?.name || 'Unknown Staff'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                    {staff?.email || '—'}
                  </Typography>
                  {staff?.employeeCode && (
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      ID: {staff.employeeCode}
                    </Typography>
                  )}
                </Stack>

                <Stack spacing={0.5} alignItems="flex-end">
                  <AttendanceStatusChip status={punctualityStatus} />
                  <Label
                    variant="soft"
                    color={presenceStatus === 'checkedIn' ? 'success' : 'default'}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {presenceStatus}
                  </Label>
                </Stack>
              </Stack>
            </Card>

            {/* Shift & Work Info */}
            <Stack spacing={1.5}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Shift & Site
              </Typography>
              <InfoRow label="Work Date" value={fDate(record?.workDate)} />
              <InfoRow label="Site / Branch" value={branch?.name || record?.branchId || '—'} />
              <InfoRow
                label="Check-in Method"
                value={
                  record?.checkInMethod ? (
                    <Label variant="soft" color="info" sx={{ textTransform: 'uppercase' }}>
                      {record.checkInMethod}
                    </Label>
                  ) : (
                    '—'
                  )
                }
              />
              <InfoRow label="Total Time Worked" value={workedHours} />
            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} />

            {/* Timings Details */}
            <Stack spacing={1.5}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Clock-in / Clock-out
              </Typography>

              <Card sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Label color="success" sx={{ borderRadius: 1 }}>
                        <Iconify icon="famicons:log-in" width={16} />
                      </Label>
                      <Typography variant="subtitle2">Clock In</Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ color: 'success.main' }}>
                      {formatTime(record?.clockInAt)}
                    </Typography>
                  </Stack>
                  {record?.clockInAt && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Recorded at: {fDateTime(record.clockInAt)}
                    </Typography>
                  )}
                </Stack>
              </Card>

              <Card sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Label color="error" sx={{ borderRadius: 1 }}>
                        <Iconify icon="solar:logout-2-bold-duotone" width={16} />
                      </Label>
                      <Typography variant="subtitle2">Clock Out</Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ color: record?.clockOutAt ? 'error.main' : 'text.disabled' }}>
                      {formatTime(record?.clockOutAt)}
                    </Typography>
                  </Stack>
                  {record?.clockOutAt && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Recorded at: {fDateTime(record.clockOutAt)}
                    </Typography>
                  )}
                </Stack>
              </Card>
            </Stack>

            {/* Breaks breakdown */}
            <Stack spacing={1.5}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Breaks Breakdown ({breaks.length})
              </Typography>

              {breaks.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                  No breaks recorded for this day.
                </Typography>
              ) : (
                breaks.map((b, i) => {
                  const durationMins =
                    b.breakInAt && b.breakOutAt
                      ? dayjs(b.breakOutAt).diff(dayjs(b.breakInAt), 'minute')
                      : null;
                  return (
                    <Card
                      key={i}
                      sx={{
                        p: 1.5,
                        bgcolor: 'background.neutral',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack spacing={0.25}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Break #{i + 1}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {formatTime(b.breakInAt)} — {formatTime(b.breakOutAt)}
                          </Typography>
                        </Stack>
                        {durationMins != null && (
                          <Label variant="soft" color="warning">
                            {durationMins} mins
                          </Label>
                        )}
                      </Stack>
                    </Card>
                  );
                })
              )}
            </Stack>

            {/* Geolocation info if available */}
            {record?.geo && (record.geo.lat != null || record.geo.lng != null) && (
              <>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <Stack spacing={1.5}>
                  <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                    Geo Location
                  </Typography>
                  <InfoRow label="Coordinates" value={`${record.geo.lat}, ${record.geo.lng}`} />
                  {record.geo.accuracy && (
                    <InfoRow label="Accuracy" value={`±${record.geo.accuracy}m`} />
                  )}
                </Stack>
              </>
            )}

            {/* Audit / Metadata */}
            <Divider sx={{ borderStyle: 'dashed' }} />
            <Stack spacing={1.5}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Audit Details
              </Typography>
              {record?._id && <InfoRow label="Day Record ID" value={record._id} />}
              {record?.clientEventId && (
                <InfoRow label="Client Event ID" value={record.clientEventId} />
              )}
              {record?.createdAt && (
                <InfoRow label="Created At" value={fDateTime(record.createdAt)} />
              )}
              {record?.updatedAt && (
                <InfoRow label="Updated At" value={fDateTime(record.updatedAt)} />
              )}
            </Stack>
          </Stack>
        )}
      </Scrollbar>
    </Drawer>
  );
}

function InfoRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }} component="div">
        {value}
      </Typography>
    </Stack>
  );
}