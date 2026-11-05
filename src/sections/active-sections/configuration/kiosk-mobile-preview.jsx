import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
          <Box
            sx={{
              width: '100%',
              height: '100%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#0B0D14',
              px: 3,
              textAlign: 'center',
            }}
          >
            {isCheckout ? (
              checkoutData ? (
                <KioskContentRenderer screen={checkoutData} preview />
              ) : (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  No checkout widget to preview
                </Typography>
              )
            ) : screen ? (
              <KioskContentRenderer screen={screen} preview />
            ) : (
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                No home screen widgets to preview
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Screen Navigation Controls (Home Mode Only) */}
      {!isCheckout && totalScreens > 1 && (
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            size="small"
            disabled={screenIndex <= 0}
            onClick={onPrevious}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: (theme) => theme.customShadows?.z8,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Iconify icon="solar:alt-arrow-left-bold" width={16} />
          </IconButton>

          <Typography variant="caption" sx={{ fontWeight: 700, px: 1 }}>
            Screen {screenIndex + 1} of {totalScreens}
          </Typography>

          <IconButton
            size="small"
            disabled={screenIndex >= totalScreens - 1}
            onClick={onNext}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: (theme) => theme.customShadows?.z8,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Iconify icon="solar:alt-arrow-right-bold" width={16} />
          </IconButton>
        </Stack>
      )}
    </Stack>
  );
}
