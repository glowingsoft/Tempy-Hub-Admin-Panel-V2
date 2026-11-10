import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { isChoiceQuestionType } from '../visitor-survey-mappers';
import { QUESTION_TYPES, QUICK_PRESETS } from './visitor-survey-constants';

// ----------------------------------------------------------------------

export function QuestionEditorDialog({ open, question, onSave, onClose, onExited, saving }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('yesNo');
  const [options, setOptions] = useState([]);
  const [newOptionText, setNewOptionText] = useState('');
  const [hasOtherOption, setHasOtherOption] = useState(false);
  const [required, setRequired] = useState(false);
  const [active, setActive] = useState(true);
  const [keyValue, setKeyValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Cache editing state so it does not flicker/switch back to 'Add' during closing exit transition
  const [cachedIsEdit, setCachedIsEdit] = useState(false);
  const isEdit = open ? Boolean(question) : cachedIsEdit;

  useEffect(() => {
    if (!open) return;

    setCachedIsEdit(Boolean(question));

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
    toast.info('Applied preset choices');
  };

  const handleSave = async () => {
    if (isSaving || saving) return;

    if (!title.trim()) {
      toast.error('Question prompt is required');
      return;
    }

    let finalOptions = isChoiceQuestionType(type) ? [...options] : [];
    const pendingOption = newOptionText.trim();
    if (
      isChoiceQuestionType(type) &&
      pendingOption &&
      !finalOptions.some((opt) => opt.toLowerCase() === pendingOption.toLowerCase())
    ) {
      finalOptions.push(pendingOption);
    }

    if (isChoiceQuestionType(type) && finalOptions.filter((opt) => String(opt).trim()).length === 0) {
      toast.error('Please add at least one choice for this question');
      return;
    }

    setIsSaving(true);
    try {
      const result = await onSave({
        id: question?.id,
        _id: question?._id,
        key: keyValue.trim() || question?.key,
        source: question?.source || 'custom',
        title: title.trim(),
        prompt: title.trim(),
        type,
        options: isChoiceQuestionType(type) ? finalOptions : [],
        hasOtherOption: isChoiceQuestionType(type) ? hasOtherOption : false,
        required,
        active,
        sortOrder: question?.sortOrder,
      });
      if (result !== false) {
        onClose();
      }
    } catch (err) {
      console.error('Error saving question:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionProps={{
        onExited,
      }}
    >
      <DialogTitle sx={{ pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{isEdit ? 'Edit Survey Question' : 'Add Survey Question'}</span>
        <IconButton size="small" onClick={onClose} disabled={isSaving || Boolean(saving)}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { md: 'repeat(1, 1fr)', xs: 'repeat(1, 1fr)' },
            mt: 3,
          }}
        >
          {/* Question Prompt */}
          <TextField
            fullWidth
            label="Question Prompt"
            placeholder="e.g. How satisfied are you with the facility cleanliness?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          {/* Question Type Select Dropdown */}
          <TextField
            select
            fullWidth
            label="Question Type"
            value={type}
            onChange={(e) => handleSelectType(e.target.value)}
          >
            {QUESTION_TYPES.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Iconify icon={item.icon} width={18} sx={{ color: 'text.secondary' }} />
                  <span>{item.label}</span>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          {/* MCQ Choices List (when choice type) */}
          {isChoiceQuestionType(type) && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                p: 2,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.neutral',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Answer Choices ({options.length})
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Presets:</Typography>
                  {QUICK_PRESETS.map((preset) => (
                    <Chip
                      key={preset.label}
                      label={preset.label}
                      size="small"
                      variant="outlined"
                      onClick={() => handleApplyPreset(preset.values)}
                      sx={{ height: 22, fontSize: 11, cursor: 'pointer', bgcolor: 'background.paper' }}
                    />
                  ))}
                </Stack>
              </Box>

              <Stack spacing={1}>
                {options.map((option, idx) => (
                  <Stack key={idx} direction="row" spacing={1} alignItems="center">
                    <TextField
                      size="small"
                      fullWidth
                      label={`Choice ${idx + 1}`}
                      value={option}
                      onChange={(e) => handleEditOption(idx, e.target.value)}
                      sx={{ bgcolor: 'background.paper' }}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveOption(idx)}
                      disabled={options.length <= 1}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Add a new choice..."
                  value={newOptionText}
                  onChange={(e) => setNewOptionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  sx={{ bgcolor: 'background.paper' }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddOption}
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  Add
                </Button>
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={hasOtherOption}
                    onChange={(e) => setHasOtherOption(e.target.checked)}
                  />
                }
                label={<Typography variant="body2">Include &apos;Other&apos; choice</Typography>}
              />
            </Box>
          )}

          {/* Question Key */}
          <TextField
            fullWidth
            label="Question Key"
            placeholder="auto-generated if left blank"
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            disabled={question?.source === 'system'}
            helperText="Unique identifier for the API"
          />

          {/* Toggles */}
          <Stack direction="row" spacing={3} sx={{ mt: 0.5 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                />
              }
              label={<Typography variant="body2">Mandatory question</Typography>}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
              }
              label={<Typography variant="body2">Active in survey</Typography>}
            />
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          disabled={isSaving || Boolean(saving)}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          color="primary"
          onClick={handleSave}
          loading={isSaving || Boolean(saving)}
          disabled={isSaving || Boolean(saving)}
        >
          {isEdit ? 'Update Question' : 'Add Question'}
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
  onExited: PropTypes.func,
  saving: PropTypes.bool,
};

export default QuestionEditorDialog;
