import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';

import { useRouter } from 'src/routes/hooks';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';

// ----------------------------------------------------------------------

export function CommunityWallSidebar({ gazette, attention, activity, sx }) {
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();

  const residents = gazette?.residents || {};
  const withContent = residents.withContent ?? 0;
  const totalResidents = residents.total ?? 0;
  const noContent = residents.noContent ?? 0;
  const overCap = residents.overCap ?? 0;
  const percent = gazette?.percentWithContent ?? (totalResidents ? (withContent / totalResidents) * 100 : 0);
  const authors = activity?.authors ?? [];
  const pendingUploads = attention?.pendingUploads?.count ?? 0;
  const reportedPosts = attention?.reportedPosts?.count ?? 0;
  const attentionTotal = attention?.total ?? pendingUploads + reportedPosts;

  return (
    <Stack spacing={2.5} sx={{ ...sx }}>
      <Card sx={{ p: 2.5, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
          {gazette?.number
            ? `Gazette no. ${gazette.number}${gazette.closesInDays != null ? ` closes in ${gazette.closesInDays} days` : ''}`
            : 'Gazette'}
        </Typography>

        {gazette?.periodLabel && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {gazette.periodLabel}
          </Typography>
        )}

        <Box sx={{ mt: 1.5, mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Number(percent) || 0)}
            sx={{
              height: 7,
              borderRadius: 4,
              bgcolor: '#EEF2F6',
              '& .MuiLinearProgress-bar': { bgcolor: '#4F46E5', borderRadius: 4 },
            }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem', mb: 1.5 }}>
          {withContent} of {totalResidents} residents have content
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={`${noContent} no content`}
            sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700, fontSize: '0.72rem', height: 24 }}
          />
          {overCap > 0 && (
            <Chip
              size="small"
              label={`${overCap} over ${gazette?.messageCap ?? 30}`}
              sx={{ bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 700, fontSize: '0.72rem', height: 24 }}
            />
          )}
        </Stack>

        <Button
          variant="outlined"
          color="inherit"
          size="small"
          onClick={() => router.push(familyPaths.gazettes)}
          sx={{ fontWeight: 600, textTransform: 'none' }}
        >
          Open gazette status
        </Button>
      </Card>

      <Card sx={{ p: 2.5, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
            Needs your attention
          </Typography>
          <Chip
            size="small"
            label={`${attentionTotal} items`}
            sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 700, fontSize: '0.72rem', height: 22 }}
          />
        </Stack>

        <Stack spacing={1.25} sx={{ my: 1.75 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              label={`${pendingUploads} photos pending`}
              sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700, fontSize: '0.72rem', height: 24 }}
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              label={`${reportedPosts} reported post${reportedPosts === 1 ? '' : 's'}`}
              sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 700, fontSize: '0.72rem', height: 24 }}
            />
          </Stack>
        </Stack>

        <Button variant="contained" color="primary" fullWidth onClick={() => router.push(familyPaths.moderation)}>
          Go to moderation
        </Button>
      </Card>

      <Card sx={{ p: 2.5, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 2 }}>
          Staff activity · {activity?.days ?? 30} days
        </Typography>

        <Stack spacing={2}>
          {authors.length ? (
            authors.map((author) => (
              <Stack key={author.authorId} direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar src={author.authorPhotoUrl || undefined} alt={author.authorName} sx={{ width: 36, height: 36 }}>
                    {author.authorName?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8125rem', textTransform: 'capitalize' }}>
                      {author.authorName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {author.authorRole}
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                  {author.posts} post{author.posts === 1 ? '' : 's'}
                </Typography>
              </Stack>
            ))
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No staff activity yet.
            </Typography>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

CommunityWallSidebar.propTypes = {
  gazette: PropTypes.object,
  attention: PropTypes.object,
  activity: PropTypes.object,
  sx: PropTypes.object,
};
