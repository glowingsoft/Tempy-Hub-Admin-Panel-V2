import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { isChoiceQuestionType } from '../visitor-survey-mappers';
import { QUESTION_TYPE_COLORS, QUESTION_TYPE_LABELS } from './visitor-survey-constants';

// ----------------------------------------------------------------------

export function VisitorSurveyQuestionBuilder({
  questions = [],
  canEdit = true,
  savingQuestions = false,
  onResetDefaults,
  onOpenAdd,
  onOpenEdit,
  onDeleteQuestion,
  onMoveQuestion,
  onDone,
}) {
  const activeCount = questions.filter((item) => item.active !== false).length;

  return (
    <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Bar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Survey Questions
          </Typography>
          <Label variant="soft" color="primary">
            {activeCount} active
          </Label>
          <Label variant="soft" color="default">
            {questions.length} configured
          </Label>
        </Stack>

        {canEdit && (
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<Iconify icon="solar:restart-bold" />}
              onClick={onResetDefaults}
              disabled={savingQuestions}
            >
              Reset defaults
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={onOpenAdd}
              disabled={savingQuestions}
              sx={{
                fontWeight: 700,
                borderRadius: 1.25,
                boxShadow: (theme) => theme.customShadows?.primary,
              }}
            >
              Add question
            </Button>
          </Stack>
        )}
      </Stack>

      {/* Questions List */}
      <Stack spacing={2}>
        {questions.map((q, idx) => (
          <Card
            key={q.id || q._id || q.key || idx}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
              borderColor: 'divider',
              opacity: q.active === false ? 0.7 : 1,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: (theme) => theme.customShadows?.z4,
              },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
              <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
                <Label
                  variant="filled"
                  color="default"
                  sx={{ height: 26, minWidth: 26, fontWeight: 700, borderRadius: 0.75 }}
                >
                  Q{q.sortOrder || idx + 1}
                </Label>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5} sx={{ mb: 0.75 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 14 }}>
                      {q.prompt || q.title}
                    </Typography>
                    {q.required ? (
                      <Chip size="small" label="Required" color="error" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                    ) : (
                      <Chip size="small" label="Optional" color="default" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                    )}
                    <Chip
                      size="small"
                      label={q.active === false ? 'Inactive' : 'Active'}
                      color={q.active === false ? 'default' : 'success'}
                      variant="outlined"
                      sx={{ height: 20, fontSize: 11 }}
                    />
                    <Label variant="soft" color={q.source === 'system' ? 'info' : 'default'} sx={{ height: 20, fontSize: 11 }}>
                      {q.source === 'system' ? 'System' : 'Custom'}
                    </Label>
                    <Label variant="soft" color={QUESTION_TYPE_COLORS[q.type] || 'default'} sx={{ height: 20, fontSize: 11 }}>
                      {QUESTION_TYPE_LABELS[q.type] || q.type}
                    </Label>
                  </Stack>

                  {q.key && (
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                      key: {q.key}
                    </Typography>
                  )}

                  {isChoiceQuestionType(q.type) && q.options && q.options.length > 0 && (
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" gap={0.75} sx={{ mt: 1 }}>
                      {q.options.map((opt, oIdx) => (
                        <Chip
                          key={oIdx}
                          label={opt}
                          size="small"
                          variant="soft"
                          color="default"
                          sx={{ height: 24, fontSize: 12 }}
                        />
                      ))}
                    </Stack>
                  )}

                  {q.type === 'rating' && (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Rating value={5} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary">
                        1 to 5
                      </Typography>
                    </Stack>
                  )}

                  {q.type === 'text' && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Free-text comment
                    </Typography>
                  )}
                </Box>
              </Stack>

              {/* Question Actions */}
              {canEdit && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Tooltip title="Move up">
                    <span>
                      <IconButton
                        size="small"
                        disabled={idx === 0}
                        onClick={() => onMoveQuestion(idx, -1)}
                      >
                        <Iconify icon="solar:arrow-up-bold" width={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Move down">
                    <span>
                      <IconButton
                        size="small"
                        disabled={idx === questions.length - 1}
                        onClick={() => onMoveQuestion(idx, 1)}
                      >
                        <Iconify icon="solar:arrow-down-bold" width={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Edit question and MCQ options">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onOpenEdit(q, idx)}
                    >
                      <Iconify icon="solar:pen-bold" width={16} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={q.source === 'system' ? 'Deactivate system question' : 'Delete question'}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDeleteQuestion(idx)}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
            </Stack>
          </Card>
        ))}
      </Stack>

      <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

      {/* Bottom Builder actions */}
      <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center">
        {canEdit ? (
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={onOpenAdd}
            disabled={savingQuestions}
            sx={{
              fontWeight: 600,
              borderRadius: 1.25,
              borderStyle: 'dashed',
              '&:hover': { borderStyle: 'dashed' },
            }}
          >
            Add another question
          </Button>
        ) : (
          <span />
        )}

        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<Iconify icon="solar:clipboard-check-bold" />}
          onClick={onDone}
        >
          Done &amp; View Form
        </Button>
      </Stack>
    </Stack>
  );
}

VisitorSurveyQuestionBuilder.propTypes = {
  questions: PropTypes.array.isRequired,
  canEdit: PropTypes.bool,
  savingQuestions: PropTypes.bool,
  onResetDefaults: PropTypes.func.isRequired,
  onOpenAdd: PropTypes.func.isRequired,
  onOpenEdit: PropTypes.func.isRequired,
  onDeleteQuestion: PropTypes.func.isRequired,
  onMoveQuestion: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
};

