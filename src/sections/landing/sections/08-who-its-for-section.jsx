import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { LANDING_CONTENT } from '../config/landing-content';

/**
 * 8. WHO IT'S FOR in MUI
 */
export function WhoItsForSection() {
  const rows = LANDING_CONTENT.whoWeStandWith;
  const [activeIdx, setActiveIdx] = useState(1);

  return (
    <Box
      component="section"
      id="staffing"
      className="tempy-section theme-night"
      sx={{
        py: { xs: 5, sm: 6, md: 8.5 },
        position: 'relative',
        bgcolor: '#0E1020',
      }}
    >
      <Container>
        <Box sx={{ mb: { xs: 3, md: 4.5 } }}>
          <Typography
            className="tempy-mono"
            sx={{ fontSize: { xs: 9.5, sm: 10.5 }, color: '#7478E8', letterSpacing: '0.12em' }}
          >
            DESIGNED FOR EVERY STAKEHOLDER
          </Typography>
          <Typography
            className="tempy-display"
            sx={{
              fontSize: { xs: 'clamp(20px, 5vw, 30px)', md: '44px' },
              fontWeight: 800,
              color: '#FFFFFF',
              mt: 1.25,
              lineHeight: 1.15,
            }}
          >
            WHO WE STAND WITH.
          </Typography>
        </Box>

        {/* Stacked Active Rows */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map((row, idx) => {
            const isActive = activeIdx === idx;

            return (
              <Box
                component="button"
                type="button"
                key={row.idx}
                onClick={() => setActiveIdx(idx)}
                onMouseEnter={() => setActiveIdx(idx)}
                aria-expanded={isActive}
                aria-controls={`stakeholder-description-${idx}`}
                sx={{
                  display: 'block',
                  width: '100%',
                  border: 'none',
                  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                  py: { xs: 2.5, sm: 3, md: 4 },
                  px: { xs: 1, sm: 1.5, md: 2 },
                  cursor: 'pointer',
                  transition: 'opacity 0.4s ease',
                  opacity: { xs: isActive ? 1 : 0.65, md: isActive ? 1 : 0.35 },
                  color: 'inherit',
                  textAlign: 'left',
                  font: 'inherit',
                  bgcolor: 'transparent',
                  '&:focus-visible': {
                    outline: '2px solid #7478E8',
                    outlineOffset: 3,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '44px minmax(0, 1fr)',
                      sm: '64px minmax(0, 1fr) minmax(0, 1.15fr)',
                      md: '88px 1.2fr 1.6fr 50px',
                    },
                    columnGap: { xs: 2, sm: 3, md: 4 },
                    rowGap: { xs: 1, sm: 1.5, md: 2 },
                    alignItems: { xs: 'start', md: 'baseline' },
                  }}
                >
                  <Typography
                    className="tempy-mono"
                    sx={{
                      gridColumn: 1,
                      gridRow: { xs: '1 / span 2', sm: '1', md: '1' },
                      fontSize: { xs: 14, md: 18 },
                      color: 'var(--indigo)',
                      fontWeight: 700,
                      lineHeight: 1.3,
                      pr: { xs: 0.5, sm: 1 },
                    }}
                  >
                    {row.idx}
                  </Typography>

                  <Typography
                    component="h3"
                    className="tempy-display"
                    sx={{
                      gridColumn: 2,
                      fontSize: { xs: 16, sm: 18, md: 22 },
                      fontWeight: 700,
                      color: '#FFFFFF',
                      lineHeight: 1.3,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {row.role}
                  </Typography>

                  <Box sx={{ gridColumn: { xs: 2, sm: 3, md: 3 }, minWidth: 0 }}>
                    <Typography
                      className="tempy-body"
                      sx={{
                        fontSize: { xs: 14, md: 16 },
                        color: '#7478E8',
                        fontWeight: 600,
                        mb: isActive ? 1 : 0,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {row.highlight}
                    </Typography>

                    <Box
                      id={`stakeholder-description-${idx}`}
                      aria-hidden={!isActive}
                      sx={{
                        maxHeight: isActive ? { xs: '300px', md: '200px' } : '0px',
                        overflow: 'hidden',
                        opacity: isActive ? 1 : 0,
                        transition: 'max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
                      }}
                    >
                      <Typography
                        className="tempy-body"
                        sx={{
                          fontSize: { xs: 14, md: 15 },
                          color: 'rgba(255, 255, 255, 0.7)',
                          lineHeight: 1.6,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {row.desc}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: { xs: 'none', md: 'block' },
                      gridColumn: 4,
                      textAlign: 'right',
                      transform: isActive ? 'translateX(0)' : 'translateX(-8px)',
                      color: isActive ? 'var(--indigo)' : 'rgba(255, 255, 255, 0.3)',
                      fontSize: 22,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    →
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
