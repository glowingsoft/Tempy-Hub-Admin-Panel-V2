import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Rating from '@mui/material/Rating';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { Iconify } from 'src/components/iconify';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { Label } from 'src/components/label';
import { useGetStaffProfilesQuery } from 'src/store/Reducer/staff-profiles-api';
import {
  RATING_COLORS,
  RATING_LABELS,
  mapVisitorStaffOption,
} from './visitor-survey-constants';

// ----------------------------------------------------------------------

export function VisitorSurveyFeedbackForm({
  formController,
  formQuestions = [],
  submittingFeedback = false,
  onSwitchToBuilder,
}) {
  const {
    isApiSubmission,
    isOwner,
    organizationId,
    branches,
    assignedBranch,
    selectedBranchId,
    setSelectedBranchId,
    selectedHostStaff,
    setSelectedHostStaff,
    staffBranchId,
    staffQueryArgs,
    visitorName,
    setVisitorName,
    duration,
    setDuration,
    formErrors,
    clearFormError,
    answers,
    handleAnswerChange,
    otherExplanations,
    handleOtherExplanationChange,
    isSubmitting,
    handleClearFeedbackForm,
    onSubmitFeedback,
  } = formController;

  return (
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
            <Stack key={q.id || q._id || q.key || idx} spacing={1}>
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
            onClick={onSwitchToBuilder}
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
  );
}

VisitorSurveyFeedbackForm.propTypes = {
  formController: PropTypes.object.isRequired,
  formQuestions: PropTypes.array.isRequired,
  submittingFeedback: PropTypes.bool,
  onSwitchToBuilder: PropTypes.func.isRequired,
};

