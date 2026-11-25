import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { LANDING_CONTENT } from '../config/landing-content';

/**
 * 3. BEFORE / AFTER JOURNEY in MUI
 */
export function JourneySection() {
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const pairs = LANDING_CONTENT.journeyPairs;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / (rect.height - vh)));
      const step = Math.min(pairs.length - 1, Math.floor(progress * pairs.length));
      setActiveStep(step);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pairs.length]);

  return (
    <Box
      component="section"
      id="journey"
      ref={containerRef}
      className="tempy-section theme-paper"
      sx={{
        py: { xs: 6, md: 9 },
        bgcolor: '#FFFFFF',
        position: 'relative',
      }}
    >
      <Container>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <Typography className="tempy-mono" sx={{ fontSize: 10.5, color: 'var(--indigo)', letterSpacing: '0.12em' }}>
            THE TRANSFORMATION
          </Typography>
          <Typography
            className="tempy-display"
            sx={{
              fontSize: { xs: '26px', sm: '36px', md: '44px' },
              fontWeight: 800,
              color: '#1B1F2E',
              mt: 1.25,
            }}
          >
            FROM CHAOS TO SYSTEMATIC CALM.
          </Typography>
          <Typography className="tempy-body" sx={{ fontSize: { xs: 15, md: 16 }, color: '#5B6075', maxWidth: 600, mx: 'auto', mt: 1.5 }}>
            See how everyday friction in UK care homes disappears when operations unite into a single platform.
          </Typography>
        </Box>

        {/* The Road Container */}
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 7, maxWidth: 1040, mx: 'auto', width: '100%' }}>
          {/* Vertical Road Line */}
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              top: 20,
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 2,
              bgcolor: '#E6E7F3',
              zIndex: 1,
            }}
          />

          {pairs.map((pair, idx) => {
            const isPassed = activeStep >= idx;

            return (
              <Box
                key={idx}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 60px 1fr' },
                  gap: 3,
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {/* Left: Before Tempy Hub */}
                <Box
                  sx={{
                    textAlign: { xs: 'left', md: 'right' },
                    p: 3,
                    borderRadius: 2,
                    bgcolor: isPassed ? 'rgba(27, 31, 46, 0.02)' : 'rgba(255, 72, 66, 0.04)',
                    border: `1px solid ${isPassed ? 'rgba(27, 31, 46, 0.06)' : 'rgba(255, 72, 66, 0.2)'}`,
                    transition: 'all 0.4s ease',
                    opacity: isPassed ? 0.45 : 1,
                  }}
                >
                  <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center" sx={{ mb: 1 }}>
                    <Typography className="tempy-mono" sx={{ fontSize: 10, color: '#FF4842' }}>
                      BEFORE TEMPY HUB
                    </Typography>
                    <Box component="span" sx={{ color: '#FF4842', fontWeight: 'bold' }}>✕</Box>
                  </Stack>
                  <Typography
                    className="tempy-body"
                    sx={{
                      fontSize: 15,
                      color: isPassed ? '#5B6075' : '#1B1F2E',
                      textDecoration: isPassed ? 'line-through' : 'none',
                    }}
                  >
                    {pair.before}
                  </Typography>
                </Box>

                {/* Center Marker */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center' }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      bgcolor: isPassed ? 'var(--indigo)' : '#FFFFFF',
                      border: `2px solid ${isPassed ? '#5458D8' : '#E6E7F3'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isPassed ? '0 0 16px rgba(84, 88, 216, 0.45)' : 'none',
                      transition: 'all 0.4s ease',
                    }}
                  >
                    <Typography className="tempy-mono" sx={{ fontSize: 11, color: isPassed ? '#FFFFFF' : '#5B6075' }}>
                      0{idx + 1}
                    </Typography>
                  </Box>
                </Box>

                {/* Right: After Tempy Hub */}
                <Box
                  sx={{
                    textAlign: 'left',
                    p: 3,
                    borderRadius: 2,
                    bgcolor: isPassed ? 'rgba(84, 88, 216, 0.05)' : '#FFFFFF',
                    border: `1px solid ${isPassed ? '#5458D8' : '#E6E7F3'}`,
                    boxShadow: isPassed ? '0 12px 28px rgba(84, 88, 216, 0.12)' : 'none',
                    transform: isPassed ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'all 0.4s ease',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Box component="span" sx={{ color: '#22C55E', fontWeight: 'bold' }}>✓</Box>
                    <Typography className="tempy-mono" sx={{ fontSize: 10, color: '#22C55E' }}>
                      WITH TEMPY HUB
                    </Typography>
                  </Stack>
                  <Typography
                    className="tempy-body"
                    sx={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#1B1F2E',
                    }}
                  >
                    {pair.after}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
