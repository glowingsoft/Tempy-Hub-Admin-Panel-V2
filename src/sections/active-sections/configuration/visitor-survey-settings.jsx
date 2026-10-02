import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Rating from '@mui/material/Rating';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { LoadingButton } from '@mui/lab';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import {
  addMockVisitorFeedbackResponse,
  DEFAULT_VISITOR_SURVEY_SETTINGS,
  DEFAULT_SURVEY_QUESTIONS,
  getSurveyQuestions,
  saveSurveyQuestions,
  resetSurveyQuestions,
} from './mocks/data';

// ----------------------------------------------------------------------

function CompactOptionCard({ icon, label, checked, onChange }) {
  return (
    <Card
      variant="outlined"
      onClick={() => onChange(!checked)}
      sx={{
        py: 1,
        px: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        borderRadius: 1.25,
        borderColor: checked ? 'primary.main' : 'divider',
        bgcolor: (theme) =>
          checked
            ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.04)
            : 'background.paper',
        transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Iconify
          icon={icon}
          width={18}
          sx={{ color: checked ? 'primary.main' : 'text.disabled' }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
          {label}
        </Typography>
      </Stack>

      <Switch
        size="small"
        checked={Boolean(checked)}
        onChange={(e) => {
          e.stopPropagation();
          onChange(e.target.checked);
        }}
      />
    </Card>
  );
}

CompactOptionCard.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

// ----------------------------------------------------------------------

function SectionTitle({ icon, title }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Iconify icon={icon} width={17} sx={{ color: 'text.secondary' }} />
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
    </Stack>
  );
}

SectionTitle.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

// ----------------------------------------------------------------------

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

const RATING_COLORS = {
  1: 'error',
  2: 'warning',
  3: 'info',
  4: 'primary',
  5: 'success',
};

const QUESTION_TYPE_LABELS = {
  radio: 'Multiple Choice (Radio)',
  select: 'Dropdown Select',
  rating: 'Star Rating',
  text: 'Text / Comment',
};

const QUESTION_TYPE_COLORS = {
  radio: 'primary',
  select: 'info',
  rating: 'warning',
  text: 'secondary',
};

const QUESTION_TYPES = [
  {
    value: 'radio',
    label: 'Multiple Choice',
    description: 'Radio buttons for visible single choice',
    icon: 'solar:list-check-bold',
    color: 'primary',
  },
  {
    value: 'select',
    label: 'Dropdown Select',
    description: 'Compact dropdown picker menu',
    icon: 'solar:menu-dots-square-bold',
    color: 'info',
  },
  {
    value: 'rating',
    label: 'Star Rating',
    description: '1 to 5 stars visual rating scale',
    icon: 'solar:star-bold',
    color: 'warning',
  },
  {
    value: 'text',
    label: 'Text Comment',
    description: 'Free-form comment or notes box',
    icon: 'solar:text-bold',
    color: 'secondary',
  },
];

const QUICK_PRESETS = [
  { label: 'Yes / No', values: ['Yes', 'No'] },
  { label: 'Rating Scale', values: ['Excellent', 'Good', 'Fair', 'Poor'] },
  { label: 'Agreement', values: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree'] },
];

// ----------------------------------------------------------------------

function QuestionEditorDialog({ open, question, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('radio');
  const [options, setOptions] = useState([]);
  const [newOptionText, setNewOptionText] = useState('');
  const [hasOtherOption, setHasOtherOption] = useState(false);
  const [required, setRequired] = useState(false);
  const [placeholder, setPlaceholder] = useState('');

  useEffect(() => {
    if (question) {
      setTitle(question.title || '');
      setType(question.type || 'radio');
      setOptions(Array.isArray(question.options) ? [...question.options] : []);
      setHasOtherOption(Boolean(question.hasOtherOption));
      setRequired(Boolean(question.required));
      setPlaceholder(question.placeholder || '');
    } else {
      setTitle('');
      setType('radio');
      setOptions(['Yes', 'No']);
      setHasOtherOption(true);
      setRequired(true);
      setPlaceholder('');
    }
    setNewOptionText('');
  }, [question, open]);

  const handleAddOption = () => {
    const trimmed = newOptionText.trim();
    if (!trimmed) return;
    if (options.some((opt) => opt.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning('This option already exists');
      return;
    }
    setOptions((prev) => [...prev, trimmed]);
    setNewOptionText('');
  };

  const handleRemoveOption = (indexToRemove) => {
    setOptions((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleEditOption = (indexToEdit, newVal) => {
    setOptions((prev) => prev.map((opt, idx) => (idx === indexToEdit ? newVal : opt)));
  };

  const handleApplyPreset = (presetValues) => {
    setOptions([...presetValues]);
    toast.info('Applied preset options');
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Question prompt / text is required');
      return;
    }
    if ((type === 'radio' || type === 'select') && options.length === 0) {
      toast.error('Please add at least one option for this question');
      return;
    }
    onSave({
      id: question?.id || `q-${Date.now()}`,
      title: title.trim(),
      type,
      options: type === 'radio' || type === 'select' ? options : [],
      hasOtherOption: type === 'radio' || type === 'select' ? hasOtherOption : false,
      required,
      placeholder: type === 'text' ? placeholder.trim() : '',
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          boxShadow: (theme) => theme.customShadows?.dialog,
          overflow: 'hidden',
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          p: 3,
          pb: 2.25,
          position: 'relative',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              boxShadow: (theme) => `0 4px 12px 0 ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
          >
            <Iconify
              icon={question ? 'solar:pen-bold' : 'solar:pen-new-square-bold'}
              width={26}
            />
          </Box>

          <Box sx={{ pr: 4 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {question ? 'Edit Survey Question' : 'Add New Survey Question'}
              </Typography>
              <Label variant="soft" color="primary" sx={{ fontSize: 11, fontWeight: 700 }}>
                {question ? 'Editing' : 'New'}
              </Label>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
              Set up the question prompt, choose the answer format, and customize options.
            </Typography>
          </Box>
        </Stack>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'text.secondary',
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.16),
            },
          }}
        >
          <Iconify icon="mingcute:close-line" width={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 3 }}>
        <Stack spacing={3}>
          {/* 1. Question Prompt */}
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="solar:chat-round-line-bold" width={18} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Question Prompt *
              </Typography>
            </Stack>
            <TextField
              fullWidth
              placeholder="e.g. How satisfied are you with the facility cleanliness?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:text-field-bold-duotone" width={20} sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 1.5 },
              }}
              helperText="The question prompt shown to visitors when they share post-visit feedback."
            />
          </Stack>

          {/* 2. Response Format / Question Type */}
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="solar:widget-5-bold-duotone" width={18} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Response Format
              </Typography>
            </Stack>

            <Grid container spacing={1.5}>
              {QUESTION_TYPES.map((item) => {
                const isSelected = type === item.value;
                return (
                  <Grid item xs={12} sm={6} key={item.value}>
                    <Card
                      variant="outlined"
                      onClick={() => setType(item.value)}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.75,
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s ease-in-out',
                        borderColor: (theme) =>
                          isSelected ? theme.palette[item.color].main : 'divider',
                        bgcolor: (theme) =>
                          isSelected
                            ? alpha(theme.palette[item.color].main, 0.06)
                            : 'background.paper',
                        boxShadow: (theme) =>
                          isSelected
                            ? `0 4px 14px 0 ${alpha(theme.palette[item.color].main, 0.16)}`
                            : 'none',
                        '&:hover': {
                          borderColor: (theme) =>
                            isSelected
                              ? theme.palette[item.color].main
                              : alpha(theme.palette[item.color].main, 0.4),
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 1.25,
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                            bgcolor: (theme) =>
                              isSelected
                                ? theme.palette[item.color].main
                                : alpha(theme.palette[item.color].main, 0.1),
                            color: (theme) =>
                              isSelected ? theme.palette[item.color].contrastText : theme.palette[item.color].main,
                            transition: 'all 0.2s',
                          }}
                        >
                          <Iconify icon={item.icon} width={20} />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: isSelected ? 700 : 600,
                                fontSize: 13.5,
                                color: isSelected ? 'text.primary' : 'text.secondary',
                              }}
                            >
                              {item.label}
                            </Typography>
                            {isSelected && (
                              <Iconify
                                icon="solar:check-circle-bold"
                                width={16}
                                sx={{ color: `${item.color}.main`, flexShrink: 0 }}
                              />
                            )}
                          </Stack>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.disabled',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              fontSize: 11.5,
                            }}
                          >
                            {item.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Stack>

          {/* 3. MCQ Options Configuration (if radio or select) */}
          {(type === 'radio' || type === 'select') && (
            <Card
              variant="outlined"
              sx={{
                p: 2.25,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                borderColor: 'divider',
              }}
            >
              {/* Header */}
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:list-bold-duotone" width={18} sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Answer Choices
                  </Typography>
                </Stack>
                <Label variant="soft" color="primary" sx={{ fontSize: 11, fontWeight: 700 }}>
                  {options.length} {options.length === 1 ? 'choice' : 'choices'}
                </Label>
              </Stack>

              {/* Quick Presets */}
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Presets:
                </Typography>
                {QUICK_PRESETS.map((preset) => (
                  <Chip
                    key={preset.label}
                    label={preset.label}
                    size="small"
                    variant="outlined"
                    onClick={() => handleApplyPreset(preset.values)}
                    icon={<Iconify icon="solar:magic-stick-3-bold" width={14} />}
                    sx={{
                      height: 24,
                      fontSize: 11.5,
                      fontWeight: 600,
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor: 'background.paper',
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                      },
                    }}
                  />
                ))}
              </Stack>

              {/* Options List */}
              <Stack spacing={1.25} sx={{ mb: 2 }}>
                {options.map((option, idx) => (
                  <Stack
                    key={idx}
                    direction="row"
                    spacing={1.25}
                    alignItems="center"
                    sx={{
                      p: 0.75,
                      pl: 1.25,
                      borderRadius: 1.5,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.15s',
                      '&:focus-within': {
                        borderColor: 'primary.main',
                        boxShadow: (theme) => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.12)}`,
                      },
                    }}
                  >
                    <Label
                      variant="soft"
                      color="default"
                      sx={{ minWidth: 26, height: 26, fontSize: 11.5, fontWeight: 700, borderRadius: 1 }}
                    >
                      {idx + 1}
                    </Label>
                    <TextField
                      size="small"
                      fullWidth
                      variant="standard"
                      placeholder="Choice label..."
                      value={option}
                      onChange={(e) => handleEditOption(idx, e.target.value)}
                      InputProps={{ disableUnderline: true, sx: { fontSize: 13.5, fontWeight: 500 } }}
                    />
                    <Tooltip title={options.length <= 1 ? 'Minimum 1 option required' : 'Remove choice'}>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveOption(idx)}
                          disabled={options.length <= 1}
                          sx={{ opacity: options.length <= 1 ? 0.35 : 0.8, '&:hover': { opacity: 1 } }}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                ))}
              </Stack>

              {/* Add New Option Field */}
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Type a new choice (e.g. Needs Attention)..."
                  value={newOptionText}
                  onChange={(e) => setNewOptionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 1.5,
                    '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddOption}
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  sx={{
                    whiteSpace: 'nowrap',
                    px: 2.25,
                    fontWeight: 700,
                    borderRadius: 1.5,
                    boxShadow: (theme) => theme.customShadows?.primary,
                  }}
                >
                  Add
                </Button>
              </Stack>

              <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

              {/* Include Other Switch Card */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 1.5,
                  px: 1.75,
                  borderRadius: 1.5,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: hasOtherOption ? 'warning.main' : 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onClick={() => setHasOtherOption((prev) => !prev)}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
                      display: 'grid',
                      placeItems: 'center',
                      color: 'warning.main',
                    }}
                  >
                    <Iconify icon="solar:chat-round-line-bold" width={18} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                      Include &apos;Other&apos; choice
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Automatically shows an explanation text box when visitor chooses &apos;Other&apos;
                    </Typography>
                  </Box>
                </Stack>
                <Switch
                  size="small"
                  color="warning"
                  checked={hasOtherOption}
                  onChange={(e) => setHasOtherOption(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
              </Stack>
            </Card>
          )}

          {/* 4. Text Placeholder config */}
          {type === 'text' && (
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="solar:text-bold" width={18} sx={{ color: 'secondary.main' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Placeholder Hint (Optional)
                </Typography>
              </Stack>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Please describe your feedback in detail..."
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                InputProps={{ sx: { borderRadius: 1.5 } }}
                helperText="Hint text displayed inside the text area when empty"
              />
            </Stack>
          )}

          {/* 5. Required Question Switch Card */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 1.75,
              px: 2,
              borderRadius: 1.75,
              border: '1px solid',
              borderColor: required ? 'primary.main' : 'divider',
              bgcolor: (theme) =>
                required ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={() => setRequired((prev) => !prev)}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1,
                  bgcolor: (theme) =>
                    required ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.grey[500], 0.1),
                  display: 'grid',
                  placeItems: 'center',
                  color: required ? 'primary.main' : 'text.disabled',
                }}
              >
                <Iconify icon="solar:shield-check-bold" width={20} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13.5 }}>
                  Mandatory question
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Visitors must answer this question before submitting their feedback
                </Typography>
              </Box>
            </Stack>
            <Switch
              size="small"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
          </Stack>
        </Stack>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: 3,
          py: 2.25,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.02),
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{ fontWeight: 600, borderRadius: 1.5, px: 2.5 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<Iconify icon="solar:check-circle-bold" />}
          sx={{
            fontWeight: 700,
            px: 3,
            borderRadius: 1.5,
            boxShadow: (theme) => theme.customShadows?.primary,
          }}
        >
          {question ? 'Update Question' : 'Save Question'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

QuestionEditorDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  question: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

// ----------------------------------------------------------------------

function VisitorSurveySettings({ settings, onSave, saving }) {
  const [state, setState] = useState(() => settings || DEFAULT_VISITOR_SURVEY_SETTINGS);

  // Dynamic survey questions state
  const [questions, setQuestions] = useState(() => getSurveyQuestions());
  const [builderMode, setBuilderMode] = useState(false);
  const [editorDialog, setEditorDialog] = useState({ open: false, index: null, question: null });

  // Dynamic form responses state
  const [visitorName, setVisitorName] = useState('');
  const [duration, setDuration] = useState('');
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    questions.forEach((q) => {
      if (q.type === 'radio') initial[q.id] = q.options?.[0] || '';
      else if (q.type === 'select') initial[q.id] = q.options?.[0] || '';
      else if (q.type === 'rating') initial[q.id] = 5;
      else initial[q.id] = '';
    });
    return initial;
  });
  const [otherExplanations, setOtherExplanations] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure answer keys exist when questions change
  useEffect(() => {
    setAnswers((prev) => {
      const next = { ...prev };
      questions.forEach((q) => {
        if (next[q.id] === undefined) {
          if (q.type === 'radio') next[q.id] = q.options?.[0] || '';
          else if (q.type === 'select') next[q.id] = q.options?.[0] || '';
          else if (q.type === 'rating') next[q.id] = 5;
          else next[q.id] = '';
        }
      });
      return next;
    });
  }, [questions]);

  // Question builder operations
  const handleOpenAdd = () => {
    setEditorDialog({ open: true, index: null, question: null });
  };

  const handleOpenEdit = (q, index) => {
    setEditorDialog({ open: true, index, question: q });
  };

  const handleCloseEditor = () => {
    setEditorDialog({ open: false, index: null, question: null });
  };

  const handleSaveQuestion = (questionData) => {
    let nextQuestions;
    if (editorDialog.index !== null) {
      nextQuestions = questions.map((item, idx) => (idx === editorDialog.index ? questionData : item));
      toast.success('Question updated successfully!');
    } else {
      nextQuestions = [...questions, questionData];
      toast.success('New question added successfully!');
    }
    setQuestions(nextQuestions);
    saveSurveyQuestions(nextQuestions);
  };

  const handleDeleteQuestion = (indexToRemove) => {
    const nextQuestions = questions.filter((_, idx) => idx !== indexToRemove);
    setQuestions(nextQuestions);
    saveSurveyQuestions(nextQuestions);
    toast.info('Question removed');
  };

  const handleMoveQuestion = (index, delta) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const nextQuestions = [...questions];
    const temp = nextQuestions[index];
    nextQuestions[index] = nextQuestions[targetIndex];
    nextQuestions[targetIndex] = temp;
    setQuestions(nextQuestions);
    saveSurveyQuestions(nextQuestions);
  };

  const handleResetToDefaultQuestions = () => {
    const defaults = resetSurveyQuestions();
    setQuestions(defaults);
    toast.info('Questions reset to default template');
  };

  // Form answer handlers
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleOtherExplanationChange = (questionId, value) => {
    setOtherExplanations((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleClearFeedbackForm = () => {
    setVisitorName('');
    setDuration('');
    const resetAns = {};
    questions.forEach((q) => {
      if (q.type === 'radio') resetAns[q.id] = q.options?.[0] || '';
      else if (q.type === 'select') resetAns[q.id] = q.options?.[0] || '';
      else if (q.type === 'rating') resetAns[q.id] = 5;
      else resetAns[q.id] = '';
    });
    setAnswers(resetAns);
    setOtherExplanations({});
  };

  const onSubmitFeedback = async (e) => {
    e.preventDefault();

    if (!visitorName.trim()) {
      toast.error('Visitor name is required');
      return;
    }
    if (!duration.trim()) {
      toast.error('Stay duration is required');
      return;
    }

    // Validate required questions
    for (let i = 0; i < questions.length; i += 1) {
      const q = questions[i];
      if (q.required) {
        const ans = answers[q.id];
        if (ans === undefined || ans === null || String(ans).trim() === '') {
          toast.error(`Please answer question ${i + 1}: "${q.title}"`);
          return;
        }
        if (String(ans).toLowerCase() === 'other' && !otherExplanations[q.id]?.trim()) {
          toast.error(`Please explain your answer for question ${i + 1}`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      addMockVisitorFeedbackResponse({
        visitorName,
        duration,
        rating: answers['q-rating'] || 5,
        comment: answers['q-comment'] || '',
        whoVisited: answers['q-who-visited'] || '—',
        whoVisitedOther: otherExplanations['q-who-visited'] || '',
        expectedReason: answers['q-expected-reason'] || 'yes',
        expectedReasonOther: otherExplanations['q-expected-reason'] || '',
        customAnswers: answers,
      });

      handleClearFeedbackForm();
      toast.success('Visitor feedback logged successfully!');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateChannel = (key, value) => {
    setState((prev) => ({
      ...prev,
      channels: { ...prev.channels, [key]: value },
    }));
  };

  const updateRecipient = (key, value) => {
    setState((prev) => ({
      ...prev,
      recipients: { ...prev.recipients, [key]: value },
    }));
  };

  const updateInclude = (key, value) => {
    setState((prev) => ({
      ...prev,
      includes: { ...prev.includes, [key]: value },
    }));
  };

  const handleResetSettings = () => {
    setState(settings || DEFAULT_VISITOR_SURVEY_SETTINGS);
    toast.info('Reverted changes');
  };

  const handleSaveSettings = () => {
    onSave?.(state);
    toast.success('Visitor survey settings saved!');
  };

  return (
    <Stack spacing={3}>
      {/* 1. Notifications Configuration Card */}
      <Card>
        <CardHeader
          title="Visitor survey notifications"
          subheader="Notify staff when a visitor completes the post-visit survey"
          action={
            <Switch
              checked={Boolean(state.enabled)}
              onChange={(e) => setState((prev) => ({ ...prev, enabled: e.target.checked }))}
            />
          }
          sx={{ pb: 1.5 }}
        />

        <Collapse in={Boolean(state.enabled)} timeout="auto" unmountOnExit>
          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Notify via */}
            <Stack spacing={1.25}>
              <SectionTitle icon="solar:bell-bing-bold-duotone" title="Notify via" />
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <CompactOptionCard
                    icon="solar:letter-bold-duotone"
                    label="Email notifications"
                    checked={state.channels?.email}
                    onChange={(val) => updateChannel('email', val)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CompactOptionCard
                    icon="solar:bell-bold-duotone"
                    label="In-app notification bell"
                    checked={state.channels?.inApp}
                    onChange={(val) => updateChannel('inApp', val)}
                  />
                </Grid>
              </Grid>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

            {/* Recipients */}
            <Stack spacing={1.25}>
              <SectionTitle icon="solar:users-group-rounded-bold-duotone" title="Recipients" />
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <CompactOptionCard
                    icon="solar:user-id-bold-duotone"
                    label="Site Manager"
                    checked={state.recipients?.siteManager}
                    onChange={(val) => updateRecipient('siteManager', val)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CompactOptionCard
                    icon="solar:user-bold-duotone"
                    label="Line Manager"
                    checked={state.recipients?.lineManager}
                    onChange={(val) => updateRecipient('lineManager', val)}
                  />
                </Grid>
              </Grid>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

            {/* Notification content */}
            <Stack spacing={1.25}>
              <SectionTitle icon="solar:document-text-bold-duotone" title="Notification content includes" />
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <CompactOptionCard
                    icon="solar:star-bold-duotone"
                    label="Feedback rating & summary"
                    checked={state.includes?.feedbackRating}
                    onChange={(val) => updateInclude('feedbackRating', val)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CompactOptionCard
                    icon="solar:clock-circle-bold-duotone"
                    label="Visit duration"
                    checked={state.includes?.visitDuration}
                    onChange={(val) => updateInclude('visitDuration', val)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CompactOptionCard
                    icon="solar:user-hand-up-bold-duotone"
                    label="Who they visited"
                    checked={state.includes?.whoVisited}
                    onChange={(val) => updateInclude('whoVisited', val)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CompactOptionCard
                    icon="solar:chat-round-line-bold-duotone"
                    label="Free-text comments"
                    checked={state.includes?.freeTextComments}
                    onChange={(val) => updateInclude('freeTextComments', val)}
                  />
                </Grid>
              </Grid>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

            {/* Save Row */}
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button variant="outlined" color="inherit" size="small" onClick={handleResetSettings}>
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                size="small"
                loading={saving}
                onClick={handleSaveSettings}
              >
                Save changes
              </LoadingButton>
            </Stack>
          </Stack>
        </Collapse>
      </Card>

      {/* 2. Log Visitor Feedback & Survey Question Builder Card */}
      <Card>
        <CardHeader
          title="Log visitor feedback"
          subheader={
            builderMode
              ? 'Customize questions, create custom MCQs with options, and configure answer types'
              : 'Manually record feedback shared by a visitor after checkout'
          }
          action={
            <Button
              variant={builderMode ? 'contained' : 'outlined'}
              size="small"
              startIcon={
                <Iconify
                  icon={builderMode ? 'solar:clipboard-check-bold' : 'solar:pen-new-square-bold'}
                />
              }
              onClick={() => setBuilderMode((prev) => !prev)}
            >
              {builderMode ? 'View & Log Feedback' : `Customize Questions (${questions.length})`}
            </Button>
          }
          sx={{ pb: 1.5 }}
        />

        <Divider sx={{ borderStyle: 'dashed' }} />

        {builderMode ? (
          /* ================= QUESTION BUILDER MODE ================= */
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
                  {questions.length} configured
                </Label>
              </Stack>

              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  startIcon={<Iconify icon="solar:restart-bold" />}
                  onClick={handleResetToDefaultQuestions}
                >
                  Reset defaults
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={handleOpenAdd}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 1.25,
                    boxShadow: (theme) => theme.customShadows?.primary,
                  }}
                >
                  Add question
                </Button>
              </Stack>
            </Stack>

            {/* Questions List */}
            <Stack spacing={2}>
              {questions.map((q, idx) => (
                <Card
                  key={q.id || idx}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                    borderColor: 'divider',
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
                        Q{idx + 1}
                      </Label>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5} sx={{ mb: 0.75 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 14 }}>
                            {q.title}
                          </Typography>
                          {q.required && (
                            <Chip size="small" label="Required" color="error" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                          )}
                          <Label variant="soft" color={QUESTION_TYPE_COLORS[q.type] || 'default'} sx={{ height: 20, fontSize: 11 }}>
                            {QUESTION_TYPE_LABELS[q.type]}
                          </Label>
                        </Stack>

                        {/* Options preview for MCQ / Select */}
                        {(q.type === 'radio' || q.type === 'select') && q.options && q.options.length > 0 && (
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
                            {q.hasOtherOption && (
                              <Chip
                                label="+ Other (with explanation field)"
                                size="small"
                                variant="soft"
                                color="warning"
                                sx={{ height: 24, fontSize: 12 }}
                              />
                            )}
                          </Stack>
                        )}

                        {/* Rating preview */}
                        {q.type === 'rating' && (
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                            <Rating value={5} readOnly size="small" />
                            <Typography variant="caption" color="text.secondary">
                              (1 - 5 star rating)
                            </Typography>
                          </Stack>
                        )}

                        {/* Text preview */}
                        {q.type === 'text' && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Multiline text comment field {q.placeholder ? `(Placeholder: "${q.placeholder}")` : ''}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    {/* Question Actions */}
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Tooltip title="Move up">
                        <span>
                          <IconButton
                            size="small"
                            disabled={idx === 0}
                            onClick={() => handleMoveQuestion(idx, -1)}
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
                            onClick={() => handleMoveQuestion(idx, 1)}
                          >
                            <Iconify icon="solar:arrow-down-bold" width={16} />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Edit question and MCQ options">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEdit(q, idx)}
                        >
                          <Iconify icon="solar:pen-bold" width={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete question">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteQuestion(idx)}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>

            <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

            {/* Bottom Builder actions */}
            <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={handleOpenAdd}
                sx={{
                  fontWeight: 600,
                  borderRadius: 1.25,
                  borderStyle: 'dashed',
                  '&:hover': { borderStyle: 'dashed' },
                }}
              >
                Add another question
              </Button>

              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="solar:clipboard-check-bold" />}
                onClick={() => setBuilderMode(false)}
              >
                Done &amp; View Form
              </Button>
            </Stack>
          </Stack>
        ) : (
          /* ================= DYNAMIC FEEDBACK FORM MODE ================= */
          <Box component="form" onSubmit={onSubmitFeedback}>
            <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 3 } }}>
              {/* Top row: visitor name and stay duration */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Visitor name"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Stay duration"
                    placeholder="e.g. 45m"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />
                </Grid>
              </Grid>

              {/* Dynamic Questions List */}
              {questions.map((q, idx) => {
                const currentAnswer = answers[q.id] ?? '';
                const isOtherSelected =
                  String(currentAnswer).toLowerCase() === 'other' ||
                  (String(currentAnswer).toLowerCase().includes('other') && q.hasOtherOption);

                return (
                  <Stack key={q.id || idx} spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {idx + 1}. {q.title} {q.required && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}
                    </Typography>

                    {/* 1. Multiple choice (Radio) */}
                    {q.type === 'radio' && (
                      <>
                        <RadioGroup
                          row
                          value={currentAnswer}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        >
                          {q.options?.map((option, oIdx) => (
                            <FormControlLabel
                              key={oIdx}
                              value={option}
                              control={<Radio size="small" />}
                              label={option}
                              sx={{ mr: 2.5 }}
                            />
                          ))}
                        </RadioGroup>

                        <Collapse in={isOtherSelected} timeout="auto" unmountOnExit>
                          <TextField
                            size="small"
                            fullWidth
                            label="Please explain"
                            placeholder="Explain your answer..."
                            value={otherExplanations[q.id] || ''}
                            onChange={(e) => handleOtherExplanationChange(q.id, e.target.value)}
                            sx={{ mt: 1 }}
                          />
                        </Collapse>
                      </>
                    )}

                    {/* 2. Dropdown selection */}
                    {q.type === 'select' && (
                      <>
                        <FormControl fullWidth size="small">
                          <InputLabel id={`select-label-${q.id}`}>Select option</InputLabel>
                          <Select
                            labelId={`select-label-${q.id}`}
                            value={currentAnswer}
                            label="Select option"
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          >
                            {q.options?.map((option, oIdx) => (
                              <MenuItem key={oIdx} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <Collapse in={isOtherSelected} timeout="auto" unmountOnExit>
                          <TextField
                            size="small"
                            fullWidth
                            label="Please specify details"
                            placeholder="Provide additional details..."
                            value={otherExplanations[q.id] || ''}
                            onChange={(e) => handleOtherExplanationChange(q.id, e.target.value)}
                            sx={{ mt: 1 }}
                          />
                        </Collapse>
                      </>
                    )}

                    {/* 3. Star rating */}
                    {q.type === 'rating' && (
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Rating
                          size="large"
                          value={Number(currentAnswer) || 0}
                          onChange={(_, val) => handleAnswerChange(q.id, val)}
                        />
                        {Number(currentAnswer) > 0 && (
                          <Label
                            variant="soft"
                            color={RATING_COLORS[Number(currentAnswer)] || 'default'}
                            sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                          >
                            {RATING_LABELS[Number(currentAnswer)]}
                          </Label>
                        )}
                      </Stack>
                    )}

                    {/* 4. Text input / Comment */}
                    {q.type === 'text' && (
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder={q.placeholder || 'Enter your response...'}
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      />
                    )}
                  </Stack>
                );
              })}

              <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

              <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center">
                <Button
                  variant="text"
                  color="inherit"
                  size="small"
                  startIcon={<Iconify icon="solar:pen-new-square-bold" />}
                  onClick={() => setBuilderMode(true)}
                >
                  Customize questions &amp; options
                </Button>

                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    onClick={handleClearFeedbackForm}
                  >
                    Clear
                  </Button>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    size="small"
                    loading={isSubmitting}
                  >
                    Log feedback
                  </LoadingButton>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        )}
      </Card>

      {/* Question Editor Dialog */}
      <QuestionEditorDialog
        open={editorDialog.open}
        question={editorDialog.question}
        onSave={handleSaveQuestion}
        onClose={handleCloseEditor}
      />
    </Stack>
  );
}

export default VisitorSurveySettings;

VisitorSurveySettings.propTypes = {
  settings: PropTypes.object,
  onSave: PropTypes.func,
  saving: PropTypes.bool,
};
