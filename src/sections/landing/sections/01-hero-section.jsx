import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { LANDING_IMAGES } from '../assets';
import { LANDING_PAGE_DATA } from '../data/landing-page-data';

export function HeroSection() {
  const content = LANDING_PAGE_DATA.hero;

  return (
    <Box
      component="section"
      id="hero"
      className="hero tempy-section theme-night"
      sx={{
        minHeight: { xs: 'auto', lg: '100vh' },
        width: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0E1020',
        overflow: 'hidden',
        color: '#FFFFFF',
        pt: { xs: 9, md: 8.5 },
        pb: { xs: 4, lg: 3 },
      }}
    >
      {/* Background ambient lighting */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '5%',
          width: { xs: 320, md: 720 },
          height: { xs: 320, md: 720 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(84, 88, 216, 0.22) 0%, rgba(14, 16, 32, 0) 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Main Grid Content aligned with Navbar via Container */}
      <Container
        sx={{
          position: 'relative',
          zIndex: 5,
          width: '100%',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.05fr) minmax(0, 1.15fr)',
          },
          columnGap: { lg: 6, xl: 7 },
          rowGap: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Left Column: Typography & CTAs */}
        <Stack
          spacing={2}
          sx={{
            zIndex: 6,
            position: 'relative',
            maxWidth: { xs: '100%', md: 540, lg: 580, xl: 640 },
            py: { xs: 1.5, lg: 2 },
          }}
        >
          {/* Mono Kicker with Shield Icon */}
          <Stack direction="row" spacing={1.25} alignItems="center" className="hero-kicker">
            <Iconify icon="solar:shield-check-bold" width={18} sx={{ color: '#7478E8' }} />
            <Typography
              className="tempy-mono"
              sx={{
                fontSize: { xs: 10, sm: 10.5 },
                color: '#7478E8',
                letterSpacing: '0.08em',
                fontWeight: 700,
              }}
            >
              {content.kicker}
            </Typography>
          </Stack>

          {/* Headline with text-wrap balance and responsive clamp */}
          <Typography
            component="h1"
            className="hero-h1-balanced tempy-display"
            sx={{
              fontSize: { xs: '28px', sm: '38px', md: '44px', lg: '48px', xl: '52px' },
              fontWeight: 800,
              letterSpacing: '-0.035em',
              color: '#FFFFFF',
              lineHeight: 1.08,
              textWrap: 'balance',
              m: 0,
            }}
          >
            {content.h1 || 'KNOW WHO IS IN THE BUILDING. EVERY SHIFT, EVERY VISIT.'}
          </Typography>

          {/* Body Paragraph */}
          <Typography
            className="hero-body tempy-body"
            sx={{
              fontSize: { xs: 14.5, md: 16 },
              color: 'rgba(255, 255, 255, 0.78)',
              maxWidth: 490,
              lineHeight: 1.55,
              mt: 0.25,
            }}
          >
            {content.body}
          </Typography>

          {/* CTA */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.75} sx={{ pt: 1 }} className="hero-ctas">
            <Button
              href="#platform"
              variant="contained"
              className="tempy-btn-primary"
              data-cursor="button"
              endIcon={<Iconify icon="solar:arrow-right-linear" width={17} />}
              sx={{
                bgcolor: 'var(--indigo) !important',
                color: '#FFFFFF !important',
                borderRadius: '9999px',
                py: 1.25,
                px: 3,
                fontFamily: 'var(--font-mono)',
                fontSize: 12.5,
                fontWeight: 600,
                boxShadow: '0 4px 18px rgba(84, 88, 216, 0.35)',
                '&:hover': {
                  bgcolor: 'var(--indigo-2) !important',
                  color: '#FFFFFF !important',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {content.primaryCta}
            </Button>
          </Stack>
        </Stack>

        {/* Right Column: Hero Visual Container (Borderless, Floating, Masked) */}
        <Box
          className="hero-visual-entrance"
          sx={{
            justifySelf: { xs: 'center', md: 'center' },
            width: '100%',
            maxWidth: { xs: 500, sm: 580, md: 580, lg: 660, xl: 720 },
            minWidth: 0,
            mt: { xs: 2, lg: 0 },
            position: 'relative',
            zIndex: 5,
          }}
        >
          <Box
            className="hero-visual-float"
            sx={{
              width: '100%',
              aspectRatio: '16 / 10',
              position: 'relative',
              borderRadius: '28px',
            }}
          >
            {/* Behind the image: blurred indigo ambient glow */}
            <Box
              sx={{
                position: 'absolute',
                inset: '-12%',
                background: 'radial-gradient(closest-side, rgba(84,88,216, 0.40), transparent 70%)',
                filter: 'blur(30px)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            {/* Masked Building Image with edge-fading radial gradient */}
            <Box
              component="img"
              src={LANDING_IMAGES.heroCareHome3d}
              alt="Tempy Hub Care Home 3D Digital Twin"
              fetchPriority="high"
              width={2000}
              height={1250}
              decoding="async"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '28px',
                display: 'block',
                position: 'relative',
                zIndex: 1,
                maskImage: {
                  xs: 'radial-gradient(closest-side at 50% 52%, #000 60%, transparent 100%)',
                  sm: 'radial-gradient(closest-side at 50% 52%, #000 66%, transparent 100%)',
                },
                WebkitMaskImage: {
                  xs: 'radial-gradient(closest-side at 50% 52%, #000 60%, transparent 100%)',
                  sm: 'radial-gradient(closest-side at 50% 52%, #000 66%, transparent 100%)',
                },
              }}
            />

            {/* Live 3D Twin Pill (Top-Left inside visual) */}
            <Box
              sx={{
                position: 'absolute',
                top: { xs: 12, sm: 18 },
                left: { xs: 12, sm: 18 },
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'rgba(14, 16, 32, 0.85)',
                border: '1px solid rgba(84, 88, 216, 0.45)',
                backdropFilter: 'blur(8px)',
                px: 1.5,
                py: 0.6,
                borderRadius: '9999px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: '#22C55E',
                  boxShadow: '0 0 8px #22C55E',
                }}
              />
              <Typography
                className="tempy-mono"
                sx={{ fontSize: { xs: 9.5, sm: 10 }, fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.06em' }}
              >
                {content.chips?.badge || 'LIVE 3D TWIN · ISOMETRIC'}
              </Typography>
            </Box>

            {/* Bottom-Left Chip: SHIFT FILLED IN 4 MIN */}
            <Box
              className="hero-chip-entrance hero-chip-1"
              sx={{
                position: 'absolute',
                bottom: { xs: 12, sm: 20 },
                left: { xs: 12, sm: 20 },
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'rgba(27, 31, 46, 0.72)',
                border: '1px solid rgba(116, 120, 232, 0.35)',
                backdropFilter: 'blur(12px)',
                borderRadius: '14px',
                px: { xs: 1.25, sm: 1.75 },
                py: { xs: 0.6, sm: 0.9 },
                boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                pointerEvents: 'none',
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#22C55E',
                  boxShadow: '0 0 6px #22C55E',
                  flexShrink: 0,
                }}
              />
              <Typography
                className="tempy-mono"
                sx={{
                  fontSize: { xs: 10, sm: 11 },
                  fontWeight: 600,
                  color: '#FFFFFF',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}
              >
                {content.chips?.bottomLeft || 'SHIFT FILLED IN 4 MIN · TEMPY CONNECT'}
              </Typography>
            </Box>

            {/* Top-Right Chip: 24 / 24 RESIDENTS SAFE (Hidden under 1024px) */}
            <Box
              className="hero-chip-entrance hero-chip-2"
              sx={{
                position: 'absolute',
                top: 18,
                right: 18,
                zIndex: 3,
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                gap: 1,
                bgcolor: 'rgba(27, 31, 46, 0.72)',
                border: '1px solid rgba(116, 120, 232, 0.35)',
                backdropFilter: 'blur(12px)',
                borderRadius: '14px',
                px: 1.75,
                py: 0.9,
                boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                pointerEvents: 'none',
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#22C55E',
                  boxShadow: '0 0 6px #22C55E',
                  flexShrink: 0,
                }}
              />
              <Typography
                className="tempy-mono"
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}
              >
                {content.chips?.topRight || '24 / 24 RESIDENTS SAFE'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Pure CSS Keyframe Animations & Reduced Motion Overrides */}
      <style>{`
        /* Entrance animation: slide in and fade */
        .hero-visual-entrance {
          animation: heroVisualEntrance 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes heroVisualEntrance {
          from {
            opacity: 0;
            transform: translateX(60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Idle float animation: 10px drift over 9s */
        .hero-visual-float {
          animation: heroVisualFloat 9s ease-in-out infinite;
        }

        @keyframes heroVisualFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Chips entrance: fade up from 16px */
        .hero-chip-entrance {
          opacity: 0;
          animation-name: heroChipEntrance;
          animation-duration: 0.8s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: forwards;
        }

        @keyframes heroChipEntrance {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-chip-1 {
          animation: heroChipEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards,
                     heroChipFloat1 6s ease-in-out 1.6s infinite;
        }

        .hero-chip-2 {
          animation: heroChipEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.0s forwards,
                     heroChipFloat2 6s ease-in-out 3.1s infinite;
        }

        @keyframes heroChipFloat1 {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes heroChipFloat2 {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(6px);
          }
        }

        /* Accessibility: Remove motion when reduced motion is preferred */
        @media (prefers-reduced-motion: reduce) {
          .hero-visual-entrance,
          .hero-visual-float,
          .hero-chip-entrance,
          .hero-chip-1,
          .hero-chip-2 {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </Box>
  );
}
