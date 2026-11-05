import Card from '@mui/material/Card';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { fDateTime } from 'src/utils/format-time';

import { EmptyContent } from 'src/components/empty-content';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export function AnalyticsOrderTimeline({ title, subheader, list, sx, ...other }) {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', ...sx }} {...other}>
      <CardHeader title={title} subheader={subheader} />

      {/* `Scrollbar` defaults to flexGrow:1 + minHeight:0 (see src/components/scrollbar) —
          fills whatever height the Card is given and scrolls instead of growing it,
          matching AnalyticsTasks. With no explicit Card height (the common case),
          this is a no-op and the card still sizes to its content as before. */}
      {!list?.length ? (
        <EmptyContent
          filled
          title="No data available"
          slotProps={{ img: { maxWidth: 96 } }}
          sx={{ height: 'auto', flex: 1, minHeight: 0, m: 2.5, mt: 0, py: 3, overflow: 'hidden' }}
        />
      ) : (
        <Scrollbar>
          <Timeline
            sx={{
              m: 0,
              p: 3,
              [`& .${timelineItemClasses.root}:before`]: {
                flex: 0,
                padding: 0,
              },
            }}
          >
            {list.map((item, index) => (
              <Item key={item.id} item={item} lastItem={index === list.length - 1} />
            ))}
          </Timeline>
        </Scrollbar>
      )}
    </Card>
  );
}

function Item({ item, lastItem, ...other }) {
  return (
    <TimelineItem {...other}>
      <TimelineSeparator>
        <TimelineDot
          color={
            (item.type === 'order1' && 'primary') ||
            (item.type === 'order2' && 'success') ||
            (item.type === 'order3' && 'info') ||
            (item.type === 'order4' && 'warning') ||
            'error'
          }
        />
        {lastItem ? null : <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent>
        <Typography variant="subtitle2">{item.title}</Typography>

        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {fDateTime(item.time)}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
}
