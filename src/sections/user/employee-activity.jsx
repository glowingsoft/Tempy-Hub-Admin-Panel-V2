import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import { Box, Card, CardHeader, Divider, Stack, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { fDate, fDateTime, fIsSame } from 'src/utils/format-time';

// ----------------------------------------------------------------------

const ACTIVITY_CONFIG = {
  check_in: {
    label: 'Checked in',
    color: 'success',
    icon: 'solar:login-2-bold',
  },

  break: {
    label: 'Break started',
    color: 'warning',
    icon: 'solar:pause-bold',
  },

  break_end: {
    label: 'Break ended',
    color: 'info',
    icon: 'solar:play-bold',
  },

  check_out: {
    label: 'Checked out',
    color: 'error',
    icon: 'solar:logout-2-bold',
  },

  profile_update: {
    label: 'Profile updated',
    color: 'info',
    icon: 'solar:user-edit-bold',
  },

  kiosk_assigned: {
    label: 'Kiosk assigned',
    color: 'secondary',
    icon: 'solar:monitor-bold',
  },

  leave_approved: {
    label: 'Leave approved',
    color: 'success',
    icon: 'solar:calendar-mark-bold',
  },

  status_changed: {
    label: 'Status changed',
    color: 'warning',
    icon: 'solar:refresh-bold',
  },

  note: {
    label: 'Note added',
    color: 'primary',
    icon: 'solar:notes-bold',
  },
};

// ----------------------------------------------------------------------

function groupByDate(list = []) {
  const groups = [];

  list.forEach((item) => {
    const lastGroup = groups[groups.length - 1];

    if (
      lastGroup &&
      fIsSame(new Date(lastGroup.date), new Date(item.time), 'day')
    ) {
      lastGroup.items.push(item);
    } else {
      groups.push({
        date: item.time,
        items: [item],
      });
    }
  });

  return groups;
}

// ----------------------------------------------------------------------

export function EmployeeActivity({
  title = 'Activity',
  icon = 'solar:history-bold',
  subheader,
  list = [],
  ...other
}) {

  const groups = groupByDate(list);

  return (
    <Card {...other}>
      <CardHeader
        avatar={<Iconify icon={icon} />}
        title={title}
        subheader={subheader}
      />

      {groups.length > 0 ? (
        <Stack sx={{ p: 3 }} spacing={3}>
          {groups.map((group) => (
            <DayGroup
              key={group.date}
              date={group.date}
              items={group.items}
            />
          ))}
        </Stack>
      ) : (
        <EmptyActivity />
      )}
    </Card>
  );
}

// ----------------------------------------------------------------------

function DayGroup({ date, items }) {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
        }}
      >
        <Divider sx={{ flex: 1 }} />

        <Typography
          variant="caption"
          sx={{
            color: 'text.disabled',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {fDate(date)}
        </Typography>

        <Divider sx={{ flex: 1 }} />
      </Box>

      <Timeline
        sx={{
          m: 0,
          p: 0,
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {items.map((item, index) => (
          <ActivityItem
            key={item.id}
            item={item}
            lastItem={index === items.length - 1}
          />
        ))}
      </Timeline>
    </Box>
  );
}

// ----------------------------------------------------------------------

function ActivityItem({ item, lastItem }) {
  const config = ACTIVITY_CONFIG[item.type] ?? {
    label: item.type || 'Activity',
    color: 'primary',
    icon: 'solar:info-circle-bold',
  };

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot color={config.color}>
          <Iconify icon={config.icon} width={16} />
        </TimelineDot>

        {!lastItem && <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent sx={{ pb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
          justifyContent="space-between"
          spacing={1}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">
              {config.label}
            </Typography>

            {item.description && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: 'text.secondary',
                }}
              >
                {item.description}
              </Typography>
            )}

            {item.performedBy && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  color: 'text.disabled',
                }}
              >
                By {item.performedBy}
              </Typography>
            )}
          </Box>

          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              whiteSpace: 'nowrap',
            }}
          >
            {fDateTime(item.time, 'h:mm a')}
          </Typography>
        </Stack>
      </TimelineContent>
    </TimelineItem>
  );
}

// ----------------------------------------------------------------------

function EmptyActivity() {
  return (
    <Box
      sx={{
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Iconify
        icon="solar:history-bold-duotone"
        width={64}
        sx={{
          mb: 2,
          color: 'text.disabled',
        }}
      />

      <Typography variant="subtitle1">
        No activity yet
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mt: 0.5,
          color: 'text.secondary',
        }}
      >
        Employee activity will appear here.
      </Typography>
    </Box>
  );
}