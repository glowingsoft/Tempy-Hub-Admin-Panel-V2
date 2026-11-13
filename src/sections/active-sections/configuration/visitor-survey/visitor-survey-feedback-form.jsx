import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

const QUESTION_TYPE_LABELS = {
  singleSelect: 'Single Select (Dropdown)',
  yesNo: 'Multiple Choice',
  rating: 'Rating (1–5 Stars)',
  text: 'Text Response',
};

const QUESTION_TYPE_COLORS = {
  singleSelect: 'primary',
  yesNo: 'info',
  rating: 'warning',
  text: 'secondary',
};

export function VisitorSurveyFeedbackForm({
  formQuestions = [],
  onSwitchToBuilder,
}) {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2}>
        {formQuestions.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">No active questions configured.</Typography>
          </Box>
        ) : (
          formQuestions.map((q, idx) => (
            <Paper
              key={q.id || q._id || q.key || idx}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.03),
                borderColor: 'divider',
              }}
            >
              <Stack spacing={1.25}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {idx + 1}. {q.prompt || q.title}{' '}
                    {q.required && (
                      <Box component="span" sx={{ color: 'error.main' }}>
                        *
                      </Box>
                    )}
                  </Typography>

                  <Label
                    variant="soft"
                    color={QUESTION_TYPE_COLORS[q.type] || 'default'}
                    sx={{ textTransform: 'capitalize', flexShrink: 0 }}
                  >
                    {QUESTION_TYPE_LABELS[q.type] || q.type || 'Question'}
                  </Label>
                </Stack>

                {/* Single Select / Dropdown options */}
                {q.type === 'singleSelect' && (
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ pt: 0.5 }}>
                    {q.options?.map((option, oIdx) => (
                      <Chip
                        key={oIdx}
                        label={option}
                        size="small"
                        variant="outlined"
                        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                      />
                    ))}
                  </Stack>
                )}

                {/* Multiple choice / YesNo options */}
                {q.type === 'yesNo' && (
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ pt: 0.5 }}>
                    {q.options?.map((option, oIdx) => (
                      <Chip
                        key={oIdx}
                        label={option}
                        size="small"
                        variant="outlined"
                        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                      />
                    ))}
                  </Stack>
                )}

                {/* Rating 5-stars preview */}
                {q.type === 'rating' && (
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ pt: 0.5 }}>
                    <Rating value={5} readOnly size="medium" />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      (1 to 5 star rating scale)
                    </Typography>
                  </Stack>
                )}

                {/* Text response preview */}
                {q.type === 'text' && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      border: '1px dashed',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                      {q.placeholder || 'Visitor enters free-text response...'}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          ))
        )}

        <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

        <Stack direction="row" justifyContent="flex-start" alignItems="center">
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<Iconify icon="solar:pen-new-square-bold" />}
            onClick={onSwitchToBuilder}
          >
            Customize questions &amp; options
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

VisitorSurveyFeedbackForm.propTypes = {
  formQuestions: PropTypes.array,
  onSwitchToBuilder: PropTypes.func.isRequired,
};
