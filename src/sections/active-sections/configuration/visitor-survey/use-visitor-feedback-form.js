import { useEffect, useMemo, useState } from 'react';

import { toast } from 'src/components/snackbar';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { getAssignedBranch } from 'src/sections/org-rollup/utils';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { addMockVisitorFeedbackResponse } from '../mocks/data';
import { ALL_SITES_OPTION } from './visitor-survey-constants';

// ----------------------------------------------------------------------

export function useVisitorFeedbackForm({
  questions = [],
  formQuestions = [],
  onSubmitFeedbackProp,
}) {
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

  // Selected Branch and Host Staff
  const [selectedBranchId, setSelectedBranchId] = useState(() => assignedBranch?.id || '');
  const [selectedOwnerSite, setSelectedOwnerSite] = useState(ALL_SITES_OPTION);
  const [selectedHostStaff, setSelectedHostStaff] = useState(null);

  const staffBranchId = isOwner
    ? selectedOwnerSite.value === 'all'
      ? undefined
      : selectedOwnerSite.value
    : assignedBranch?.id;

  const staffQueryArgs = useMemo(
    () => ({
      organizationId,
      ...(staffBranchId ? { branchId: staffBranchId } : {}),
    }),
    [organizationId, staffBranchId]
  );

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
    questions?.forEach((q) => {
      initial[q.id] = '';
    });
    return initial;
  });
  const [otherExplanations, setOtherExplanations] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedHostStaff(null);
  }, [staffBranchId]);

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

  const clearFormError = (field) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

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
    if (e && e.preventDefault) e.preventDefault();

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
      return false;
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
          return true;
        }
      } else {
        addMockVisitorFeedbackResponse(legacyPayload);
        handleClearFeedbackForm();
        toast.success('Visitor feedback logged successfully!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to log visitor feedback:', error);
      toast.error(error?.data?.message || error?.message || 'Something went wrong. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    organizationId,
    isOwner,
    isApiSubmission,
    assignedBranch,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    selectedOwnerSite,
    setSelectedOwnerSite,
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
  };
}

