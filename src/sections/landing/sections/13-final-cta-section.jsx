import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Iconify } from 'src/components/iconify';
import { LANDING_CONTENT } from '../config/landing-content';

/**
 * 13. FINAL CTA in MUI:
 * Continuously rotating concentric orbital rings with glowing satellite nodes,
 * framing the core consultation headline.
 */
export function FinalCtaSection() {
  const content = LANDING_CONTENT.finalCta;

  return (
    <Box
      component="section"
      id="demo"
      className="tempy-section theme-night"
      sx={{
        width: '100%',
        minHeight: 'calc(85vh / var(--landing-viewport-scale))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 7, md: 10 },
        position: 'relative',
        bgcolor: '#0E1020',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Central Ambient Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: 350, md: 650 },
          height: { xs: 350, md: 650 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(84, 88, 216, 0.22) 0%, rgba(14, 16, 32, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Continuously Rotating Orbital Concentric Rings */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 1,
          width: 0,
          height: 0,
        }}
      >
        {/* Ring 1 (Inner): 280px, Clockwise */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: { xs: 240, md: 280 },
            height: { xs: 240, md: 280 },
            borderRadius: '50%',
            border: '1.5px dashed rgba(84, 88, 216, 0.4)',
            transform: 'translate(-50%, -50%)',
            animation: 'ringRotateCW 22s linear infinite',
          }}
        />

        {/* Ring 2 (Mid-Inner): 440px, Counter-Clockwise with glowing node */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: { xs: 360, md: 440 },
            height: { xs: 360, md: 440 },
            borderRadius: '50%',
            border: '1px solid rgba(84, 88, 216, 0.25)',
            transform: 'translate(-50%, -50%)',
            animation: 'ringRotateCCW 34s linear infinite',
          }}
        >
          {/* Orbital satellite node */}
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#7478E8',
              boxShadow: '0 0 10px #7478E8',
            }}
          />
        </Box>

        {/* Ring 3 (Mid): 620px, Clockwise with 2 orbital nodes */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: { xs: 480, md: 620 },
            height: { xs: 480, md: 620 },
            borderRadius: '50%',
            border: '1.5px dashed rgba(116, 120, 232, 0.3)',
            transform: 'translate(-50%, -50%)',
            animation: 'ringRotateCW 48s linear infinite',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: -4,
              transform: 'translateY(-50%)',
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: '#38BDF8',
              boxShadow: '0 0 8px #38BDF8',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: -4,
              transform: 'translateY(-50%)',
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: '#22C55E',
              boxShadow: '0 0 8px #22C55E',
            }}
          />
        </Box>

        {/* Ring 4 (Outer): 800px, Counter-Clockwise */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: { xs: 620, md: 800 },
            height: { xs: 620, md: 800 },
            borderRadius: '50%',
            border: '1px solid rgba(84, 88, 216, 0.18)',
            transform: 'translate(-50%, -50%)',
            animation: 'ringRotateCCW 65s linear infinite',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 120,
              left: 40,
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: '#7478E8',
              boxShadow: '0 0 8px #7478E8',
            }}
          />
        </Box>

        {/* Ring 5 (Far Outer): 1000px, Clockwise */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: { xs: 780, md: 1000 },
            height: { xs: 780, md: 1000 },
            borderRadius: '50%',
            border: '1.5px dashed rgba(84, 88, 216, 0.15)',
            transform: 'translate(-50%, -50%)',
            animation: 'ringRotateCW 85s linear infinite',
          }}
        />

        {/* Ring 6 (Boundary): 1220px, Counter-Clockwise */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: { xs: 940, md: 1220 },
            height: { xs: 940, md: 1220 },
            borderRadius: '50%',
            border: '1px solid rgba(84, 88, 216, 0.08)',
            transform: 'translate(-50%, -50%)',
            animation: 'ringRotateCCW 110s linear infinite',
          }}
        />
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 3 }}>
        <Typography
          className="tempy-mono"
          sx={{
            fontSize: { xs: 11, sm: 12 },
            color: '#7478E8',
            letterSpacing: '0.16em',
            fontWeight: 800,
            mb: 2,
            textTransform: 'uppercase',
          }}
        >
          SCHEDULE YOUR CONSULTATION
        </Typography>

        <Typography
          component="h2"
          className="tempy-display"
          sx={{
            fontSize: { xs: '28px', sm: '40px', md: '52px' },
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.08,
            maxWidth: 880,
            mx: 'auto',
            mb: 3.5,
            letterSpacing: '-0.025em',
          }}
        >
          {content.headline}
        </Typography>

        {/* Clean Consultation Specialist Action Link */}
        <Box sx={{ mt: 2 }}>
          <Link
            href="#contact"
            underline="none"
            className="tempy-mono"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              fontSize: 13,
              fontWeight: 700,
              color: '#7478E8',
              letterSpacing: '0.08em',
              py: 1,
              px: 2.5,
              borderRadius: 9999,
              bgcolor: 'rgba(84, 88, 216, 0.08)',
              border: '1px solid rgba(84, 88, 216, 0.25)',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#FFFFFF',
                bgcolor: 'rgba(84, 88, 216, 0.2)',
                borderColor: '#5458D8',
                boxShadow: '0 0 16px rgba(84, 88, 216, 0.35)',
              },
            }}
          >
            {content.secondary}
            <Iconify icon="solar:arrow-right-linear" width={16} />
          </Link>
        </Box>
      </Container>

      {/* Rotation Keyframes */}
      <style>{`
        @keyframes ringRotateCW {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        @keyframes ringRotateCCW {
          from {
            transform: translate(-50%, -50%) rotate(360deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }
      `}</style>
    </Box>
  );
}

