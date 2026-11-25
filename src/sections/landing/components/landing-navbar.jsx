import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { LANDING_CONTENT } from '../config/landing-content';

/**
 * Adaptive Navbar in MUI:
 * Wordmark TEMPYHUB (left), mono menu links, white/indigo pill button "LOGIN" (right)
 * Inverts color automatically when over a light band
 */
export function LandingNavbar() {
  const [isLightSection, setIsLightSection] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const lightElements = document.querySelectorAll('.theme-paper, .theme-lav');
      let inLight = false;

      lightElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 80 && rect.bottom >= 80) {
          inLight = true;
        }
      });

      setIsLightSection(inLight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const textColor = isLightSection ? '#1B1F2E' : '#FFFFFF';
  const navBg = isLightSection ? 'rgba(255, 255, 255, 0.88)' : 'rgba(14, 16, 32, 0.82)';
  const borderColor = isLightSection ? 'rgba(27, 31, 46, 0.08)' : 'rgba(255, 255, 255, 0.1)';

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        width: '100%',
        bgcolor: navBg,
        borderBottom: `1px solid ${borderColor}`,
        backdropFilter: 'blur(16px)',
        transition: 'background-color 0.4s ease, border-color 0.4s ease',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 1.25, sm: 1.5, md: 2 },
          px: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo & Wordmark */}
        <Link
          href="#"
          underline="none"
          onClick={(e) => {
            e.preventDefault();
            window.location.reload();
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            cursor: 'pointer',
          }}
        >
          <Box
            component="img"
            src="/logo/new%20logo.png"
            alt="Tempy Hub Logo"
            sx={{
              height: { xs: 32, md: 38 },
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              borderRadius: 1,
            }}
          />
          <Typography
            className="tempy-display"
            sx={{
              fontSize: { xs: 18, md: 22 },
              fontWeight: 800,
              color: textColor,
              letterSpacing: '-0.03em',
              transition: 'color 0.4s ease',
            }}
          >
            TEMPY<Box component="span" sx={{ color: 'var(--indigo)' }}>HUB</Box>
          </Typography>
        </Link>

        {/* Desktop Menu */}
        <Stack
          direction="row"
          spacing={3.5}
          alignItems="center"
          sx={{
            display: { xs: 'none', md: 'flex' },
          }}
        >
          {LANDING_CONTENT.navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              underline="none"
              className="tempy-mono"
              sx={{
                fontSize: 12,
                color: textColor,
                opacity: 0.8,
                transition: 'opacity 0.2s ease, color 0.4s ease',
                '&:hover': { opacity: 1, color: 'var(--indigo)' },
              }}
            >
              {link.label}
            </Link>
          ))}
        </Stack>

        {/* CTA Button */}
        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
          <Button
            component={RouterLink}
            href={paths.auth.jwt.signIn}
            variant="contained"
            data-cursor="button"
            className="tempy-mono"
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              bgcolor: isLightSection ? 'var(--indigo)' : '#FFFFFF',
              color: isLightSection ? '#FFFFFF' : '#1B1F2E',
              px: { xs: 1.5, sm: 3 },
              py: { xs: 0.75, sm: 1 },
              borderRadius: '9999px',
              fontSize: { xs: 10, sm: 11 },
              fontWeight: 700,
              letterSpacing: '0.04em',
              minWidth: { xs: 56, sm: 64 },
              boxShadow: isLightSection
                ? '0 4px 14px rgba(84, 88, 216, 0.35)'
                : '0 4px 14px rgba(0, 0, 0, 0.15)',
              transition: 'background-color 0.25s ease, color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease',
              '&:hover': {
                bgcolor: isLightSection ? '#3F43C2' : 'var(--indigo)',
                color: '#FFFFFF',
                boxShadow: isLightSection
                  ? '0 6px 20px rgba(63, 67, 194, 0.4)'
                  : '0 6px 20px rgba(84, 88, 216, 0.45)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            LOGIN
          </Button>

          {/* Mobile hamburger */}
          <IconButton
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-menu"
            sx={{
              display: { xs: 'flex', md: 'none' },
              color: textColor,
            }}
          >
            <Iconify icon={mobileMenuOpen ? 'solar:close-circle-bold' : 'solar:hamburger-menu-bold'} width={24} />
          </IconButton>
        </Stack>
      </Container>

      <Container
        component="nav"
        id="landing-mobile-menu"
        maxWidth="xl"
        sx={{
          display: { xs: mobileMenuOpen ? 'block' : 'none', md: 'none' },
          px: { xs: 2, sm: 3 },
          pb: 1,
          borderTop: `1px solid ${borderColor}`,
        }}
      >
        <Stack spacing={0.5} sx={{ pt: 1 }}>
          {LANDING_CONTENT.navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              underline="none"
              className="tempy-mono"
              onClick={() => setMobileMenuOpen(false)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                minHeight: 44,
                fontSize: 12,
                color: textColor,
                '&:hover': { color: 'var(--indigo)' },
                '&:focus-visible': {
                  outline: '2px solid #7478E8',
                  outlineOffset: 2,
                },
              }}
            >
              {link.label}
            </Link>
          ))}
          <Button
            component={RouterLink}
            href={paths.auth.jwt.signIn}
            variant="contained"
            className="tempy-mono"
            onClick={() => setMobileMenuOpen(false)}
            fullWidth
            sx={{
              mt: 1,
              minHeight: 44,
              borderRadius: '9999px',
              bgcolor: isLightSection ? 'var(--indigo)' : '#FFFFFF',
              color: isLightSection ? '#FFFFFF' : '#1B1F2E',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.04em',
              boxShadow: isLightSection
                ? '0 4px 14px rgba(84, 88, 216, 0.35)'
                : '0 4px 14px rgba(0, 0, 0, 0.15)',
              transition: 'background-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease',
              '&:hover': {
                bgcolor: isLightSection ? '#3F43C2' : 'var(--indigo)',
                color: '#FFFFFF',
                boxShadow: isLightSection
                  ? '0 6px 20px rgba(63, 67, 194, 0.4)'
                  : '0 6px 20px rgba(84, 88, 216, 0.45)',
              },
            }}
          >
            LOGIN
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
