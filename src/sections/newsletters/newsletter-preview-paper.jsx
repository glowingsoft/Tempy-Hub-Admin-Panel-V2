import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

function formatTime(value) {
  if (!value) return '';
  const parsed = dayjs(`2000-01-01T${value}`);
  return parsed.isValid() ? parsed.format('hh:mm A') : value;
}

function SectionLabel({ children }) {
  return (
    <Typography
      variant="overline"
      sx={{ display: 'block', mb: 1.25, fontWeight: 800, letterSpacing: 1.2, color: 'text.secondary' }}
    >
      {children}
    </Typography>
  );
}

export function NewsletterPreviewPaper({ form, periodLabel = '' }) {
  const theme = useTheme();
  const sections = form?.sections || {};
  const title = form?.title || 'Newsletter';
  const homeName = form?.footer?.homeName || '';

  return (
    <Card sx={{ p: 2, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Preview
        </Typography>
        <Chip
          size="small"
          label={`Template: ${form?.template || 'classic'}`}
          color="primary"
          variant="soft"
          sx={{ fontWeight: 600, textTransform: 'capitalize' }}
        />
      </Stack>

      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: '#ffffff',
          color: '#1a1a1a',
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 2.5 }}>
          {homeName && (
            <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 800, color: 'primary.main' }}>
              {homeName}
            </Typography>
          )}
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Georgia, serif', my: 0.5, textTransform: 'capitalize' }}>
            {title}
          </Typography>
          {periodLabel && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {periodLabel}
            </Typography>
          )}
        </Box>

        <Stack spacing={2.5}>
          {sections.welcome && (
            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>
                Welcome from the manager
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.7 }}>
                {form.welcome?.text ? `“${form.welcome.text}”` : 'No welcome text yet.'}
              </Typography>
              {form.welcome?.signedBy && (
                <Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 700, mt: 1, display: 'block' }}>
                  — {form.welcome.signedBy}
                </Typography>
              )}
            </Box>
          )}

          {sections.highlights && (
            <Box>
              <SectionLabel>Highlights</SectionLabel>
              <Grid container spacing={1.25}>
                {(form.highlights || []).map((item) => (
                  <Grid xs={12} sm={6} key={item.postId || item.title}>
                    <Box sx={{ p: 1.25, borderRadius: 1.25, border: (t) => `1px solid ${t.palette.divider}` }}>
                      {item.photoUrl && (
                        <Box
                          sx={{
                            height: 86,
                            mb: 1,
                            borderRadius: 1,
                            backgroundImage: `url(${item.photoUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                      )}
                      <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.82rem' }}>
                        {item.title || 'Untitled highlight'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {item.text || ''}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {sections.comingUp && (
            <Box>
              <SectionLabel>Coming up</SectionLabel>
              <Stack spacing={1}>
                {(form.comingUp || []).map((event, index) => {
                  const date = dayjs(event.date);
                  return (
                    <Stack key={`${event.title}-${index}`} direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          minWidth: 44,
                          textAlign: 'center',
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                          {date.isValid() ? date.format('DD') : '—'}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {date.isValid() ? date.format('MMM').toUpperCase() : ''}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.82rem' }}>
                          {event.title || 'Untitled event'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {[formatTime(event.time), event.description].filter(Boolean).join('  ·  ')}
                        </Typography>
                      </Box>
                      {event.category && (
                        <Chip label={event.category} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                      )}
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          )}

          {sections.notices && (
            <Box>
              <SectionLabel>Notices</SectionLabel>
              <Stack spacing={1.25}>
                {(form.notices || []).map((notice, index) => (
                  <Box key={`${notice.title}-${index}`}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.82rem' }}>
                      {notice.title || 'Untitled notice'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {notice.body || ''}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {sections.newResidents && (
            <Box>
              <SectionLabel>New residents</SectionLabel>
              <Stack spacing={0.5}>
                {(form.newResidents || []).map((resident) => (
                  <Typography key={resident.residentId} variant="body2">
                    {resident.name}
                    {resident.roomNumber ? `  ·  Room ${resident.roomNumber}` : ''}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}

          {sections.gallery && (
            <Box>
              <SectionLabel>Photo gallery</SectionLabel>
              <Grid container spacing={1}>
                {(form.gallery || []).map((photo) => (
                  <Grid xs={4} key={photo.mediaId}>
                    <Box
                      title={photo.caption || ''}
                      sx={{
                        height: 72,
                        borderRadius: 1,
                        bgcolor: 'grey.200',
                        backgroundImage: photo.url ? `url(${photo.url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    {photo.caption && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        {photo.caption}
                      </Typography>
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Box sx={{ pt: 1, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
            {homeName && (
              <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.8rem' }}>
                {homeName}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {[form.footer?.address, form.footer?.phone].filter(Boolean).join(' · ')}
            </Typography>
            {form.footer?.email && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {form.footer.email}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}

SectionLabel.propTypes = {
  children: PropTypes.node,
};

NewsletterPreviewPaper.propTypes = {
  form: PropTypes.object.isRequired,
  periodLabel: PropTypes.string,
};

export default NewsletterPreviewPaper;
