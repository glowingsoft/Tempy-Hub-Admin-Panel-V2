const LEGACY_UI_TO_API_TYPE = {
  radio: 'yesNo',
  select: 'singleSelect',
};

export const QUESTION_API_TYPES = ['yesNo', 'singleSelect', 'rating', 'text'];

export function toApiQuestionType(type) {
  if (LEGACY_UI_TO_API_TYPE[type]) return LEGACY_UI_TO_API_TYPE[type];
  if (QUESTION_API_TYPES.includes(type)) return type;
  return 'text';
}

export function isChoiceQuestionType(type) {
  const apiType = toApiQuestionType(type);
  return apiType === 'yesNo' || apiType === 'singleSelect';
}

export const EMPTY_VISITOR_SURVEY_SETTINGS = {
  enabled: false,
  channels: { email: true, inApp: true },
  recipients: { siteManager: true, lineManager: false },
  includes: {
    feedbackRating: true,
    visitDuration: true,
    whoVisited: true,
    freeTextComments: true,
  },
};

const flag = (value, fallback) => (value === undefined ? fallback : Boolean(value));

export function mapSettingsFromApi(api) {
  const defaults = EMPTY_VISITOR_SURVEY_SETTINGS;
  if (!api || typeof api !== 'object') return { ...defaults, channels: { ...defaults.channels }, recipients: { ...defaults.recipients }, includes: { ...defaults.includes } };

  return {
    enabled: flag(api.enabled, defaults.enabled),
    channels: {
      email: flag(api.notifyVia?.email, defaults.channels.email),
      inApp: flag(api.notifyVia?.inApp, defaults.channels.inApp),
    },
    recipients: {
      siteManager: flag(api.recipients?.siteManager, defaults.recipients.siteManager),
      lineManager: flag(api.recipients?.lineManager, defaults.recipients.lineManager),
    },
    includes: {
      feedbackRating: flag(api.include?.ratingSummary, defaults.includes.feedbackRating),
      visitDuration: flag(api.include?.visitDuration, defaults.includes.visitDuration),
      whoVisited: flag(api.include?.whoTheyVisited, defaults.includes.whoVisited),
      freeTextComments: flag(api.include?.freeText, defaults.includes.freeTextComments),
    },
  };
}

export function mapSettingsToApi(ui) {
  const source = ui || EMPTY_VISITOR_SURVEY_SETTINGS;
  return {
    enabled: Boolean(source.enabled),
    notifyVia: {
      email: Boolean(source.channels?.email),
      inApp: Boolean(source.channels?.inApp),
    },
    recipients: {
      siteManager: Boolean(source.recipients?.siteManager),
      lineManager: Boolean(source.recipients?.lineManager),
    },
    include: {
      ratingSummary: Boolean(source.includes?.feedbackRating),
      visitDuration: Boolean(source.includes?.visitDuration),
      whoTheyVisited: Boolean(source.includes?.whoVisited),
      freeText: Boolean(source.includes?.freeTextComments),
    },
  };
}

function slugKey(value, index) {
  const raw = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return raw || `question_${index + 1}`;
}

export function mapQuestionFromApi(question) {
  const options = Array.isArray(question?.options) ? question.options : [];
  const type = toApiQuestionType(question?.type);
  const id = question?._id || question?.key;

  return {
    id,
    _id: question?._id,
    key: question?.key,
    title: question?.prompt || '',
    prompt: question?.prompt || '',
    type,
    options,
    hasOtherOption: options.some((opt) => String(opt).toLowerCase() === 'other'),
    required: Boolean(question?.required),
    sortOrder: question?.sortOrder ?? 0,
    active: question?.active !== false,
    source: question?.source || 'custom',
  };
}

export const SYSTEM_SURVEY_QUESTIONS = [
  {
    key: 'expectedVisit',
    prompt: 'Was your visit for the reason you expected?',
    type: 'yesNo',
    options: ['Yes', 'No', 'Other'],
    required: true,
    sortOrder: 1,
    active: true,
    source: 'system',
  },
  {
    key: 'whoVisited',
    prompt: 'Who did you visit today?',
    type: 'singleSelect',
    options: ['Resident / Family member'],
    required: true,
    sortOrder: 2,
    active: true,
    source: 'system',
  },
  {
    key: 'rating',
    prompt: 'How would you rate your visit overall?',
    type: 'rating',
    options: [],
    required: true,
    sortOrder: 3,
    active: true,
    source: 'system',
  },
  {
    key: 'comments',
    prompt: "Any comment you'd like to share?",
    type: 'text',
    options: [],
    required: false,
    sortOrder: 4,
    active: true,
    source: 'system',
  },
];

export function mapQuestionsFromApi(questions) {
  const list = Array.isArray(questions)
    ? questions
    : Array.isArray(questions?.questions)
      ? questions.questions
      : [];
  return list
    .map(mapQuestionFromApi)
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
}

export function resetQuestionsToSystemDefaults(current) {
  const byKey = new Map((Array.isArray(current) ? current : []).map((row) => [row.key, row]));
  return SYSTEM_SURVEY_QUESTIONS.map((row) => {
    const existing = byKey.get(row.key);
    return {
      ...row,
      id: existing?._id || existing?.id || row.key,
      _id: existing?._id,
      title: row.prompt,
      hasOtherOption: row.options.some((opt) => String(opt).toLowerCase() === 'other'),
    };
  });
}

export function mapQuestionToApi(question, index) {
  const type = toApiQuestionType(question?.type);
  let options = isChoiceQuestionType(type)
    ? (Array.isArray(question?.options) ? question.options : [])
        .map((opt) => String(opt).trim())
        .filter(Boolean)
    : [];

  if (isChoiceQuestionType(type) && question?.hasOtherOption) {
    const hasOther = options.some((opt) => opt.toLowerCase() === 'other');
    if (!hasOther) options = [...options, 'Other'];
  }

  const payload = {
    key: question?.key || slugKey(question?.title || question?.prompt, index),
    prompt: String(question?.prompt || question?.title || '').trim(),
    type,
    options,
    required: Boolean(question?.required),
    sortOrder: question?.sortOrder == null ? index + 1 : Number(question.sortOrder) || index + 1,
    active: question?.active !== false,
  };

  if (question?._id) payload._id = question._id;
  return payload;
}

export function mapQuestionsToApi(questions) {
  return (Array.isArray(questions) ? questions : []).map((question, index) =>
    mapQuestionToApi(question, index)
  );
}

export function mutationErrorMessage(error, fallback) {
  return (
    error?.data?.message ||
    error?.data?.msg ||
    error?.data?.error ||
    error?.error ||
    error?.message ||
    fallback
  );
}

export function isForbiddenError(error) {
  return Number(error?.status) === 403;
}
