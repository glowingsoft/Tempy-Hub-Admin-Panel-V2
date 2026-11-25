import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { LANDING_IMAGES } from '../assets';
import { LANDING_PAGE_DATA } from '../data/landing-page-data';

/**
 * 08B. RECEPTION KIOSK HARDWARE SHOWCASE
 * Layout reorganized to exact 5fr : 7fr grid specification,
 * with full-width specification strip in Row 3 and balanced column baselines.
 */
export function KioskHardwareSection() {
  const kioskData = LANDING_PAGE_DATA.kioskHardware;
  const KIOSK_FEATURES = kioskData.features;

  // Refresh ScrollTrigger after layout and images mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  }, []);

  return (
    <Box
      component="section"
      id="kiosk"
      className="tempy-section theme-night"
      sx={{
        py: { xs: 6, md: 8.5 },
        position: 'relative',
        bgcolor: '#0E1020',
        color: '#FFFFFF',
        overflow: 'hidden',
        borderTop: '1px solid rgba(84, 88, 216, 0.15)',
      }}
    >
      {/* Background Ambient Radial Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '10%',
          width: { xs: 350, md: 600 },
          height: { xs: 350, md: 600 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(84, 88, 216, 0.16) 0%, rgba(14, 16, 32, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Unified xl Centered Container */}
      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Section Header: Mono Kicker, Headline, 62ch Intro, 48px Gap */}
        <Box sx={{ mb: '32px' }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--indigo)', boxShadow: '0 0 10px #5458D8' }} />
            <Typography className="tempy-mono" sx={{ fontSize: 10.5, color: '#7478E8', letterSpacing: '0.14em', fontWeight: 700 }}>
              {kioskData.kicker}
            </Typography>
          </Stack>

          <Typography
            component="h2"
            className="tempy-display"
            sx={{
              fontSize: { xs: '26px', sm: '34px', md: '42px' },
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              color: '#FFFFFF',
              mb: 1.75,
            }}
          >
            {kioskData.headline}
          </Typography>

          <Typography
            className="tempy-body"
            sx={{
              fontSize: { xs: 14, md: 15.5 },
              color: 'rgba(255, 255, 255, 0.72)',
              maxWidth: '62ch',
              lineHeight: 1.55,
            }}
          >
            {kioskData.intro}
          </Typography>
        </Box>

        {/* 2-Column Grid: 5fr (Left) / 7fr (Right) on >=1024px, 1fr on <1024px */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' },
            gap: '24px',
            alignItems: 'stretch',
          }}
        >
          {/* ================================================================ */}
          {/* LEFT: Tall Reception Photo Card (5fr, min-height 640px)          */}
          {/* ================================================================ */}
          <Box
            sx={{
              height: '100%',
              minHeight: { xs: 'auto', lg: '640px' },
              borderRadius: 3.5,
              bgcolor: '#1B1F2E',
              border: '1px solid rgba(84, 88, 216, 0.35)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.45)',
              overflow: 'hidden',
              position: 'relative',
              transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
              order: { xs: 1, lg: 1 },
              '&:hover': {
                borderColor: '#5458D8',
                boxShadow: '0 20px 55px rgba(84, 88, 216, 0.25)',
              },
            }}
          >
            {/* Image (Cover, Position: 50% 40%) */}
            <Box
              component="img"
              src={LANDING_IMAGES.kioskTabletReception}
              alt="Tempy Hub Wall-Mounted Reception Tablet Kiosk"
              onLoad={() => {
                if (typeof window !== 'undefined' && window.ScrollTrigger) {
                  window.ScrollTrigger.refresh();
                }
              }}
              sx={{
                width: '100%',
                height: '100%',
                minHeight: { xs: 'auto', lg: '100%' },
                aspectRatio: { xs: '4/3', lg: 'unset' },
                objectFit: 'cover',
                objectPosition: '50% 40%',
                display: 'block',
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': { transform: 'scale(1.03)' },
              }}
            />

            {/* "ONLINE · 24V POWERED" Pill (Top-Left) */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                py: 0.75,
                px: 1.5,
                borderRadius: 9999,
                bgcolor: 'rgba(14, 16, 32, 0.88)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
                zIndex: 3,
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: '#22C55E',
                  boxShadow: '0 0 8px #22C55E',
                  animation: 'pulseKioskDot 2s infinite ease-in-out',
                }}
              />
              <Typography className="tempy-mono" sx={{ fontSize: 10, fontWeight: 800, color: '#22C55E' }}>
                ONLINE · 24V POWERED
              </Typography>
            </Stack>
          </Box>

          {/* ================================================================ */}
          {/* RIGHT: 3 Rows (auto 1fr auto) to ensure matching baseline        */}
          {/* ================================================================ */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: { xs: 'auto', lg: 'auto 1fr auto' },
              gap: '24px',
              height: '100%',
              order: { xs: 2, lg: 2 },
            }}
          >
            {/* ROW 1: PIN-pad photo (Aspect 16/9) */}
            <Box
              sx={{
                borderRadius: 3.5,
                bgcolor: '#1B1F2E',
                border: '1px solid rgba(84, 88, 216, 0.35)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.45)',
                overflow: 'hidden',
                position: 'relative',
                aspectRatio: '16/9',
                width: '100%',
                transition: 'border-color 0.35s ease',
                order: { xs: 2, lg: 1 },
                '&:hover': { borderColor: '#5458D8' },
              }}
            >
              <Box
                component="img"
                src={LANDING_IMAGES.bento03Kiosk}
                alt="Care Home Reception Staff Interacting with Tempy Kiosk PIN-pad"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />

              {/* "SARAH J. · SENIOR CARER CLOCKED IN" Pill (Bottom-Left) */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  py: 0.75,
                  px: 1.75,
                  borderRadius: 9999,
                  bgcolor: 'rgba(14, 16, 32, 0.9)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)',
                  zIndex: 3,
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22C55E' }} />
                <Typography className="tempy-mono" sx={{ fontSize: 10.5, fontWeight: 700, color: '#FFFFFF' }}>
                  SARAH J. · SENIOR CARER CLOCKED IN
                </Typography>
              </Box>
            </Box>

            {/* ROW 2: 3 Feature Cards (3-column grid, gap 16px, equal height) */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: '16px',
                height: '100%',
                order: { xs: 3, lg: 2 },
              }}
            >
              {KIOSK_FEATURES.map((feat) => (
                <Box
                  key={feat.idx}
                  sx={{
                    p: { xs: '18px', sm: '20px' },
                    borderRadius: 3,
                    bgcolor: 'rgba(27, 31, 46, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    transition: 'border-color 0.3s ease, transform 0.3s ease',
                    '&:hover': {
                      borderColor: feat.accent,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          bgcolor: `color-mix(in srgb, ${feat.accent} 15%, transparent)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: feat.accent,
                        }}
                      >
                        <Iconify icon={feat.icon} width={20} />
                      </Box>
                      <Typography className="tempy-mono" sx={{ fontSize: 12, fontWeight: 800, color: 'rgba(255, 255, 255, 0.35)' }}>
                        {feat.idx}
                      </Typography>
                    </Stack>

                    {/* Title Area with min-height 2 lines */}
                    <Typography
                      className="tempy-display"
                      sx={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: '#FFFFFF',
                        lineHeight: 1.3,
                        mb: 1.25,
                        minHeight: '2.6em',
                      }}
                    >
                      {feat.title}
                    </Typography>

                    {/* Body Text 14px / 1.5 */}
                    <Typography
                      className="tempy-body"
                      sx={{
                        fontSize: '14px',
                        lineHeight: 1.5,
                        color: 'rgba(255, 255, 255, 0.65)',
                      }}
                    >
                      {feat.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* ROW 3: Full-Width Specification Strip (Moved Out of Left Photo) */}
            <Box
              sx={{
                p: { xs: '18px', sm: '16px 20px' },
                borderRadius: 3,
                bgcolor: '#1B1F2E',
                border: '1px solid rgba(84, 88, 216, 0.35)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between',
                gap: '16px',
                order: { xs: 4, lg: 3 },
              }}
            >
              {/* Specification Title */}
              <Box>
                <Typography className="tempy-mono" sx={{ fontSize: 9.5, color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.08em' }}>
                  SPECIFICATION:
                </Typography>
                <Typography className="tempy-display" sx={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                  INDUSTRIAL VESA WALL MOUNT
                </Typography>
              </Box>

              {/* Mono Spec Chips on the Right Side */}
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ bgcolor: 'rgba(255,255,255,0.04)', px: 1.25, py: 0.5, borderRadius: 1.2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Iconify icon="solar:battery-charge-bold" width={13} sx={{ color: '#22C55E' }} />
                  <Typography className="tempy-mono" sx={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                    72h Offline Cache
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ bgcolor: 'rgba(255,255,255,0.04)', px: 1.25, py: 0.5, borderRadius: 1.2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Iconify icon="solar:shield-check-bold" width={13} sx={{ color: '#38BDF8' }} />
                  <Typography className="tempy-mono" sx={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                    Tamper-Proof VESA
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ bgcolor: 'rgba(255,255,255,0.04)', px: 1.25, py: 0.5, borderRadius: 1.2, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Iconify icon="solar:bolt-bold" width={13} sx={{ color: '#FFAB00' }} />
                  <Typography className="tempy-mono" sx={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                    PoE Ready
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ bgcolor: 'rgba(84,88,216,0.1)', px: 1.25, py: 0.5, borderRadius: 1.2, border: '1px solid rgba(84,88,216,0.3)' }}>
                  <Iconify icon="solar:devices-bold" width={13} sx={{ color: '#7478E8' }} />
                  <Typography className="tempy-mono" sx={{ fontSize: 10, color: '#7478E8', fontWeight: 700 }}>
                    Touch Terminal
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Container>

      <style>{`
        @keyframes pulseKioskDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </Box>
  );
}
