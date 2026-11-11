import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import {
  EMPTY_VISITOR_SURVEY_SETTINGS,
  resetQuestionsToSystemDefaults,
} from './visitor-survey-mappers';
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
  onSave,
  onSaveQuestions,
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

      {/* 2. Visitor Survey Questions Card */}
      <Card>
        <CardHeader
          title="Visitor survey questions"
          subheader={
            builderMode
              ? 'Customize questions, create custom MCQs with options, and configure answer types'
              : 'Questions presented to visitors during checkout'
          }
          action={
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
              {builderMode ? 'View Questions' : `Customize Questions (${questions.length})`}
            </Button>
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
            formQuestions={formQuestions}
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
  onRetry: PropTypes.func,
  saving: PropTypes.bool,
  savingQuestions: PropTypes.bool,
};

export default VisitorSurveySettings;
