import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { NEWSLETTER_TEMPLATES } from './mocks/data';

// ----------------------------------------------------------------------

export function NewsletterTemplateConfig({
  selectedTemplate,
  onSelectTemplate,
  sectionsState,
  onToggleSection,
}) {
  const theme = useTheme();

  return (
    <Card sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Template Selector */}
      <Box sx={{ mb: 0.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <Iconify icon="solar:palette-round-bold" width={22} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>
            1. Select Template
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Choose a visual style for this edition.
        </Typography>

        <Stack spacing={1.25}>
          {NEWSLETTER_TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplate === tmpl.id;
            return (
              <Box
                key={tmpl.id}
                onClick={() => onSelectTemplate(tmpl.id)}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  border: (t) =>
                    `1.5px solid ${isSelected ? t.palette.primary.main : t.palette.divider}`,
                  bgcolor: isSelected
                    ? alpha(theme.palette.primary.main, 0.06)
                    : alpha(theme.palette.background.neutral, 0.4),
                  transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isSelected ? 'primary.main' : alpha(theme.palette.primary.main, 0.12),
                      color: isSelected ? 'primary.contrastText' : 'primary.main',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={tmpl.icon} width={18} />
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle2" fontWeight={700}>
                        {tmpl.label}
                      </Typography>
                      {isSelected && (
                        <Iconify
                          icon="solar:check-circle-bold"
                          width={18}
                          sx={{ color: 'primary.main' }}
                        />
                      )}
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                      {tmpl.description}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Divider sx={{ my: 2.5 }} />

      {/* 2. Content Sections Checklist */}
      <Box sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <Iconify icon="solar:checklist-minimalistic-bold" width={22} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>
            Content Sections
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Check sections to include in the preview.
        </Typography>

        <Stack spacing={1}>
          {/* Welcome from manager */}
          <Box
            onClick={() => onToggleSection('welcome')}
            sx={{
              p: 1.25,
              minHeight: 62,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 1.25,
              cursor: 'pointer',
              userSelect: 'none',
              border: (t) =>
                `1px solid ${sectionsState.welcome ? t.palette.primary.light : t.palette.divider}`,
              bgcolor: sectionsState.welcome
                ? alpha(theme.palette.primary.main, 0.03)
                : 'transparent',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
              <Checkbox
                checked={Boolean(sectionsState.welcome)}
                tabIndex={-1}
                disableRipple
                size="small"
                sx={{ p: 0.25, pointerEvents: 'none' }}
              />
              <Typography variant="subtitle2" fontWeight={600}>
                Welcome from the manager
              </Typography>
            </Stack>
          </Box>

          {/* Highlights */}
          <Box
            onClick={() => onToggleSection('highlights')}
            sx={{
              p: 1.25,
              minHeight: 62,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 1.25,
              cursor: 'pointer',
              userSelect: 'none',
              border: (t) =>
                `1px solid ${sectionsState.highlights ? t.palette.primary.light : t.palette.divider}`,
              bgcolor: sectionsState.highlights
                ? alpha(theme.palette.primary.main, 0.03)
                : 'transparent',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ width: '100%' }}>
              <Checkbox
                checked={Boolean(sectionsState.highlights)}
                tabIndex={-1}
                disableRipple
                size="small"
                sx={{ p: 0.25, pointerEvents: 'none' }}
              />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Highlights
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Auto-filled: 5 wall posts
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Coming up */}
          <Box
            onClick={() => onToggleSection('comingUp')}
            sx={{
              p: 1.25,
              minHeight: 62,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 1.25,
              cursor: 'pointer',
              userSelect: 'none',
              border: (t) =>
                `1px solid ${sectionsState.comingUp ? t.palette.primary.light : t.palette.divider}`,
              bgcolor: sectionsState.comingUp
                ? alpha(theme.palette.primary.main, 0.03)
                : 'transparent',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ width: '100%' }}>
              <Checkbox
                checked={Boolean(sectionsState.comingUp)}
                tabIndex={-1}
                disableRipple
                size="small"
                sx={{ p: 0.25, pointerEvents: 'none' }}
              />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Coming up
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  From the activities calendar
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Photo gallery */}
          <Box
            onClick={() => onToggleSection('photoGallery')}
            sx={{
              p: 1.25,
              minHeight: 62,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 1.25,
              cursor: 'pointer',
              userSelect: 'none',
              border: (t) =>
                `1px solid ${sectionsState.photoGallery ? t.palette.primary.light : t.palette.divider}`,
              bgcolor: sectionsState.photoGallery
                ? alpha(theme.palette.primary.main, 0.03)
                : 'transparent',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ width: '100%' }}>
              <Checkbox
                checked={Boolean(sectionsState.photoGallery)}
                tabIndex={-1}
                disableRipple
                size="small"
                sx={{ p: 0.25, pointerEvents: 'none' }}
              />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Photo gallery
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Up to 6 photos
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}

NewsletterTemplateConfig.propTypes = {
  selectedTemplate: PropTypes.string.isRequired,
  onSelectTemplate: PropTypes.func.isRequired,
  sectionsState: PropTypes.object.isRequired,
  onToggleSection: PropTypes.func.isRequired,
};

export default NewsletterTemplateConfig;
