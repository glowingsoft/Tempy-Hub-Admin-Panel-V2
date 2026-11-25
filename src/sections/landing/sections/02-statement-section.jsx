import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { FillInHeadline } from '../components/text-fx';
import { LANDING_CONTENT } from '../config/landing-content';

/**
 * 2. THE STATEMENT in MUI
 */
export function StatementSection({ imageSrc = null }) {
  const content = LANDING_CONTENT.statement;

  return (
    <Box
      component="section"
      id="statement"
      className="tempy-section theme-paper"
      sx={{
        minHeight: { xs: 'auto', md: '80vh' },
        display: 'flex',
        alignItems: 'center',
        py: { xs: 6, md: 8.5 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.4fr' },
          gap: { xs: 5, md: 8 },
          alignItems: 'center',
        }}
      >
        {/* Left: Framed Photo */}
        <Box sx={{ width: '100%', maxWidth: 460, mx: 'auto' }}>
          <Box
            sx={{
              position: 'relative',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 20px 48px rgba(84, 88, 216, 0.14), 0 8px 24px rgba(0,0,0,0.06)',
              border: '1px solid rgba(27, 31, 46, 0.08)',
              aspectRatio: '4 / 3',
              bgcolor: '#F1F1FC',
            }}
          >
            {imageSrc ? (
              <Box
                component="img"
                src={imageSrc}
                alt="Care assistant laughing with elderly resident"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': { transform: 'scale(1.03)' },
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #F1F1FC 0%, #E6E7F3 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <Typography className="tempy-display" sx={{ fontSize: 16, color: '#1B1F2E' }}>
                  DIGNIFIED UK CARE
                </Typography>
              </Box>
            )}

            <Box
              className="tempy-mono"
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                bgcolor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(8px)',
                py: 0.75,
                px: 1.75,
                borderRadius: '9999px',
                fontSize: 10,
                color: '#1B1F2E',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              UK CARE HOMES · CQC COMPLIANT
            </Box>
          </Box>
        </Box>

        {/* Right: Giant Fill-in Headline */}
        <Box>
          <Typography
            className="tempy-mono"
            sx={{
              fontSize: 11,
              color: 'var(--indigo)',
              letterSpacing: '0.12em',
              fontWeight: 600,
              mb: 2,
            }}
          >
            THE PHILOSOPHY
          </Typography>

          <FillInHeadline
            text={content.lead}
            highlightText={content.punch}
            theme="light"
            sx={{
              fontSize: { xs: '28px', sm: '40px', md: '54px' },
              fontWeight: 800,
            }}
          />

          <Typography
            className="tempy-body"
            sx={{
              fontSize: { xs: 16, md: 17 },
              color: '#5B6075',
              mt: 2.5,
              maxWidth: 560,
              lineHeight: 1.55,
            }}
          >
            {content.sub}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
