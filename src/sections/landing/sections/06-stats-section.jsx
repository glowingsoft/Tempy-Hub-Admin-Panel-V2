import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { CounterRoll } from '../components/text-fx';
import { LANDING_CONTENT } from '../config/landing-content';

/**
 * 6. STATS SECTION in MUI
 */
export function StatsSection() {
  const stats = LANDING_CONTENT.stats;

  return (
    <Box
      component="section"
      id="stats"
      className="tempy-section theme-paper"
      sx={{
        py: { xs: 6, md: 8.5 },
        position: 'relative',
        bgcolor: '#FFFFFF',
        borderTop: '1px solid #E6E7F3',
        borderBottom: '1px solid #E6E7F3',
      }}
    >
      <Container>
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography className="tempy-mono" sx={{ fontSize: 10.5, color: 'var(--indigo)', letterSpacing: '0.12em' }}>
            PROVEN OPERATIONAL IMPACT
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
            FROM SHIFTS TO SAFETY, THE NUMBERS SPEAK.
          </Typography>
        </Box>

        {/* Counters Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 3.5,
          }}
        >
          {stats.map((stat, idx) => (
            <Box
              key={idx}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 2,
                bgcolor: 'rgba(241, 241, 252, 0.45)',
                border: '1px solid #E6E7F3',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <CounterRoll
                  target={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  sx={{
                    fontSize: { xs: '30px', md: '42px' },
                    fontWeight: 800,
                    color: '#1B1F2E',
                    display: 'block',
                    mb: 1,
                  }}
                />
                <Typography
                  component="h3"
                  className="tempy-display"
                  sx={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--indigo)',
                    letterSpacing: '-0.01em',
                    mb: 1,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
              <Typography
                className="tempy-body"
                sx={{
                  fontSize: 14,
                  color: '#5B6075',
                  lineHeight: 1.5,
                }}
              >
                {stat.sub}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
