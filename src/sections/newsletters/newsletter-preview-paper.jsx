import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { mockNewsletterData } from './mocks/data';

// ----------------------------------------------------------------------

export function NewsletterPreviewPaper({
  selectedTemplate,
  sectionsState,
  welcomeText,
}) {
  const theme = useTheme();
  const { header, sections } = mockNewsletterData;

  const isClassic = selectedTemplate === 'classic';
  const isPhotoLed = selectedTemplate === 'photo-led';
  const isSimple = selectedTemplate === 'simple';

  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 3 },
        bgcolor: '#ffffff',
        color: '#1a1a1a',
        borderRadius: 2,
        height: '100%',
        minHeight: 750,
        boxShadow: (t) =>
          `0 10px 40px -10px ${alpha(t.palette.common.black, 0.15)}, 0 0 1px 1px ${alpha(t.palette.grey[500], 0.12)}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Preview Heading & Template Badge */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="solar:eye-bold" width={22} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>
            Preview
          </Typography>
        </Stack>

        <Chip
          size="small"
          label={`Template: ${isClassic ? 'Classic' : isPhotoLed ? 'Photo-led' : 'Simple'}`}
          color="primary"
          variant="soft"
          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
        />
      </Box>

      {/* Photo-led Hero Banner (if photo-led selected) */}
      {isPhotoLed && (
        <Box
          sx={{
            width: '100%',
            height: 180,
            borderRadius: 1.5,
            overflow: 'hidden',
            position: 'relative',
            mb: 2.5,
            backgroundImage: `url(https://picsum.photos/seed/garden-afternoon-1/1000/500)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
              display: 'flex',
              alignItems: 'flex-end',
              p: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700 }}>
              Autumn Life at Florence House
            </Typography>
          </Box>
        </Box>
      )}

      {/* Header Block */}
      <Box
        sx={{
          pb: 2,
          mb: 2.5,
          borderBottom: (t) =>
            isSimple ? `1px solid ${t.palette.divider}` : `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          textAlign: isClassic ? 'center' : 'left',
        }}
      >
        <Typography
          variant="overline"
          sx={{
            letterSpacing: 2.5,
            fontWeight: 800,
            color: 'primary.main',
            display: 'block',
          }}
        >
          {header.homeName}
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#111827',
            letterSpacing: -0.5,
            fontFamily: isClassic ? 'Georgia, serif' : 'inherit',
            my: 0.5,
          }}
        >
          {header.editionTitle}
        </Typography>

        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 500 }}>
          {header.tagline}
        </Typography>
      </Box>

      <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
        {/* 1. Welcome from the manager */}
        {sectionsState.welcome && (
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: isSimple ? alpha(theme.palette.grey[500], 0.04) : alpha(theme.palette.primary.main, 0.04),
              borderLeft: `3px solid ${theme.palette.primary.main}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              Welcome from the manager
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.6,
                fontStyle: isClassic ? 'italic' : 'normal',
                fontSize: '0.85rem',
              }}
            >
              &ldquo;{welcomeText || sections.welcome.text}&rdquo;
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 700, mt: 1, display: 'block' }}>
              — {sections.welcome.author}
            </Typography>
          </Box>
        )}

        {/* 2. Highlights */}
        {sectionsState.highlights && (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontSize: '0.75rem',
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <Iconify icon="solar:star-bold" width={16} sx={{ color: 'warning.main' }} />
              Highlights
            </Typography>

            <Grid container spacing={1.5}>
              {sections.highlights.items.slice(0, 2).map((item) => (
                <Grid xs={12} sm={6} key={item.id}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: (t) => `1px solid ${t.palette.divider}`,
                      bgcolor: '#fafafa',
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        height: 90,
                        borderRadius: 1,
                        overflow: 'hidden',
                        mb: 1,
                        backgroundImage: `url(${item.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.primary', fontSize: '0.82rem' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25, lineHeight: 1.4 }}>
                      {item.blurb}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* 3. Coming up */}
        {sectionsState.comingUp && (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontSize: '0.75rem',
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <Iconify icon="solar:calendar-date-bold" width={16} sx={{ color: 'info.main' }} />
              Coming up
            </Typography>

            <Stack spacing={1}>
              {sections.comingUp.events.slice(0, 2).map((event) => (
                <Box
                  key={event.id}
                  sx={{
                    p: 1.25,
                    px: 1.5,
                    borderRadius: 1,
                    border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: '#fafafa',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 0.75,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.dark',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    >
                      {event.date}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.82rem' }}>
                        {event.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {event.time} · {event.description}
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip label={event.badge} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* 4. Photo gallery */}
        {sectionsState.photoGallery && (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontSize: '0.75rem',
                mb: 1.25,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <Iconify icon="solar:camera-bold" width={16} sx={{ color: 'success.main' }} />
              Photo gallery
            </Typography>

            <Grid container spacing={1}>
              {sections.photoGallery.photos.slice(0, 4).map((photo) => (
                <Grid xs={6} sm={3} key={photo.id}>
                  <Box
                    sx={{
                      height: 64,
                      borderRadius: 1,
                      overflow: 'hidden',
                      backgroundImage: `url(${photo.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: (t) => `1px solid ${t.palette.divider}`,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Footer info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
          Florence House Care · Published with Tempy Family Portal
        </Typography> */}
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
          Page 1 of 1
        </Typography>
      </Box>
    </Card>
  );
}

NewsletterPreviewPaper.propTypes = {
  selectedTemplate: PropTypes.string.isRequired,
  sectionsState: PropTypes.object.isRequired,
  welcomeText: PropTypes.string.isRequired,
};

export default NewsletterPreviewPaper;
