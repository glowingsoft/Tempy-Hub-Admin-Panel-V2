import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import QRCode from 'react-qr-code';

import { Iconify } from 'src/components/iconify';
import { KioskContentRenderer } from './kiosk-content-renderer';

// ----------------------------------------------------------------------

export function KioskMobilePreview({
  screen,
  screenIndex = 0,
  totalScreens = 1,
  onPrevious,
  onNext,
  mode = 'home',
  checkoutData,
  sx,
}) {
  const isCheckout = mode === 'checkout';

  return (
    <Stack spacing={1.5} alignItems="center" sx={{ position: 'sticky', top: 24, ...sx }}>
      {/* Device Frame */}
      <Box
        sx={{
          width: { xs: 240, sm: 260 },
          height: 480,
          p: '10px',
          borderRadius: '34px',
          bgcolor: '#141721',
          border: '3px solid #232738',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            borderRadius: '26px',
            bgcolor: '#0B0D14',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Device Camera Notch */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 70,
              height: 14,
              borderRadius: '0 0 10px 10px',
              bgcolor: '#141721',
              zIndex: 10,
            }}
          />

          {/* Screen Body */}
          {isCheckout ? (
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
                background: 'linear-gradient(160deg, #1F9D5A 0%, #0D2A1A 100%)',
                color: '#fff',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                  mb: 2,
                  letterSpacing: 0.3,
                  color: '#fff',
                }}
              >
                You&apos;re checked out
              </Typography>

              {checkoutData?.type === 'qr' && (
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    p: 1,
                    bgcolor: '#fff',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                    boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                  }}
                >
                  <QRCode value={checkoutData?.value || 'https://tempy.app'} size={64} />
                </Box>
              )}

              {checkoutData?.type === 'image' && (
                <Box
                  sx={{
                    width: 90,
                    height: 70,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                    overflow: 'hidden',
                  }}
                >
                  {checkoutData?.value ? (
                    <Box
                      component="img"
                      src={checkoutData.value}
                      alt="Checkout"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Iconify icon="solar:gallery-bold" width={28} />
                  )}
                </Box>
              )}

              {checkoutData?.type === 'text' && (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: '#fff',
                    mb: 1.5,
                    px: 1,
                  }}
                >
                  {checkoutData?.value || 'Thank you for visiting!'}
                </Typography>
              )}

              {checkoutData?.type === 'link' && (
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                  }}
                >
                  <Iconify icon="solar:link-bold" width={24} />
                </Box>
              )}

              <Typography
                variant="caption"
                sx={{
                  fontSize: 10,
                  opacity: 0.9,
                  px: 1.5,
                  lineHeight: 1.3,
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                {checkoutData?.caption || 'Scan to tell us about your visit'}
              </Typography>
            </Box>
          ) : (
            <KioskContentRenderer screen={screen} preview />
          )}
        </Box>
      </Box>

      {/* Navigation / Caption */}
      {isCheckout ? (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Checkout screen preview
        </Typography>
      ) : (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton size="small" disabled={screenIndex === 0} onClick={onPrevious}>
            <Iconify icon="eva:arrow-ios-back-fill" width={18} />
          </IconButton>

          <Typography variant="caption" sx={{ minWidth: 80, textAlign: 'center', fontWeight: 600 }}>
            Widget {screenIndex + 1} / {totalScreens}
          </Typography>

          <IconButton
            size="small"
            disabled={screenIndex === totalScreens - 1}
            onClick={onNext}
          >
            <Iconify icon="eva:arrow-ios-forward-fill" width={18} />
          </IconButton>
        </Stack>
      )}
    </Stack>
  );
}