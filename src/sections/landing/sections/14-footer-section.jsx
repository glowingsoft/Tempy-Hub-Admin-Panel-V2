import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { LANDING_CONTENT } from '../config/landing-content';

/**
 * 14. FOOTER in MUI:
 * With scrubbed ghost wordmark
 */
export function FooterSection() {
  const footerContent = LANDING_CONTENT.footer;

  return (
    <Box
      component="footer"
      className="tempy-section theme-paper"
      sx={{
        bgcolor: '#FFFFFF',
        color: '#1B1F2E',
        pt: { xs: 6, md: 8 },
        pb: { xs: 4, md: 5 },
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid #E6E7F3',
      }}
    >
      <Container sx={{ position: 'relative', zIndex: 2 }}>
        {/* Main Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: '1.2fr repeat(3, 1fr)' },
            gap: { xs: 4, md: 6 },
            mb: { xs: 6, md: 10 },
          }}
        >
          {/* Col 1 */}
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Box
                component="img"
                src="/logo/new%20logo.png"
                alt="Tempy Hub Logo"
                sx={{
                  height: { xs: 32, md: 38 },
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
              <Typography className="tempy-display" sx={{ fontSize: 22, fontWeight: 800, color: '#1B1F2E', letterSpacing: '-0.02em' }}>
                TEMPY<Box component="span" sx={{ color: 'var(--indigo)' }}>HUB</Box>
              </Typography>
            </Stack>
            <Typography className="tempy-body" sx={{ fontSize: 15, color: '#5B6075', maxWidth: 300 }}>
              {footerContent.tagline}
            </Typography>
            <Typography className="tempy-mono" sx={{ fontSize: 11, color: 'var(--indigo)', mt: 2 }}>
              UNITED KINGDOM · CQC ALIGNED
            </Typography>
          </Box>

          {/* Dynamic Link Columns */}
          {footerContent.cols.map((col, idx) => (
            <Box key={idx}>
              <Typography className="tempy-mono" sx={{ fontSize: 11, color: '#1B1F2E', fontWeight: 700, mb: 2.5 }}>
                {col.title}
              </Typography>
              <Stack spacing={1.5}>
                {col.links.map((link, lIdx) => (
                  <Link
                    key={lIdx}
                    href="#"
                    underline="hover"
                    className="tempy-body"
                    sx={{
                      fontSize: 14,
                      color: '#5B6075',
                      '&:hover': { color: 'var(--indigo)' },
                    }}
                  >
                    {link}
                  </Link>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>

        {/* Legal Row */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{
            borderTop: '1px solid #E6E7F3',
            pt: 4,
          }}
        >
          <Typography className="tempy-mono" sx={{ fontSize: 11, color: '#5B6075' }}>
            © {new Date().getFullYear()} TEMPY HUB LTD. ALL RIGHTS RESERVED. REGISTERED IN ENGLAND & WALES.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link href="#" underline="hover" className="tempy-mono" sx={{ fontSize: 11, color: '#5B6075' }}>
              PRIVACY POLICY
            </Link>
            <Link href="#" underline="hover" className="tempy-mono" sx={{ fontSize: 11, color: '#5B6075' }}>
              TERMS OF SERVICE
            </Link>
            <Link href="#" underline="hover" className="tempy-mono" sx={{ fontSize: 11, color: '#5B6075' }}>
              SECURITY
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
