import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { LANDING_CONTENT } from '../config/landing-content';

/**
 * 10. SECURITY & TRUST in MUI
 */
export function SecurityTrustSection() {
  const securityItems = LANDING_CONTENT.security;
  const sectors = LANDING_CONTENT.sectorsMarquee;

  return (
    <Box
      component="section"
      id="security"
      className="tempy-section theme-lav"
      sx={{
        py: { xs: 6, md: 8.5 },
        bgcolor: '#F1F1FC',
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography className="tempy-mono" sx={{ fontSize: 10.5, color: 'var(--indigo)', letterSpacing: '0.12em' }}>
            ENTERPRISE GOVERNANCE & SOVEREIGNTY
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
            TRUSTED COMPLIANCE AT SCALE.
          </Typography>
          <Typography className="tempy-body" sx={{ fontSize: 17, color: '#5B6075', maxWidth: 640, mx: 'auto', mt: 1.75 }}>
            Built strictly to satisfy CQC auditors, local authority commissioners, and UK data protection officers.
          </Typography>
        </Box>

        {/* 4 Security Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 3,
            mb: { xs: 6, md: 10 },
          }}
        >
          {securityItems.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                p: { xs: 3, md: 4 },
                border: '1px solid #E6E7F3',
                boxShadow: '0 4px 16px rgba(84, 88, 216, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(84, 88, 216, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--indigo)',
                    mb: 2.5,
                  }}
                >
                  <Iconify icon={item.icon} width={24} />
                </Box>
                <Typography
                  component="h3"
                  className="tempy-display"
                  sx={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: '#1B1F2E',
                    mb: 1.5,
                  }}
                >
                  {item.title}
                </Typography>
                <Typography className="tempy-body" sx={{ fontSize: 14, color: '#5B6075', lineHeight: 1.6 }}>
                  {item.desc}
                </Typography>
              </Box>

              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 3 }}>
                <Box component="span" sx={{ color: '#22C55E' }}>✓</Box>
                <Typography className="tempy-mono" sx={{ fontSize: 10, color: 'var(--indigo)', fontWeight: 600 }}>
                  AUDIT VERIFIED
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Marquee Strip */}
      <Box
        sx={{
          width: '100%',
          overflow: 'hidden',
          borderTop: '1px solid rgba(84, 88, 216, 0.15)',
          pt: 3.5,
        }}
      >
        <Box className="tempy-marquee-track">
          {[...sectors, ...sectors, ...sectors, ...sectors].map((sec, idx) => (
            <Box
              key={idx}
              className="tempy-mono"
              sx={{
                fontSize: 13,
                color: '#5B6075',
                px: 4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                whiteSpace: 'nowrap',
              }}
            >
              <Typography component="span" className="tempy-mono" sx={{ fontSize: 13, color: 'inherit' }}>
                {sec}
              </Typography>
              <Box component="span" sx={{ color: 'var(--indigo)' }}>·</Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
