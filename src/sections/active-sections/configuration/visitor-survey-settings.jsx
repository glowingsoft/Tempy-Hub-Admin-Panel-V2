import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { toast } from 'src/components/snackbar';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import {
  EMPTY_VISITOR_SURVEY_SETTINGS,
  resetQuestionsToSystemDefaults,
} from './visitor-survey-mappers';
import {
  ALL_SITES_OPTION,
  mapVisitorBranchOption,
} from './visitor-survey/visitor-survey-constants';
import { useVisitorFeedbackForm } from './visitor-survey/use-visitor-feedback-form';
import { VisitorSurveyNotificationsCard } from './visitor-survey/visitor-survey-notifications';
import { VisitorSurveyQuestionBuilder } from './visitor-survey/visitor-survey-question-builder';
import { VisitorSurveyFeedbackForm } from './visitor-survey/visitor-survey-feedback-form';
import { QuestionEditorDialog } from './visitor-survey/visitor-survey-question-dialog';
import { VisitorSurveySkeleton } from './visitor-survey/visitor-survey-skeleton';

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
  const [questions, setQuestions] = useState(() => questionsProp || []);
  const [builderMode, setBuilderMode] = useState(false);
  const [editorDialog, setEditorDialog] = useState({ open: false, index: null, question: null });

  const lastSurveyErrorRef = useRef(null);
  useEffect(() => {
    if (errorMessage && errorMessage !== 'No organization selected') {
      if (lastSurveyErrorRef.current !== errorMessage) {
        lastSurveyErrorRef.current = errorMessage;
        toast.error(errorMessage);
      }
    }
  }, [errorMessage]);

  useEffect(() => {
    setState(settings || EMPTY_VISITOR_SURVEY_SETTINGS);
  }, [settings]);

  useEffect(() => {
    setQuestions(Array.isArray(questionsProp) ? questionsProp : []);
  }, [questionsProp]);

  // Question operations
  const persistQuestions = async (nextQuestions, successMessage) => {
    setQuestions(nextQuestions);
    const ok = await onSaveQuestions?.(nextQuestions);
    if (ok !== false) {
      if (successMessage) toast.success(successMessage);
      return true;
    }
    setQuestions(Array.isArray(questionsProp) ? questionsProp : []);
    return false;
  };

  const handleOpenAdd = () => {
    setEditorDialog({ open: true, index: null, question: null });
  };

  const handleOpenEdit = (q, index) => {
    setEditorDialog({ open: true, index, question: q });
  };

  const handleCloseEditor = () => {
    setEditorDialog((prev) => ({ ...prev, open: false }));
  };

  const handleExitedEditor = () => {
    setEditorDialog({ open: false, index: null, question: null });
  };

  const handleSaveQuestion = async (questionData) => {
    let nextQuestions;
    let successMessage;
    const targetIndex =
      editorDialog.index !== null && editorDialog.index !== undefined
        ? editorDialog.index
        : questions.findIndex(
            (q) =>
              (questionData.id && q.id === questionData.id) ||
              (questionData._id && q._id === questionData._id) ||
              (questionData.key && q.key === questionData.key)
          );

    if (targetIndex >= 0) {
      nextQuestions = questions.map((item, idx) =>
        idx === targetIndex ? { ...item, ...questionData } : item
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

  // Notification settings handlers
  const handleToggleEnabled = (enabled) => {
    setState((prev) => ({ ...prev, enabled }));
  };

  const handleUpdateChannel = (key, value) => {
    setState((prev) => ({
      ...prev,
      channels: { ...prev.channels, [key]: value },
    }));
  };

  const handleUpdateRecipient = (key, value) => {
    setState((prev) => ({
      ...prev,
      recipients: { ...prev.recipients, [key]: value },
    }));
  };

  const handleUpdateInclude = (key, value) => {
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

  // Questions for preview/logging
  const visibleQuestions = questions.filter((q) => q.active !== false);
  const formQuestions = builderMode ? questions : visibleQuestions;

  // Feedback form controller hook
  const formController = useVisitorFeedbackForm({
    questions,
    formQuestions,
    onSubmitFeedbackProp,
  });

  if (loading) {
    return <VisitorSurveySkeleton />;
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
      <VisitorSurveyNotificationsCard
        state={state}
        canEdit={canEdit}
        saving={saving}
        onToggleEnabled={handleToggleEnabled}
        onUpdateChannel={handleUpdateChannel}
        onUpdateRecipient={handleUpdateRecipient}
        onUpdateInclude={handleUpdateInclude}
        onReset={handleResetSettings}
        onSave={handleSaveSettings}
      />

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
              {formController.isApiSubmission && formController.isOwner && (
                <InfiniteAutocomplete
                  value={formController.selectedOwnerSite}
                  onChange={(site) => {
                    const nextSite = site || ALL_SITES_OPTION;
                    formController.setSelectedOwnerSite(nextSite);
                    formController.setSelectedHostStaff(null);
                    formController.clearFormError('branchId');
                    formController.clearFormError('hostStaffId');
                  }}
                  useQuery={useGetBranchesQuery}
                  queryArgs={{ organizationId: formController.organizationId }}
                  mapOption={mapVisitorBranchOption}
                  extraOptions={[ALL_SITES_OPTION]}
                  label="Site"
                  placeholder="All sites"
                  disabled={!formController.organizationId}
                  disableClearable
                  size="small"
                  sx={{ minWidth: { xs: 220, sm: 200 } }}
                  error={Boolean(formController.formErrors.branchId)}
                  helperText={formController.formErrors.branchId}
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
          <VisitorSurveyQuestionBuilder
            questions={questions}
            canEdit={canEdit}
            savingQuestions={savingQuestions}
            onResetDefaults={handleResetToDefaultQuestions}
            onOpenAdd={handleOpenAdd}
            onOpenEdit={handleOpenEdit}
            onDeleteQuestion={handleDeleteQuestion}
            onMoveQuestion={handleMoveQuestion}
            onDone={() => setBuilderMode(false)}
          />
        ) : (
          <VisitorSurveyFeedbackForm
            formController={formController}
            formQuestions={formQuestions}
            submittingFeedback={submittingFeedback}
            onSwitchToBuilder={() => setBuilderMode(true)}
          />
        )}
      </Card>

      {/* Question Editor Dialog */}
      <QuestionEditorDialog
        open={editorDialog.open}
        question={editorDialog.question}
        onSave={handleSaveQuestion}
        onClose={handleCloseEditor}
        onExited={handleExitedEditor}
        saving={savingQuestions}
      />
    </Stack>
  );
}

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

export default VisitorSurveySettings;
