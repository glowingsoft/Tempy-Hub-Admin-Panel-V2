import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { MaskUpLines } from '../components/text-fx';
import { LANDING_IMAGES } from '../assets';
import { LANDING_CONTENT } from '../config/landing-content';

/**
 * 7. IMAGE BANNER WITH CLOUD in MUI
 * Full-width cinematic banner with balanced, uniform gradient transitions
 */
export function CinematicBannerSection() {
  const content = LANDING_CONTENT.cinematic;

  return (
    <Box
      component="section"
      className="tempy-section theme-night"
      sx={{
        minHeight: {
          xs: '60vh',
          md: '75vh',
        },
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 7, md: 9 },
        overflow: 'hidden',
        bgcolor: '#0E1020',
      }}
    >
      {/* Background Image with Ken Burns animation */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${LANDING_IMAGES.gardenWalkCinematic})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          animation: 'kenBurns 22s ease-in-out infinite alternate',
          transformOrigin: 'center center',
          filter: 'brightness(0.52) saturate(1.15)',
        }}
      />

      {/* Uniform Cinematic Vignette Overlay (Symmetrical Across Full Width) */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(14, 16, 32, 0.35) 0%, rgba(14, 16, 32, 0.88) 100%)',
          zIndex: 1,
        }}
      />

      {/* Seamless Top Fade (blends cleanly from previous section) */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: { xs: 80, md: 140 },
          background: 'linear-gradient(to bottom, #0E1020 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Seamless Bottom Fade (blends evenly into Section 08 across entire width) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: { xs: 120, md: 200 },
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(14, 16, 32, 0.6) 50%, #0E1020 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Content */}
      <Container
        sx={{
          position: 'relative',
          zIndex: 3,
          textAlign: 'center',
          mx: 'auto',
        }}
      >
        <MaskUpLines
          lines={['CARE THAT WORKS', 'AS HARD AS YOU DO.']}
          className="tempy-display"
          sx={{
            fontSize: { xs: '28px', sm: '42px', md: '54px' },
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
          }}
        />

        {/* Micro-points */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 4 }}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 4.5 }}
        >
          {content.points.map((pt, idx) => (
            <Stack key={idx} direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'var(--indigo)' }} />
              <Typography className="tempy-mono" sx={{ fontSize: 12, color: '#FFFFFF', letterSpacing: '0.12em' }}>
                {pt}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

