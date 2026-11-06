import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import QRCode from 'react-qr-code';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function KioskContentRenderer({ screen }) {
  if (!screen) return null;

  const currentType = screen.type;
  const imageUrl = screen.config?.imageUrl || (currentType === 'image' ? screen.value : '');
  const imageCaption = screen.config?.caption || screen.caption || '';
  const textBody = screen.config?.body || (currentType === 'text' ? screen.value : '') || 'WELCOME';
  const qrUrl = screen.config?.url || (currentType === 'qr' ? screen.value : '');
  const qrCaption = screen.config?.caption || screen.caption || 'Scan QR code to continue';
  const linkUrl = screen.config?.url || (currentType === 'link' ? screen.value : '');
  const buttonLabel = screen.config?.buttonLabel || 'Open link';

  switch (currentType) {
    case 'image':
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#111',
            overflow: 'hidden',
          }}
        >
          {imageUrl ? (
            <>
              <Box
                component="img"
                src={imageUrl}
                alt={screen.title || 'Kiosk content'}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              {imageCaption && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 1.5,
                    bgcolor: 'rgba(0,0,0,0.65)',
                    color: '#fff',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {imageCaption}
                  </Typography>
                </Box>
              )}
            </>
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
            <QRCode value={qrUrl || 'https://tempy.app'} size={120} />
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
            {qrCaption}
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
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center',
            background: 'linear-gradient(160deg, #6C5CE7, #3D7DE0)',
            color: '#fff',
          }}
        >
          {screen.config?.textKind && (
            <Typography
              variant="caption"
              sx={{
                letterSpacing: 1,
                opacity: 0.8,
                textTransform: 'uppercase',
                fontWeight: 700,
                mb: 1,
              }}
            >
              {screen.config.textKind}
            </Typography>
          )}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              letterSpacing: 0.5,
              color: '#fff',
              lineHeight: 1.4,
            }}
          >
            {textBody}
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
            gap: 2,
            p: 3,
            textAlign: 'center',
            bgcolor: '#1A1D27',
            color: '#fff',
          }}
        >
          <Iconify icon="solar:link-bold" width={36} />
          <Button variant="contained" type="button">
            {buttonLabel}
          </Button>
          <Typography variant="caption" sx={{ color: 'grey.400', wordBreak: 'break-word' }}>
            {linkUrl}
          </Typography>
        </Box>
      );

    default:
      return null;
  }
}
