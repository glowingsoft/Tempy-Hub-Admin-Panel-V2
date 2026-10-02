import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import QRCode from 'react-qr-code';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function KioskContentRenderer({ screen, preview = false }) {
  if (!screen) return null;

  switch (screen.type) {
    case 'image':
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#111',
            overflow: 'hidden',
          }}
        >
          {screen.value ? (
            <Box
              component="img"
              src={screen.value}
              alt="Kiosk content"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(160deg, #F4B740, #E14B4B)',
                color: '#fff',
                p: 2,
                textAlign: 'center',
              }}
            >
              <Iconify icon="solar:gallery-bold" width={40} sx={{ mb: 1, opacity: 0.9 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.9 }}>
                Image Preview
              </Typography>
            </Box>
          )}
        </Box>
      );

    case 'qr':
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2.5,
            textAlign: 'center',
            bgcolor: '#1A1D27',
            color: '#fff',
          }}
        >
          <Box
            sx={{
              p: 1.5,
              bgcolor: '#fff',
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
            }}
          >
            <QRCode value={screen.value || 'https://tempy.app'} size={120} />
          </Box>

          <Typography
            variant="caption"
            sx={{
              mt: 2,
              fontWeight: 600,
              color: 'grey.400',
              maxWidth: 180,
              lineHeight: 1.4,
            }}
          >
            {screen.caption || 'Scan QR code to continue'}
          </Typography>
        </Box>
      );

    case 'text':
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center',
            background: 'linear-gradient(160deg, #6C5CE7, #3D7DE0)',
            color: '#fff',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              letterSpacing: 0.5,
              color: '#fff',
              textTransform: 'uppercase',
              lineHeight: 1.4,
            }}
          >
            {screen.value || 'WELCOME'}
          </Typography>
        </Box>
      );

    case 'link':
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center',
            background: 'linear-gradient(160deg, #3D7DE0, #1B3A6B)',
            color: '#fff',
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
            }}
          >
            <Iconify icon="solar:link-bold" width={28} sx={{ color: '#fff' }} />
          </Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: '#fff',
              maxWidth: 180,
              wordBreak: 'break-word',
            }}
          >
            {screen.label || screen.value || 'Tap to open link'}
          </Typography>
        </Box>
      );

    default:
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            color: 'text.secondary',
          }}
        >
          <Typography variant="caption">No content configured</Typography>
        </Box>
      );
  }
}