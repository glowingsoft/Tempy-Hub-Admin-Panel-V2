import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Alert from '@mui/material/Alert';
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
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
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
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { getAssignedBranch } from 'src/sections/org-rollup/utils';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetStaffProfilesQuery } from 'src/store/Reducer/staff-profiles-api';
import { addMockVisitorFeedbackResponse } from './mocks/data';
import {
  EMPTY_VISITOR_SURVEY_SETTINGS,
  isChoiceQuestionType,
  resetQuestionsToSystemDefaults,
} from './visitor-survey-mappers';

const ALL_SITES_OPTION = { value: 'all', label: 'All sites' };

const mapVisitorBranchOption = (branch) => ({
  value: branch._id,
  label: branch.name,
});

const mapVisitorStaffOption = (profile) => {
  const branch = profile.branchId || profile.branch;

  return {
    value: profile._id,
    label: profile.userId?.name || profile.user?.name || profile.employeeCode || profile._id,
    branchId: typeof branch === 'object' ? branch?._id : branch,
  };
};

// ----------------------------------------------------------------------

function CompactOptionCard({ icon, label, checked, onChange, disabled }) {
  return (
    <Card
      variant="outlined"
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
      sx={{
        py: 1,
        px: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        borderRadius: 1.25,
        borderColor: checked ? 'primary.main' : 'divider',
        bgcolor: (theme) =>
          checked
            ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.04)
            : 'background.paper',
        transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
        '&:hover': {
          borderColor: disabled ? undefined : 'primary.main',
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
        disabled={disabled}
        checked={Boolean(checked)}
        onChange={(e) => {
          e.stopPropagation();
          if (!disabled) onChange(e.target.checked);
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
  disabled: PropTypes.bool,
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
  yesNo: 'Yes / No',
  singleSelect: 'Single Select',
  rating: 'Star Rating',
  text: 'Text / Comment',
};

const QUESTION_TYPE_COLORS = {
  yesNo: 'primary',
  singleSelect: 'info',
  rating: 'warning',
  text: 'secondary',
};

const QUESTION_TYPES = [
  {
    value: 'yesNo',
    label: 'Yes / No',
    description: 'Two-choice yes or no answers',
    icon: 'solar:list-check-bold',
    color: 'primary',
  },
  {
    value: 'singleSelect',
    label: 'Single Select',
    description: 'Pick one option from a list',
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

function QuestionEditorDialog({ open, question, onSave, onClose, saving }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('yesNo');
  const [options, setOptions] = useState([]);
  const [newOptionText, setNewOptionText] = useState('');
  const [hasOtherOption, setHasOtherOption] = useState(false);
  const [required, setRequired] = useState(false);
  const [active, setActive] = useState(true);
  const [keyValue, setKeyValue] = useState('');

  useEffect(() => {
    if (question) {
      setTitle(question.title || question.prompt || '');
      setType(question.type || 'yesNo');
      setOptions(Array.isArray(question.options) ? [...question.options] : []);
      setHasOtherOption(Boolean(question.hasOtherOption));
      setRequired(Boolean(question.required));
      setActive(question.active !== false);
      setKeyValue(question.key || '');
    } else {
      setTitle('');
      setType('yesNo');
      setOptions(['Yes', 'No']);
      setHasOtherOption(false);
      setRequired(true);
      setActive(true);
      setKeyValue('');
    }
    setNewOptionText('');
  }, [question, open]);

  const handleSelectType = (nextType) => {
    setType(nextType);
    if (nextType === 'yesNo' && options.length === 0) {
      setOptions(['Yes', 'No']);
    }
  };

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

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Question prompt is required');
      return;
    }
    if (isChoiceQuestionType(type) && options.filter((opt) => String(opt).trim()).length === 0) {
      toast.error('Please add at least one option for this question');
      return;
    }
    const result = await onSave({
      id: question?.id,
      _id: question?._id,
      key: keyValue.trim() || question?.key,
      source: question?.source || 'custom',
      title: title.trim(),
      prompt: title.trim(),
      type,
      options: isChoiceQuestionType(type) ? options : [],
      hasOtherOption: isChoiceQuestionType(type) ? hasOtherOption : false,
      required,
      active,
      sortOrder: question?.sortOrder,
    });
    if (result !== false) onClose();
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
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {question ? 'Edit Survey Question' : 'Add New Survey Question'}
              </Typography>
              <Label variant="soft" color="primary" sx={{ fontSize: 11, fontWeight: 700 }}>
                {question ? 'Editing' : 'New'}
              </Label>
            </Stack>
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

      <DialogContent sx={{ p: 3, pt: '28px !important' }}>
        <Stack spacing={3} sx={{ pt: 1.5 }}>
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
                      onClick={() => handleSelectType(item.value)}
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
          {isChoiceQuestionType(type) && (
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
                  color="primary"
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

          <TextField
            fullWidth
            size="small"
            label="Question key"
            placeholder="auto-generated from prompt if left blank"
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            disabled={question?.source === 'system'}
            helperText="Stable identifier sent to the API (key). System questions keep their reserved key."
            InputProps={{ sx: { borderRadius: 1.5 } }}
          />

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

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 1.75,
              px: 2,
              borderRadius: 1.75,
              border: '1px solid',
              borderColor: active ? 'success.main' : 'divider',
              bgcolor: (theme) =>
                active ? alpha(theme.palette.success.main, 0.05) : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={() => setActive((prev) => !prev)}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1,
                  bgcolor: (theme) =>
                    active ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.grey[500], 0.1),
                  display: 'grid',
                  placeItems: 'center',
                  color: active ? 'success.main' : 'text.disabled',
                }}
              >
                <Iconify icon="solar:eye-bold" width={20} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13.5 }}>
                  Active
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inactive questions stay in the list but are not shown to visitors
                </Typography>
              </Box>
            </Stack>
            <Switch
              size="small"
              color="success"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
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
        <LoadingButton
          variant="contained"
          color="primary"
          onClick={handleSave}
          loading={Boolean(saving)}
          startIcon={<Iconify icon="solar:check-circle-bold" />}
          sx={{
            fontWeight: 700,
            px: 3,
            borderRadius: 1.5,
            boxShadow: (theme) => theme.customShadows?.primary,
          }}
        >
          {question ? 'Update Question' : 'Save Question'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

QuestionEditorDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  question: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

// ----------------------------------------------------------------------

function VisitorSurveySettings({
  settings,
  questions: questionsProp,
  loading,
  errorMessage,
  canEdit = true,
  saving,
  savingQuestions,
  submittingFeedback,
  onSave,
  onSaveQuestions,
  onSubmitFeedback: onSubmitFeedbackProp,
  onRetry,
}) {
  const [state, setState] = useState(() => settings || EMPTY_VISITOR_SURVEY_SETTINGS);

  // Dynamic survey questions state
  const [questions, setQuestions] = useState(() => questionsProp || []);
  const [builderMode, setBuilderMode] = useState(false);
  const [editorDialog, setEditorDialog] = useState({ open: false, index: null, question: null });

  const { organizationId, isOwner, user } = useCurrentOrganization();
  const isApiSubmission = Boolean(onSubmitFeedbackProp);

  const assignedBranch = useMemo(
    () => (!isOwner ? getAssignedBranch(user, organizationId) : null),
    [isOwner, user, organizationId]
  );

  const { data: branchesData } = useGetBranchesQuery(
    { organizationId, page: 1, limit: 100 },
    { skip: !organizationId || isApiSubmission }
  );
  const branches = useMemo(() => branchesData?.data ?? [], [branchesData]);

  // Selected Branch for feedback logging
  const [selectedBranchId, setSelectedBranchId] = useState(() => assignedBranch?.id || '');
  const [selectedOwnerSite, setSelectedOwnerSite] = useState(ALL_SITES_OPTION);
  const [selectedHostStaff, setSelectedHostStaff] = useState(null);
  const staffBranchId = isOwner
    ? selectedOwnerSite.value === 'all'
      ? undefined
      : selectedOwnerSite.value
    : assignedBranch?.id;
  const staffQueryArgs = {
    organizationId,
    ...(staffBranchId ? { branchId: staffBranchId } : {}),
  };

  // Auto-select branch
  useEffect(() => {
    if (!isOwner && assignedBranch?.id) {
      setSelectedBranchId(assignedBranch.id);
    } else if (isOwner && !isApiSubmission && branches.length > 0) {
      setSelectedBranchId((prev) => {
        if (prev && branches.some((b) => b._id === prev)) return prev;
        return branches[0]._id;
      });
    }
  }, [isOwner, isApiSubmission, assignedBranch, branches]);

  // Dynamic form responses state
  const [visitorName, setVisitorName] = useState('');
  const [duration, setDuration] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    questionsProp?.forEach((q) => {
      initial[q.id] = '';
    });
    return initial;
  });
  const [otherExplanations, setOtherExplanations] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedHostStaff(null);
  }, [staffBranchId]);

  const lastSurveyErrorRef = useRef(null);
  useEffect(() => {
    if (errorMessage && errorMessage !== 'No organization selected') {
      if (lastSurveyErrorRef.current !== errorMessage) {
        lastSurveyErrorRef.current = errorMessage;
        toast.error(errorMessage);
      }
    }
  }, [errorMessage]);

  const clearFormError = (field) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    setState(settings || EMPTY_VISITOR_SURVEY_SETTINGS);
  }, [settings]);

  useEffect(() => {
    setQuestions(Array.isArray(questionsProp) ? questionsProp : []);
  }, [questionsProp]);

  const persistQuestions = async (nextQuestions, successMessage) => {
    const ok = await onSaveQuestions?.(nextQuestions);
    if (ok !== false) {
      setQuestions(nextQuestions);
      if (successMessage) toast.success(successMessage);
      return true;
    }
    return false;
  };

  // Ensure answer keys exist when questions change
  useEffect(() => {
    setAnswers((prev) => {
      const next = { ...prev };
      questions.forEach((q) => {
        if (next[q.id] === undefined) {
          next[q.id] = '';
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

  const handleSaveQuestion = async (questionData) => {
    let nextQuestions;
    let successMessage;
    if (editorDialog.index !== null) {
      nextQuestions = questions.map((item, idx) =>
        idx === editorDialog.index ? { ...item, ...questionData } : item
      );
      successMessage = 'Question updated successfully!';
    } else {
      nextQuestions = [
        ...questions,
        {
          ...questionData,
          id: questionData.id || questionData._id || questionData.key || `custom-${Date.now()}`,
          source: 'custom',
          active: true,
        },
      ];
      successMessage = 'New question added successfully!';
    }
    nextQuestions = nextQuestions.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    return persistQuestions(nextQuestions, successMessage);
  };

  const handleDeleteQuestion = async (indexToRemove) => {
    const target = questions[indexToRemove];
    const nextQuestions =
      target?.source === 'system'
        ? questions.map((item, idx) => (idx === indexToRemove ? { ...item, active: false } : item))
        : questions.filter((_, idx) => idx !== indexToRemove);
    await persistQuestions(
      nextQuestions.map((item, idx) => ({ ...item, sortOrder: idx + 1 })),
      'Question removed'
    );
  };

  const handleMoveQuestion = async (index, delta) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const nextQuestions = [...questions];
    const temp = nextQuestions[index];
    nextQuestions[index] = nextQuestions[targetIndex];
    nextQuestions[targetIndex] = temp;
    await persistQuestions(nextQuestions.map((item, idx) => ({ ...item, sortOrder: idx + 1 })));
  };

  const handleResetToDefaultQuestions = async () => {
    await persistQuestions(
      resetQuestionsToSystemDefaults(questions),
      'Restored system default questions'
    );
  };

  // Form answer handlers
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    clearFormError(questionId);
  };

  const handleOtherExplanationChange = (questionId, value) => {
    setOtherExplanations((prev) => ({ ...prev, [questionId]: value }));
    clearFormError(`${questionId}_other`);
  };

  const handleClearFeedbackForm = () => {
    setSelectedHostStaff(null);
    setVisitorName('');
    setDuration('');
    setFormErrors({});
    if (isApiSubmission && isOwner) {
      setSelectedOwnerSite(ALL_SITES_OPTION);
    } else if (isOwner && branches.length > 0) {
      setSelectedBranchId(branches[0]._id);
    } else if (assignedBranch?.id) {
      setSelectedBranchId(assignedBranch.id);
    }
    const resetAns = {};
    formQuestions.forEach((q) => {
      resetAns[q.id] = '';
    });
    setAnswers(resetAns);
    setOtherExplanations({});
  };

  const onSubmitFeedback = async (e) => {
    e.preventDefault();

    const errors = {};
    const submissionBranchId = isApiSubmission
      ? isOwner
        ? selectedHostStaff?.branchId
        : assignedBranch?.id
      : selectedBranchId;

    if (!submissionBranchId) {
      errors.branchId = 'Please select a site / branch';
    }
    if (isApiSubmission && (!selectedHostStaff?.value || !selectedHostStaff.branchId)) {
      errors.hostStaffId = 'Please select a staff member';
    }
    if (
      isApiSubmission &&
      !isOwner &&
      selectedHostStaff?.branchId !== assignedBranch?.id
    ) {
      errors.hostStaffId = 'Please select a staff member from your assigned site';
    }
    if (
      isApiSubmission &&
      isOwner &&
      selectedOwnerSite.value !== 'all' &&
      selectedHostStaff?.branchId !== selectedOwnerSite.value
    ) {
      errors.hostStaffId = 'Please select a staff member from the selected site';
    }
    if (!visitorName.trim()) {
      errors.visitorName = 'Visitor name is required';
    }
    if (!duration.trim()) {
      errors.duration = 'Stay duration is required';
    }

    // Validate required questions among visible form questions only
    for (let i = 0; i < formQuestions.length; i += 1) {
      const q = formQuestions[i];
      if (q.required) {
        const ans = answers[q.id];
        if (ans === undefined || ans === null || String(ans).trim() === '') {
          errors[q.id] = 'This field is required';
        } else if (
          !isApiSubmission &&
          String(ans).toLowerCase() === 'other' &&
          !otherExplanations[q.id]?.trim()
        ) {
          errors[`${q.id}_other`] = 'Please explain your answer';
        }
      }
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedAnswers = formQuestions
        .filter((q) => {
          const value = answers[q.id];
          return value !== undefined && value !== null && String(value).trim() !== '';
        })
        .map((q) => ({
          questionId: q.id,
          value: String(answers[q.id]),
        }));

      const ratingQuestion = formQuestions.find((q) => q.type === 'rating');
      const commentQuestion = formQuestions.find((q) => q.type === 'text');
      const whoQuestion = formQuestions.find(
        (q) => q.key === 'whoVisited' || q.prompt?.toLowerCase().includes('who did you visit')
      );
      const reasonQuestion = formQuestions.find(
        (q) => q.key === 'expectedVisit' || q.prompt?.toLowerCase().includes('reason you expected')
      );
      const legacyPayload = {
        branchId: selectedBranchId,
        visitorName: visitorName.trim(),
        duration: duration.trim(),
        rating: ratingQuestion ? Number(answers[ratingQuestion.id]) || 5 : 5,
        comment: commentQuestion ? answers[commentQuestion.id] || '' : '',
        whoVisited: whoQuestion ? answers[whoQuestion.id] || '—' : '—',
        whoVisitedOther: whoQuestion ? otherExplanations[whoQuestion.id] || '' : '',
        expectedReason: reasonQuestion ? answers[reasonQuestion.id] || 'Yes' : 'Yes',
        expectedReasonOther: reasonQuestion ? otherExplanations[reasonQuestion.id] || '' : '',
        responses: formQuestions.map((q) => ({
          questionId: q.id,
          questionKey: q.key,
          prompt: q.prompt || q.title,
          type: q.type,
          answer: answers[q.id] ?? '',
          explanation: otherExplanations[q.id] || null,
        })),
        customAnswers: answers,
        otherExplanations,
      };
      const apiPayload = {
        branchId: submissionBranchId,
        hostStaffId: selectedHostStaff?.value,
        visitorName: visitorName.trim(),
        stayDuration: duration.trim(),
        answers: formattedAnswers,
      };

      if (onSubmitFeedbackProp) {
        const ok = await onSubmitFeedbackProp(apiPayload);
        if (ok !== false) {
          addMockVisitorFeedbackResponse(legacyPayload);
          handleClearFeedbackForm();
          toast.success('Visitor feedback logged successfully!');
        }
      } else {
        addMockVisitorFeedbackResponse(legacyPayload);
        handleClearFeedbackForm();
        toast.success('Visitor feedback logged successfully!');
      }
    } catch (error) {
      console.error('Failed to log visitor feedback:', error);
      toast.error(error?.data?.message || error?.message || 'Something went wrong. Please try again.');
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
    setState(settings || EMPTY_VISITOR_SURVEY_SETTINGS);
    toast.info('Reverted changes');
  };

  const handleSaveSettings = async () => {
    await onSave?.(state);
  };

  const visibleQuestions = questions.filter((q) => q.active !== false);
  const formQuestions = builderMode ? questions : visibleQuestions;

  if (loading) {
    return (
      <Card>
        <LinearProgress />
      </Card>
    );
  }

  if (errorMessage === 'No organization selected') {
    return (
      <Alert severity="warning">
        Please select an organization to view visitor survey settings.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      {/* 1. Notifications Configuration Card */}
      <Card>
        <CardHeader
          title="Visitor survey notifications"
          subheader="Notify staff when a visitor completes the post-visit survey"
          action={
            <Switch
              disabled={!canEdit}
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
                    disabled={!canEdit}
                    onChange={(val) => updateChannel('email', val)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CompactOptionCard
                    icon="solar:bell-bold-duotone"
                    label="In-app notification bell"
                    checked={state.channels?.inApp}
                    disabled={!canEdit}
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
                    disabled={!canEdit}
                    onChange={(val) => updateRecipient('siteManager', val)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CompactOptionCard
                    icon="solar:user-bold-duotone"
                    label="Line Manager"
                    checked={state.recipients?.lineManager}
                    disabled={!canEdit}
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
                    disabled={!canEdit}
                    onChange={(val) => updateInclude('feedbackRating', val)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CompactOptionCard
                    icon="solar:clock-circle-bold-duotone"
                    label="Visit duration"
                    checked={state.includes?.visitDuration}
                    disabled={!canEdit}
                    onChange={(val) => updateInclude('visitDuration', val)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CompactOptionCard
                    icon="solar:user-hand-up-bold-duotone"
                    label="Who they visited"
                    checked={state.includes?.whoVisited}
                    disabled={!canEdit}
                    onChange={(val) => updateInclude('whoVisited', val)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CompactOptionCard
                    icon="solar:chat-round-line-bold-duotone"
                    label="Free-text comments"
                    checked={state.includes?.freeTextComments}
                    disabled={!canEdit}
                    onChange={(val) => updateInclude('freeTextComments', val)}
                  />
                </Grid>
              </Grid>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

            {canEdit && (
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button variant="outlined" color="inherit" size="small" onClick={handleResetSettings}>
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                color="primary"
                size="small"
                loading={saving}
                onClick={handleSaveSettings}
              >
                Save changes
              </LoadingButton>
            </Stack>
            )}
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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
              {isApiSubmission && isOwner && (
                <InfiniteAutocomplete
                  value={selectedOwnerSite}
                  onChange={(site) => {
                    const nextSite = site || ALL_SITES_OPTION;
                    setSelectedOwnerSite(nextSite);
                    setSelectedHostStaff(null);
                    clearFormError('branchId');
                    clearFormError('hostStaffId');
                  }}
                  useQuery={useGetBranchesQuery}
                  queryArgs={{ organizationId }}
                  mapOption={mapVisitorBranchOption}
                  extraOptions={[ALL_SITES_OPTION]}
                  label="Site"
                  placeholder="All sites"
                  disabled={!organizationId}
                  disableClearable
                  size="small"
                  sx={{ minWidth: { xs: 220, sm: 200 } }}
                  error={Boolean(formErrors.branchId)}
                  helperText={formErrors.branchId}
                  textFieldProps={{
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify
                            icon="solar:buildings-bold-duotone"
                            width={20}
                            sx={{ color: 'primary.main' }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
              <Button
                variant={builderMode ? 'contained' : 'outlined'}
                color="primary"
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
            </Stack>
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
                  {questions.filter((item) => item.active !== false).length} active
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
                  onClick={handleResetToDefaultQuestions}
                  disabled={savingQuestions}
                >
                  Reset defaults
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={handleOpenAdd}
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
                  key={q.id || q.key || idx}
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
                      <Tooltip title={q.source === 'system' ? 'Deactivate system question' : 'Delete question'}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteQuestion(idx)}
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
                onClick={handleOpenAdd}
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
              ) : <span />}

              <Button
                variant="contained"
                color="primary"
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
          <Box component="form" onSubmit={onSubmitFeedback} noValidate>
            <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 3 } }}>
              {/* Top row: host staff, visitor name, and stay duration */}
              <Grid container spacing={2}>
                {!isApiSubmission ? (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" error={Boolean(formErrors.branchId)}>
                      <InputLabel id="visitor-branch-select-label">Site / Branch *</InputLabel>
                      <Select
                        labelId="visitor-branch-select-label"
                        label="Site / Branch *"
                        value={selectedBranchId}
                        onChange={(e) => {
                          setSelectedBranchId(e.target.value);
                          clearFormError('branchId');
                        }}
                      >
                        {!isOwner && assignedBranch ? (
                          <MenuItem value={assignedBranch.id}>
                            {assignedBranch.name || 'Current Site'} (Assigned)
                          </MenuItem>
                        ) : (
                          branches.map((branch) => (
                            <MenuItem key={branch._id} value={branch._id}>
                              {branch.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {formErrors.branchId && (
                        <FormHelperText error>{formErrors.branchId}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                ) : (
                  <Grid item xs={12} sm={4}>
                    <InfiniteAutocomplete
                      key={`${organizationId || 'no-organization'}-${staffBranchId || 'all-sites'}`}
                      value={selectedHostStaff}
                      onChange={(staff) => {
                        setSelectedHostStaff(staff);
                        clearFormError('hostStaffId');
                        clearFormError('branchId');
                      }}
                      useQuery={useGetStaffProfilesQuery}
                      queryArgs={staffQueryArgs}
                      mapOption={mapVisitorStaffOption}
                      enabled={Boolean(organizationId && (isOwner || staffBranchId))}
                      label="Host staff *"
                      placeholder="Search host staff..."
                      disabled={!organizationId || (!isOwner && !staffBranchId)}
                      error={Boolean(formErrors.hostStaffId)}
                      helperText={formErrors.hostStaffId}
                      fullWidth
                      size="small"
                      textFieldProps={{
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify
                                icon="solar:user-id-bold-duotone"
                                width={20}
                                sx={{ color: 'primary.main' }}
                              />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                )}

                <Grid item xs={12} sm={isApiSubmission ? 4 : 6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Visitor name"
                    value={visitorName}
                    onChange={(e) => {
                      setVisitorName(e.target.value);
                      clearFormError('visitorName');
                    }}
                    error={Boolean(formErrors.visitorName)}
                    helperText={formErrors.visitorName}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={isApiSubmission ? 4 : 6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Stay duration"
                    placeholder="e.g. 45"
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value.replace(/[^0-9]/g, ''));
                      clearFormError('duration');
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    error={Boolean(formErrors.duration)}
                    helperText={formErrors.duration || 'Enter duration in minutes.'}
                    required
                  />
                </Grid>
              </Grid>

              {/* Dynamic Questions List */}
              {formQuestions.map((q, idx) => {
                const currentAnswer = answers[q.id] ?? '';
                const isOtherSelected =
                  String(currentAnswer).toLowerCase() === 'other' ||
                  (String(currentAnswer).toLowerCase().includes('other') && q.hasOtherOption);

                return (
                  <Stack key={q.id || idx} spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {idx + 1}. {q.prompt || q.title} {q.required && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}
                    </Typography>

                    {/* 1. Multiple choice (Radio) */}
                    {q.type === 'yesNo' && (
                      <FormControl error={Boolean(formErrors[q.id])} component="fieldset">
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
                        {formErrors[q.id] && (
                          <FormHelperText error sx={{ mx: 0 }}>
                            {formErrors[q.id]}
                          </FormHelperText>
                        )}

                        {!isApiSubmission && (
                          <Collapse in={isOtherSelected} timeout="auto" unmountOnExit>
                            <TextField
                              size="small"
                              fullWidth
                              label="Please explain"
                              placeholder="Explain your answer..."
                              value={otherExplanations[q.id] || ''}
                              onChange={(e) => handleOtherExplanationChange(q.id, e.target.value)}
                              error={Boolean(formErrors[`${q.id}_other`])}
                              helperText={formErrors[`${q.id}_other`]}
                              sx={{ mt: 1 }}
                            />
                          </Collapse>
                        )}
                      </FormControl>
                    )}

                    {/* 2. Dropdown selection */}
                    {q.type === 'singleSelect' && (
                      <>
                        <FormControl fullWidth size="small" error={Boolean(formErrors[q.id])}>
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
                          {formErrors[q.id] && (
                            <FormHelperText error>{formErrors[q.id]}</FormHelperText>
                          )}
                        </FormControl>

                        {!isApiSubmission && (
                          <Collapse in={isOtherSelected} timeout="auto" unmountOnExit>
                            <TextField
                              size="small"
                              fullWidth
                              label="Please specify details"
                              placeholder="Provide additional details..."
                              value={otherExplanations[q.id] || ''}
                              onChange={(e) => handleOtherExplanationChange(q.id, e.target.value)}
                              error={Boolean(formErrors[`${q.id}_other`])}
                              helperText={formErrors[`${q.id}_other`]}
                              sx={{ mt: 1 }}
                            />
                          </Collapse>
                        )}
                      </>
                    )}

                    {/* 3. Star rating */}
                    {q.type === 'rating' && (
                      <FormControl error={Boolean(formErrors[q.id])}>
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
                        {formErrors[q.id] && (
                          <FormHelperText error sx={{ mx: 0 }}>
                            {formErrors[q.id]}
                          </FormHelperText>
                        )}
                      </FormControl>
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
                        error={Boolean(formErrors[q.id])}
                        helperText={formErrors[q.id]}
                      />
                    )}
                  </Stack>
                );
              })}

              <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

              <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center">
                <Button
                  variant="text"
                  color="primary"
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
                    color="primary"
                    size="small"
                    loading={isSubmitting || Boolean(submittingFeedback)}
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
        saving={savingQuestions}
      />
    </Stack>
  );
}

export default VisitorSurveySettings;

VisitorSurveySettings.propTypes = {
  settings: PropTypes.object,
  questions: PropTypes.array,
  loading: PropTypes.bool,
  errorMessage: PropTypes.string,
  canEdit: PropTypes.bool,
  onSave: PropTypes.func,
  onSaveQuestions: PropTypes.func,
  onSubmitFeedback: PropTypes.func,
  onRetry: PropTypes.func,
  saving: PropTypes.bool,
  savingQuestions: PropTypes.bool,
  submittingFeedback: PropTypes.bool,
};
