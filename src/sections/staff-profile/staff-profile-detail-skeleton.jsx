import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

// ----------------------------------------------------------------------

export function StaffProfileDetailSkeleton() {
  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Skeleton variant="text" width={220} height={20} />
        <Skeleton variant="rounded" width={280} height={36} />
      </Stack>

      <Card sx={{ p: { xs: 2.5, md: 3 }, mb: 2.5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Skeleton variant="circular" width={72} height={72} />
          <Box sx={{ flexGrow: 1, width: 1 }}>
            <Skeleton variant="text" width={180} height={36} />
            <Skeleton variant="text" width={240} height={22} />
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Skeleton variant="rounded" width={64} height={24} />
              <Skeleton variant="rounded" width={88} height={24} />
              <Skeleton variant="rounded" width={110} height={24} />
            </Stack>
          </Box>
        </Stack>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          mb: 2.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        }}
      >
        {[...Array(3)].map((_, index) => (
          <Card key={index} sx={{ p: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Skeleton variant="rounded" width={44} height={44} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width={72} height={16} />
                <Skeleton variant="text" width={120} height={22} />
              </Box>
            </Stack>
          </Card>
        ))}
      </Box>

      <Card sx={{ p: { xs: 2.5, md: 3 } }}>
        <Skeleton variant="text" width={140} height={28} />
        <Divider sx={{ my: 2 }} />
        <Skeleton variant="text" width={96} height={16} sx={{ mb: 1 }} />
        <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
          <Skeleton variant="rounded" width={72} height={24} />
          <Skeleton variant="rounded" width={88} height={24} />
          <Skeleton variant="rounded" width={104} height={24} />
          <Skeleton variant="rounded" width={80} height={24} />
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          }}
        >
          {[...Array(3)].map((_, index) => (
            <Box key={index}>
              <Skeleton variant="text" width={90} height={16} />
              <Skeleton variant="text" width={140} height={22} />
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
