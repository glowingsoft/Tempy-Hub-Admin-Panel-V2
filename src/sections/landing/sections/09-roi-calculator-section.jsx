import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import { TiltCard } from '../components/tilt-card';

/**
 * 9. ROI CALCULATOR in MUI (uses MUI Slider)
 */
export function RoiCalculatorSection() {
  const [beds, setBeds] = useState(45);
  const [agencyHours, setAgencyHours] = useState(280);

  const monthlySavings = Math.round(agencyHours * 12.5);
  const adminHoursSaved = Math.min(28, Math.max(8, Math.round(beds * 0.35)));

  return (
    <Box
      component="section"
      id="calculator"
      className="tempy-section theme-paper"
      sx={{
        py: { xs: 6, md: 8.5 },
        bgcolor: '#FFFFFF',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography className="tempy-mono" sx={{ fontSize: 10.5, color: 'var(--indigo)', letterSpacing: '0.12em' }}>
            PROJECTED FINANCIAL RETURN
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
            CALCULATE YOUR OPERATIONAL SAVINGS.
          </Typography>
          <Typography className="tempy-body" sx={{ fontSize: 17, color: '#5B6075', maxWidth: 600, mx: 'auto', mt: 1.75 }}>
            Adjust the sliders to reflect your home’s scale and discover the bottom-line impact in your first quarter.
          </Typography>
        </Box>

        {/* 3D Tilt Calculator Card */}
        <TiltCard
          sx={{
            bgcolor: '#F1F1FC',
            borderRadius: 3,
            border: '1px solid #E6E7F3',
            p: { xs: 3, md: 6 },
            boxShadow: '0 16px 40px rgba(84, 88, 216, 0.08)',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
              gap: { xs: 4, md: 6 },
              alignItems: 'center',
            }}
          >
            {/* Left: Interactive Sliders with MUI Slider */}
            <Stack spacing={4}>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
                  <Typography className="tempy-mono" sx={{ fontSize: 12, color: '#1B1F2E', fontWeight: 600 }}>
                    NUMBER OF REGISTERED BEDS
                  </Typography>
                  <Typography className="tempy-display" sx={{ fontSize: 22, color: 'var(--indigo)', fontWeight: 800 }}>
                    {beds} <Box component="span" sx={{ fontSize: 13, color: '#5B6075' }}>BEDS</Box>
                  </Typography>
                </Stack>
                <Slider
                  min={15}
                  max={250}
                  step={5}
                  value={beds}
                  onChange={(e, val) => setBeds(val)}
                  sx={{
                    color: 'var(--indigo)',
                    '& .MuiSlider-thumb': {
                      width: 20,
                      height: 20,
                    },
                  }}
                />
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
                  <Typography className="tempy-mono" sx={{ fontSize: 12, color: '#1B1F2E', fontWeight: 600 }}>
                    ESTIMATED MONTHLY AGENCY HOURS
                  </Typography>
                  <Typography className="tempy-display" sx={{ fontSize: 22, color: 'var(--indigo)', fontWeight: 800 }}>
                    {agencyHours} <Box component="span" sx={{ fontSize: 13, color: '#5B6075' }}>HRS</Box>
                  </Typography>
                </Stack>
                <Slider
                  min={40}
                  max={800}
                  step={20}
                  value={agencyHours}
                  onChange={(e, val) => setAgencyHours(val)}
                  sx={{
                    color: 'var(--indigo)',
                    '& .MuiSlider-thumb': {
                      width: 20,
                      height: 20,
                    },
                  }}
                />
              </Box>

              <Typography className="tempy-body" sx={{ fontSize: 13, color: '#5B6075' }}>
                Based on UK national care home benchmarks for agency margin recovery and internal staff rota uptake.
              </Typography>
            </Stack>

            {/* Right: Calculated Metrics Output */}
            <Box
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: 2.25,
                p: { xs: 3, md: 4.5 },
                border: '1px solid #E6E7F3',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              }}
            >
              <Box>
                <Typography className="tempy-mono" sx={{ fontSize: 10, color: '#5B6075' }}>
                  ESTIMATED MONTHLY AGENCY SAVINGS
                </Typography>
                <Typography className="tempy-display" sx={{ fontSize: { xs: 32, md: 44 }, color: '#1B1F2E', fontWeight: 800 }}>
                  £{monthlySavings.toLocaleString()}
                  <Box component="span" sx={{ fontSize: 20, color: '#22C55E' }}>+</Box>
                </Typography>
              </Box>

              <Box sx={{ borderTop: '1px solid #E6E7F3', pt: 2 }}>
                <Typography className="tempy-mono" sx={{ fontSize: 10, color: '#5B6075' }}>
                  MANAGER ADMIN HOURS RECLAIMED WEEKLY
                </Typography>
                <Typography className="tempy-display" sx={{ fontSize: 28, color: 'var(--indigo)', fontWeight: 800 }}>
                  {adminHoursSaved} HRS <Box component="span" sx={{ fontSize: 14, color: '#5B6075' }}>/ WEEK</Box>
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#22C55E' }}>
                <Box component="span">✓</Box>
                <Typography className="tempy-mono" sx={{ fontSize: 11, fontWeight: 600 }}>
                  ESTIMATED PAYBACK PERIOD UNDER 30 DAYS
                </Typography>
              </Stack>

              <Button
                href="#demo"
                variant="contained"
                className="tempy-btn-primary"
                data-cursor="button"
                fullWidth
                sx={{
                  bgcolor: 'var(--indigo)',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  py: 1.5,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  boxShadow: '0 4px 18px rgba(84, 88, 216, 0.35)',
                  '&:hover': {
                    bgcolor: 'var(--indigo-2)',
                  },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  SEE HOW MUCH YOUR HOME CAN SAVE
                </Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  SEE MORE
                </Box>
              </Button>
            </Box>
          </Box>
        </TiltCard>
      </Container>
    </Box>
  );
}
