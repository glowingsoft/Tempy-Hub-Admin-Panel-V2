import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Iconify } from 'src/components/iconify';
import { LANDING_IMAGES } from '../assets';
import { LANDING_PAGE_DATA } from '../data/landing-page-data';

export function SafetyEvacuationSection() {
  const evacData = LANDING_PAGE_DATA.evacuation;
  const FLOOR_PLAN_PINS = evacData.floorPlanPins;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activePin, setActivePin] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = 3;

  // Auto-advance carousel every 6s unless paused by mouse hover

  return (
    <Box
      component="section"
      id="safety"
      className="tempy-section theme-night evac"
      sx={{
        width: '100%',
        position: 'relative',
        bgcolor: '#0E1020',
        color: '#FFFFFF',
        overflow: 'hidden',
        py: { xs: 6, md: 8.5 },
      }}
    >
      {/* Background ambient radial glow */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: 350, md: 800 },
          height: { xs: 350, md: 800 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(116, 120, 232, 0.14) 0%, rgba(14, 16, 32, 0) 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1.15fr' },
            gap: { xs: 6, lg: 8 },
            alignItems: 'center',
          }}
        >
          {/* Left Column: Headline, Body, and 3 Bullet Checks */}
          <Box sx={{ maxWidth: 520 }}>
            {/* Mono Kicker */}
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#7478E8', boxShadow: '0 0 10px #7478E8' }} />
              <Typography
                className="tempy-mono"
                sx={{
                  fontSize: 10.5,
                  color: '#7478E8',
                  letterSpacing: '0.12em',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {evacData.kicker}
              </Typography>
            </Stack>

            {/* Display Headline */}
            <Typography
              component="h2"
              className="tempy-display"
              sx={{
                fontSize: { xs: '26px', sm: '34px', md: '40px' },
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: '-0.025em',
                color: '#FFFFFF',
                mb: 2,
              }}
            >
              {evacData.headline}
            </Typography>

            {/* Introductory Body Copy */}
            <Typography
              className="tempy-body"
              sx={{
                fontSize: { xs: 14, sm: 15 },
                color: 'rgba(255, 255, 255, 0.76)',
                lineHeight: 1.55,
                mb: 3,
              }}
            >
              {evacData.body}
            </Typography>

            {/* 3 Checkmark Bullet Points */}
            <Stack spacing={3}>
              {evacData.checks.map((item, idx) => (
                <Stack key={idx} direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'rgba(116, 120, 232, 0.22)',
                      border: '1.5px solid #7478E8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: 0.25,
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon="solar:check-read-bold" width={14} sx={{ color: '#7478E8' }} />
                  </Box>
                  <Box>
                    <Typography component="span" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: 15.5 }}>
                      {item.title}{' '}
                    </Typography>
                    <Typography component="span" sx={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: 15 }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* Right Column: Uniform-Sized Image Carousel */}
          <Box
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            sx={{
              width: '100%',
              bgcolor: '#131628',
              borderRadius: '24px',
              border: '1px solid rgba(84, 88, 216, 0.35)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(84, 88, 216, 0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Slide Viewport: Uniform 16/10 Aspect Ratio for All Images */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 10',
                overflow: 'hidden',
                bgcolor: '#0B0D18',
              }}
            >
              {/* Floating Prev / Next Arrow Controls */}
              <IconButton
                size="small"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)}
                sx={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 15,
                  color: '#FFFFFF',
                  bgcolor: 'rgba(14, 16, 32, 0.72)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(84, 88, 216, 0.35)',
                  '&:hover': { bgcolor: 'rgba(84, 88, 216, 0.6)' },
                  width: 36,
                  height: 36,
                }}
              >
                <Iconify icon="solar:alt-arrow-left-linear" width={18} />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % totalSlides)}
                sx={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 15,
                  color: '#FFFFFF',
                  bgcolor: 'rgba(14, 16, 32, 0.72)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(84, 88, 216, 0.35)',
                  '&:hover': { bgcolor: 'rgba(84, 88, 216, 0.6)' },
                  width: 36,
                  height: 36,
                }}
              >
                <Iconify icon="solar:alt-arrow-right-linear" width={18} />
              </IconButton>
              {/* ========================================================================= */}
              {/* SLIDE 0: Cutaway Floor Plan with Room Pins (Clean, No Top Heading)       */}
              {/* ========================================================================= */}
              {currentSlide === 0 && (
                <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                  {/* Floor Plan Background Image */}
                  <Box
                    component="img"
                    src={LANDING_IMAGES.cutawayFloorPlan}
                    alt="Tempy Hub Cutaway Floor Plan with PEEP Pins"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      filter: 'brightness(0.92) contrast(1.05)',
                    }}
                  />

                  {/* Room Pins with Interactive Pulse Waves */}
                  {FLOOR_PLAN_PINS.map((pin) => (
                    <Box
                      key={pin.id}
                      onMouseEnter={() => setActivePin(pin.id)}
                      onMouseLeave={() => setActivePin(null)}
                      onClick={() => setActivePin(activePin === pin.id ? null : pin.id)}
                      sx={{
                        position: 'absolute',
                        top: pin.top,
                        left: pin.left,
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        zIndex: activePin === pin.id ? 20 : 10,
                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        '&:hover': {
                          transform: 'translate(-50%, -55%) scale(1.15)',
                        },
                      }}
                    >
                      {/* Radar Pulse Wave */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 14,
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          border: `2px solid ${pin.color}`,
                          animation: 'pinRadarPulse 2.2s infinite',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Teardrop Pin Marker */}
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50% 50% 50% 0',
                          transform: 'rotate(-45deg)',
                          bgcolor: pin.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 0 16px ${pin.color}, 0 4px 10px rgba(0,0,0,0.6)`,
                          border: '2px solid #FFFFFF',
                        }}
                      >
                        <Box sx={{ transform: 'rotate(45deg)' }}>
                          <Iconify icon="solar:user-bold" width={14} sx={{ color: '#FFFFFF' }} />
                        </Box>
                      </Box>

                      {/* Floating Label */}
                      <Box
                        sx={{
                          mt: 0.5,
                          px: 1,
                          py: 0.3,
                          borderRadius: 1,
                          bgcolor: 'rgba(14, 16, 32, 0.92)',
                          border: `1px solid ${pin.color}`,
                          backdropFilter: 'blur(8px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.6,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: pin.color }} />
                        <Typography className="tempy-mono" sx={{ fontSize: 9.5, fontWeight: 700, color: '#FFFFFF' }}>
                          {pin.room}
                        </Typography>
                        <Typography className="tempy-mono" sx={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>
                          {pin.resident}
                        </Typography>
                      </Box>

                      {/* Detailed Tooltip on Hover/Click */}
                      {activePin === pin.id && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: '100%',
                            mb: 1.5,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'rgba(14, 16, 32, 0.96)',
                            border: `1px solid ${pin.color}`,
                            backdropFilter: 'blur(16px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
                            minWidth: 200,
                            pointerEvents: 'none',
                            zIndex: 30,
                            animation: 'fadeIn 0.2s ease-out',
                          }}
                        >
                          <Typography className="tempy-display" sx={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>
                            {pin.resident} ({pin.room})
                          </Typography>
                          <Typography className="tempy-mono" sx={{ fontSize: 10, color: pin.color, fontWeight: 600, mt: 0.25 }}>
                            STATUS: {pin.status}
                          </Typography>
                          <Typography className="tempy-body" sx={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
                            {pin.desc}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}

              {/* ========================================================================= */}
              {/* SLIDE 1: Kiosk Emergency Fire Press (Uniform Size, Clean)                 */}
              {/* ========================================================================= */}
              {currentSlide === 1 && (
                <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Box
                    component="img"
                    src={LANDING_IMAGES.kioskFirePressInset}
                    alt="Reception Tablet Kiosk Emergency Fire Press"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Box>
              )}

              {/* ========================================================================= */}
              {/* SLIDE 2: Bento-04 PEEP Resident Records File (Uniform Size, Clean)        */}
              {/* ========================================================================= */}
              {currentSlide === 2 && (
                <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Box
                    component="img"
                    src={LANDING_IMAGES.bento04Peep}
                    alt="Resident Personal Emergency Evacuation Plan Record"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Bottom Carousel Indicator Dots */}
            <Box
              sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                bgcolor: 'rgba(14, 16, 32, 0.95)',
                borderTop: '1px solid rgba(84, 88, 216, 0.15)',
              }}
            >
              {[0, 1, 2].map((idx) => (
                <Box
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  sx={{
                    width: currentSlide === idx ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: currentSlide === idx ? 'var(--indigo)' : 'rgba(255, 255, 255, 0.25)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: currentSlide === idx ? 'var(--indigo)' : 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Radar pulse keyframes */}
      <style>{`
        @keyframes pinRadarPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.6);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.2);
            opacity: 0;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
}
