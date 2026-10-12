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
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export function CommunityWallSidebar({ sx }) {
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();

  const handlePrintList = () => {
    toast.info('Preparing print preview for residents gazette list...');
    window.print?.();
  };


  return (
    <Stack spacing={2.5} sx={{ ...sx }}>
      {/* 1. Gazette Status Widget */}
      <Card
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: (t) => `1px solid ${t.palette.divider}`,
          boxShadow: 'none',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
          Gazette no. 14 closes in 3 days
        </Typography>

        {/* Progress Bar */}
        <Box sx={{ mt: 1.5, mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={(33 / 42) * 100}
            sx={{
              height: 7,
              borderRadius: 4,
              bgcolor: '#EEF2F6',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#4F46E5',
                borderRadius: 4,
              },
            }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem', mb: 1.5 }}>
          33 of 42 residents have content
        </Typography>

        {/* Status badges */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            size="small"
            label="4 no content"
            sx={{
              bgcolor: '#FEF3C7',
              color: '#B45309',
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 24,
              borderRadius: '12px',
            }}
          />
          <Chip
            size="small"
            label="1 over 30"
            sx={{
              bgcolor: '#FEE2E2',
              color: '#B91C1C',
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 24,
              borderRadius: '12px',
            }}
          />
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => router.push(familyPaths.gazettes)}
            sx={{
              fontWeight: 600,
              fontSize: '0.8125rem',
              textTransform: 'none',
              borderRadius: 1.5,
              borderColor: 'divider',
              px: 1.75,
              py: 0.75,
            }}
          >
            Open gazette status
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={handlePrintList}
            sx={{
              fontWeight: 600,
              fontSize: '0.8125rem',
              textTransform: 'none',
              borderRadius: 1.5,
              borderColor: 'divider',
              px: 1.75,
              py: 0.75,
            }}
          >
            Print list
          </Button>
        </Stack>
      </Card>



      {/* 3. Needs your attention Widget */}
      <Card
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: (t) => `1px solid ${t.palette.divider}`,
          boxShadow: 'none',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
            Needs your attention
          </Typography>
          <Chip
            size="small"
            label="3 items"
            sx={{
              bgcolor: '#FEE2E2',
              color: '#DC2626',
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 22,
              borderRadius: '12px',
            }}
          />
        </Stack>

        <Stack spacing={1.25} sx={{ my: 1.75 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              label="2 photos pending"
              sx={{
                bgcolor: '#FEF3C7',
                color: '#B45309',
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 24,
                borderRadius: '12px',
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              oldest 3 hours
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              label="1 reported post"
              sx={{
                bgcolor: '#FEE2E2',
                color: '#DC2626',
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 24,
                borderRadius: '12px',
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              by a family member
            </Typography>
          </Stack>
        </Stack>

        <Button
          variant="contained"
          color="inherit"
          fullWidth
          onClick={() => router.push(familyPaths.moderation)}
        >
          Go to moderation
        </Button>
      </Card>

      {/* 4. Staff activity • 30 days Widget */}
      <Card
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: (t) => `1px solid ${t.palette.divider}`,
          boxShadow: 'none',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 2 }}>
          Staff activity · 30 days
        </Typography>

        <Stack spacing={2}>
          {/* Jane Smith */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src="https://i.pravatar.cc/150?img=36"
                alt="Jane Smith"
                sx={{
                  width: 36,
                  height: 36,
                  border: '1.5px solid #E0E7FF',
                }}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.2 }}>
                  Jane Smith
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Carer
                </Typography>
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8125rem' }}>
              1 post
            </Typography>
          </Stack>

          {/* Daniel Mensah */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src="https://i.pravatar.cc/150?img=68"
                alt="Daniel Mensah"
                sx={{
                  width: 36,
                  height: 36,
                  border: '1.5px solid #D1FAE5',
                }}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.2 }}>
                  Daniel Mensah
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Care Lead
                </Typography>
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8125rem' }}>
              1 post
            </Typography>
          </Stack>

          {/* Tom Lee */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src="https://i.pravatar.cc/150?img=60"
                alt="Tom Lee"
                sx={{
                  width: 36,
                  height: 36,
                  border: '1.5px solid #EDE9FE',
                }}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.2 }}>
                  Tom Lee
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Carer
                </Typography>
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8125rem' }}>
              1 post
            </Typography>
          </Stack>

          {/* Sarah Jenkins */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src="https://i.pravatar.cc/150?img=48"
                alt="Sarah Jenkins"
                sx={{
                  width: 36,
                  height: 36,
                  border: '1.5px solid #FEF3C7',
                }}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.2 }}>
                  Sarah Jenkins
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Senior Carer
                </Typography>
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8125rem' }}>
              1 post
            </Typography>
          </Stack>

          {/* Amara Silva */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                src="https://i.pravatar.cc/150?img=25"
                alt="Amara Silva"
                sx={{
                  width: 36,
                  height: 36,
                  border: '1.5px solid #FCE7F3',
                }}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.2 }}>
                  Amara Silva
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Activities Coordinator
                </Typography>
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8125rem' }}>
              1 post
            </Typography>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}

CommunityWallSidebar.propTypes = {
  sx: PropTypes.object,
};
