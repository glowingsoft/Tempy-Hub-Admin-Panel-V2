import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';

import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

function getWallPostCount(activity) {
  if (typeof activity?.wallPosts === 'number') return activity.wallPosts;
  return activity?.wallPosts?.count ?? 0;
}

function getReactionCount(activity) {
  if (typeof activity?.reactions === 'number') return activity.reactions;
  return activity?.wallPosts?.reactions ?? 0;
}

function getNewsletterLabel(newsletter) {
  if (!newsletter) return 'None scheduled';

  const dueLabel = newsletter.dueAt ? fDate(newsletter.dueAt, 'D MMM') : '';
  const title = newsletter.title || '';
  const name = [title, dueLabel].filter(Boolean).join(' · ');

  return name || 'Scheduled';
}

export function FamilyActivityCard({
  activity,
  periodLabel = 'LAST 7 DAYS',
  onOpenModeration,
  onOpenNewPost,
  canCreatePost = true,
  sx,
  ...other
}) {
  const uploads = activity?.uploads || { total: 0, approved: 0, waiting: 0, notApproved: 0 };
  const wallPostCount = getWallPostCount(activity);
  const reactionCount = getReactionCount(activity);
  const newsletter = activity?.nextNewsletter;
  const newsletterStatus = newsletter?.status || '';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
      {...other}
    >
      <CardHeader
        title={
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: 'text.secondary',
              fontSize: '0.8125rem',
            }}
          >
            FAMILY ACTIVITY ({periodLabel})
          </Typography>
        }
        sx={{ pb: 1 }}
      />

      <Box
        sx={{
          p: 3,
          pt: 1.5,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Stack spacing={2}>
          {/* Line 1: 18 uploads · 11 approved · 5 waiting · 2 not approved */}
          <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
            <Box component="span" sx={{ fontWeight: 700 }}>
              {uploads.total} uploads
            </Box>
            {' · '}
            <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>
              {uploads.approved} approved
            </Box>
            {' · '}
            <Box component="span" sx={{ color: 'warning.main', fontWeight: 600 }}>
              {uploads.waiting} waiting
            </Box>
            {' · '}
            <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>
              {uploads.notApproved} not approved
            </Box>
          </Typography>

          {/* Line 2: 4 wall posts · 112 reactions */}
          <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
            <Box component="span" sx={{ fontWeight: 700 }}>
              {wallPostCount} wall posts
            </Box>
            {' · '}
            <Box component="span" sx={{ fontWeight: 600 }}>
              {reactionCount} reactions
            </Box>
          </Typography>

          {/* Line 3: Next newsletter: 31 Oct (draft) */}
          <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
            Next newsletter:{' '}
            <Box component="span" sx={{ fontWeight: 700 }}>
              {getNewsletterLabel(newsletter)}
            </Box>
            {newsletterStatus ? (
              <Box component="span" sx={{ color: 'text.secondary' }}>
                {' '}
                ({newsletterStatus})
              </Box>
            ) : null}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2.5, borderStyle: 'dashed' }} />

        {/* Action Buttons: [Go to moderation] and [New wall post] */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={onOpenModeration}
            sx={{ fontWeight: 600, px: 2.5 }}
          >
            Go to moderation
          </Button>

          {canCreatePost && (
            <Button
              variant="outlined"
              color="inherit"
              size="medium"
              onClick={onOpenNewPost}
              sx={{ fontWeight: 600, px: 2.5 }}
            >
              New wall post
            </Button>
          )}
        </Stack>
      </Box>
    </Card>
  );
}

FamilyActivityCard.propTypes = {
  activity: PropTypes.object,
  periodLabel: PropTypes.string,
  onOpenModeration: PropTypes.func,
  onOpenNewPost: PropTypes.func,
  canCreatePost: PropTypes.bool,
  sx: PropTypes.object,
};
