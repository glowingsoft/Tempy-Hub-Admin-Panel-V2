import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import { Iconify } from 'src/components/iconify';
import { LANDING_CONTENT } from '../config/landing-content';

/**
 * 12. FAQ SECTION: Modern Interactive Floating Cards with Refined Action Badges
 */
export function FaqSection() {
  const faqs = LANDING_CONTENT.faqs;
  const [expanded, setExpanded] = useState('faq-0');

  const handleToggle = (panelId) => {
    setExpanded((prev) => (prev === panelId ? false : panelId));
  };

  return (
    <Box
      component="section"
      id="faq"
      className="tempy-section theme-paper"
      sx={{
        py: { xs: 6, md: 8.5 },
        bgcolor: '#FFFFFF',
        borderTop: '1px solid #E6E7F3',
      }}
    >
      <Container
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '0.8fr 1.4fr' },
          gap: { xs: 5, md: 8 },
          alignItems: 'start',
        }}
      >
        {/* Left: Static FAQ Header */}
        <Box sx={{ position: 'relative' }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--indigo)', boxShadow: '0 0 10px #5458D8' }} />
            <Typography className="tempy-mono" sx={{ fontSize: 11, color: 'var(--indigo)', letterSpacing: '0.12em', fontWeight: 700 }}>
              CLARITY & ASSURANCE
            </Typography>
          </Stack>
          <Typography
            className="tempy-display"
            sx={{
              fontSize: { xs: '30px', sm: '42px', md: '50px' },
              fontWeight: 800,
              color: '#1B1F2E',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            F.A.Q.
          </Typography>
          <Typography className="tempy-body" sx={{ fontSize: 16, color: '#5B6075', mt: 2.5, maxWidth: 360, lineHeight: 1.6 }}>
            Everything you need to know about implementation, migration, security, and CQC compliance.
          </Typography>
        </Box>

        {/* Right: Modern Floating FAQ Cards */}
        <Stack spacing={2}>
          {faqs.map((faq, idx) => {
            const panelId = `faq-${idx}`;
            const isOpen = expanded === panelId;

            return (
              <Box
                key={idx}
                onClick={() => handleToggle(panelId)}
                sx={{
                  borderRadius: 3,
                  bgcolor: isOpen ? '#F4F5FD' : '#FFFFFF',
                  border: '1.5px solid',
                  borderColor: isOpen ? '#5458D8' : '#E6E7F3',
                  boxShadow: isOpen
                    ? '0 12px 32px rgba(84, 88, 216, 0.12)'
                    : '0 2px 10px rgba(27, 31, 46, 0.03)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                  p: { xs: 2.5, sm: 3 },
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: isOpen ? '#5458D8' : 'rgba(84, 88, 216, 0.4)',
                    boxShadow: '0 8px 24px rgba(84, 88, 216, 0.08)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {/* Header Row */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                    <Box
                      className="tempy-mono"
                      sx={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: isOpen ? '#FFFFFF' : 'var(--indigo)',
                        bgcolor: isOpen ? 'var(--indigo)' : 'rgba(84, 88, 216, 0.1)',
                        py: 0.5,
                        px: 1.25,
                        borderRadius: 1.5,
                        transition: 'all 0.25s ease',
                      }}
                    >
                      0{idx + 1}
                    </Box>
                    <Typography
                      className="tempy-display"
                      sx={{
                        fontSize: { xs: 15, sm: 17 },
                        fontWeight: 700,
                        color: isOpen ? 'var(--indigo)' : '#1B1F2E',
                        lineHeight: 1.35,
                        letterSpacing: '-0.01em',
                        transition: 'color 0.25s ease',
                      }}
                    >
                      {faq.q}
                    </Typography>
                  </Stack>

                  {/* Refined Smooth Circular Action Badge */}
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: isOpen ? 'var(--indigo)' : 'rgba(84, 88, 216, 0.08)',
                      border: '1px solid',
                      borderColor: isOpen ? 'var(--indigo)' : 'rgba(84, 88, 216, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: isOpen ? '#FFFFFF' : 'var(--indigo)',
                      boxShadow: isOpen ? '0 4px 12px rgba(84, 88, 216, 0.35)' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <Iconify
                      icon="solar:add-linear"
                      width={20}
                      sx={{
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </Box>
                </Box>

                {/* Collapsible Answer Body */}
                <Collapse in={isOpen} timeout={300} unmountOnExit>
                  <Box sx={{ pt: 2, pl: { xs: 0, sm: 5.5 }, pr: 2 }}>
                    <Typography
                      className="tempy-body"
                      sx={{
                        fontSize: { xs: 14, sm: 15 },
                        color: '#5B6075',
                        lineHeight: 1.65,
                      }}
                    >
                      {faq.a}
                    </Typography>
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
}

