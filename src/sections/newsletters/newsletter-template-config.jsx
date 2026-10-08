import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { NEWSLETTER_MONTHS } from './mocks/data';

// ----------------------------------------------------------------------

export function NewsletterTemplateConfig({
  selectedMonth,
  onSelectMonth,
  sectionsState,
  onToggleSection,
}) {
  const theme = useTheme();

  return (
    <Card sx={{ p: 3.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Iconify icon="solar:checklist-minimalistic-bold" width={22} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>
            Content Sections
          </Typography>
        </Stack>
        

        <TextField
          select
          fullWidth
          size="small"
          label="Newsletter month"
          value={selectedMonth}
          onChange={(event) => onSelectMonth(event.target.value)}
          sx={{ mb: 2 }}
        >
          {NEWSLETTER_MONTHS.map((month) => (
            <MenuItem key={month} value={month}>
              {month}
            </MenuItem>
          ))}
        </TextField>

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
  selectedMonth: PropTypes.string.isRequired,
  onSelectMonth: PropTypes.func.isRequired,
  sectionsState: PropTypes.object.isRequired,
  onToggleSection: PropTypes.func.isRequired,
};

export default NewsletterTemplateConfig;
