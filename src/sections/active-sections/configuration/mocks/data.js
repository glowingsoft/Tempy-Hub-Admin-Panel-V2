export const mockCategories = [
  {
    _id: 'cat-1',
    name: 'Full-time staff',
    description: 'Standard clock-in flow',
    parentCategory: 'staff',
    color: '#161C24',
    order: 1,
    status: 'active',
  },
  {
    _id: 'cat-2',
    name: 'Contractor',
    description: 'Requires ID and site induction',
    parentCategory: 'staff',
    color: '#FF5630',
    order: 2,
    status: 'inactive',
  },
  {
    _id: 'cat-3',
    name: 'Agency staff',
    description: 'Archived category',
    parentCategory: 'staff',
    color: '#22C55E',
    order: 3,
    status: 'active',
  },
  {
    _id: 'cat-4',
    name: 'Visitor',
    description: 'Kiosk sign-in only',
    parentCategory: 'visitor',
    color: '#8E33FF',
    order: 4,
    status: 'active',
  },
  {
    _id: 'cat-5',
    name: 'Guest',
    description: 'Kiosk sign-in only',
    parentCategory: 'visitor',
    color: '#FF5630',
    order: 5,
    status: "active"
  },
  {
    _id: 'cat-6',
    name: 'Temporary visitor',
    description: 'Kiosk sign-in only',
    parentCategory: 'visitor',
    color: '#F59E0B',
    order: 6,
    status: "active"
  }
];


export const LINK_TYPE_OPTIONS = [
  { value: 'url', label: 'URL' },
  { value: 'check_in', label: 'Check-in' },
  { value: 'form', label: 'Form' },
];

// mocks/kiosk-branding-mock.js

export const KIOSK_CONTENT_TYPES = [
  {
    value: 'image',
    label: 'Image',
    icon: 'solar:gallery-bold',
  },
  {
    value: 'qr',
    label: 'QR Code',
    icon: 'solar:qr-code-bold',
  },
  {
    value: 'text',
    label: 'Text',
    icon: 'solar:text-bold',
  },
  {
    value: 'link',
    label: 'Link',
    icon: 'solar:link-bold',
  },
];

export const DEFAULT_KIOSK_SCREENS = [
  {
    id: 1,
    name: 'Widget 1',
    type: 'image',
    value: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLYebulkwdHy9NVTPkZgkdDbQX--jLU5MWCAk7VLjEB0Mpou4oq_WgC3Q&s=10',
  },
  {
    id: 2,
    name: 'Widget 2',
    type: 'qr',
    value: 'https://img.magnific.com/free-vector/scan-me-qr-code_78370-9714.jpg?semt=ais_hybrid&w=740&q=80',
  },
  {
    id: 3,
    name: 'Widget 3',
    type: 'text',
    value: 'Welcome to Agnes and Arthur',
  },
];

export const DEFAULT_CHECKOUT_WIDGET = {
  type: 'qr',
  value: 'https://forms.google.com/checkout-survey-agnes-arthur',
  caption: 'Scan to tell us about your visit',
  showToVisitors: true,
  showToEmployees: false,
};

export const KIOSK_SITE_SCOPES = [
  {
    id: 'agnes',
    name: 'Agnes and Arthur',
    kiosks: [
      { value: 'all', label: 'All kiosks at this site (default)' },
      { value: 'main', label: 'Main Entrance kiosk only' },
      { value: 'side', label: 'Side Entrance kiosk only' },
      { value: 'new', label: '+ Configure a new kiosk override…' },
    ],
  },
  {
    id: 'florence',
    name: 'Florence House',
    kiosks: [
      { value: 'all', label: 'All kiosks at this site (default)' },
      { value: 'main', label: 'Main Entrance kiosk only' },
      { value: 'new', label: '+ Configure a new kiosk override…' },
    ],
  },
  {
    id: 'hanley',
    name: 'The Place up Hanley',
    kiosks: [
      { value: 'all', label: 'All kiosks at this site (default)' },
      { value: 'main', label: 'Main Entrance kiosk only' },
      { value: 'new', label: '+ Configure a new kiosk override…' },
    ],
  },
  {
    id: 'safeharbor',
    name: 'Safe Harbor',
    kiosks: [
      { value: 'all', label: 'Only kiosk at this site (default)' },
      { value: 'new', label: '+ Register a kiosk for this site…' },
    ],
  },
];

// ----------------------------------------------------------------------
// Visitor survey notification preferences — shared by Site Manager
// (Configuration) and Line Manager (Client Feedback) views, since both
// roles can act on the same underlying setting.
// TODO: replace with a real API/RTK Query slice once the endpoint exists.
// ----------------------------------------------------------------------

export const DEFAULT_VISITOR_SURVEY_SETTINGS = {
  enabled: true,
  channels: {
    email: true,
    inApp: true,
  },
  recipients: {
    siteManager: true,
    lineManager: false,
  },
  includes: {
    feedbackRating: true,
    visitDuration: true,
    whoVisited: true,
    freeTextComments: true,
  },
};

export const MOCK_VISITOR_FEEDBACK_RESPONSES = [
  {
    id: 1,
    visitorName: 'Priya Nair',
    site: 'Willow House',
    host: 'Sana Yousuf',
    duration: '52m',
    rating: 5,
    comment: 'Lovely visit, staff were very welcoming and mum was in great spirits.',
    submitted: '21 Sep 2026',
  },
  {
    id: 2,
    visitorName: 'Tom Alder',
    site: 'Rosewood Court',
    host: 'Bilal Ahmed',
    duration: '25m',
    rating: 3,
    comment: 'Had to wait a while at reception before someone could sign me in.',
    submitted: '19 Sep 2026',
  },
];

export function saveMockVisitorSurveySettings(next) {
  Object.assign(DEFAULT_VISITOR_SURVEY_SETTINGS, next, {
    channels: { ...DEFAULT_VISITOR_SURVEY_SETTINGS.channels, ...next.channels },
    recipients: { ...DEFAULT_VISITOR_SURVEY_SETTINGS.recipients, ...next.recipients },
    includes: { ...DEFAULT_VISITOR_SURVEY_SETTINGS.includes, ...next.includes },
  });
  return DEFAULT_VISITOR_SURVEY_SETTINGS;
}

export const DEFAULT_SURVEY_QUESTIONS = [
  {
    id: 'q-expected-reason',
    title: 'Was your visit for the reason you expected?',
    type: 'radio',
    options: ['Yes', 'No', 'Other'],
    hasOtherOption: true,
    required: true,
  },
  {
    id: 'q-who-visited',
    title: 'Who did you visit today?',
    type: 'select',
    options: [
      '1. Resident / Family member',
      '2. Staff member / Caregiver',
      '3. Management / Administration',
      '4. Healthcare Professional / Contractor',
      'Other',
    ],
    hasOtherOption: true,
    required: true,
  },
  {
    id: 'q-rating',
    title: 'How would you rate your visit overall?',
    type: 'rating',
    options: [],
    hasOtherOption: false,
    required: true,
  },
  {
    id: 'q-comment',
    title: "Any comment you'd like to share?",
    type: 'text',
    options: [],
    hasOtherOption: false,
    required: false,
    placeholder: 'Share any additional comments or feedback...',
  },
];

let activeSurveyQuestions = JSON.parse(JSON.stringify(DEFAULT_SURVEY_QUESTIONS));

export function getSurveyQuestions() {
  return activeSurveyQuestions;
}

export function saveSurveyQuestions(questions) {
  if (Array.isArray(questions)) {
    activeSurveyQuestions = JSON.parse(JSON.stringify(questions));
  }
  return activeSurveyQuestions;
}

export function resetSurveyQuestions() {
  activeSurveyQuestions = JSON.parse(JSON.stringify(DEFAULT_SURVEY_QUESTIONS));
  return activeSurveyQuestions;
}

export function addMockVisitorFeedbackResponse(data) {
  const {
    visitorName,
    duration,
    rating,
    comment,
    expectedReason,
    expectedReasonOther,
    whoVisited,
    whoVisitedOther,
    customAnswers = {},
  } = data || {};

  const resolvedWho = whoVisited === 'other' ? (whoVisitedOther || 'Other') : (whoVisited || customAnswers?.['q-who-visited'] || '—');
  const resolvedReason = expectedReason === 'other' ? (expectedReasonOther || 'Other') : (expectedReason || customAnswers?.['q-expected-reason'] || 'Yes');
  const resolvedRating = rating || Number(customAnswers?.['q-rating']) || 5;
  const resolvedComment = comment || customAnswers?.['q-comment'] || '';

  const entry = {
    id: MOCK_VISITOR_FEEDBACK_RESPONSES.length + 1,
    visitorName: visitorName || 'Anonymous Visitor',
    site: '—',
    host: resolvedWho,
    duration: duration || '—',
    rating: resolvedRating,
    comment: resolvedComment,
    expectedReason: resolvedReason,
    whoVisited: resolvedWho,
    customAnswers,
    submitted: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  };

  MOCK_VISITOR_FEEDBACK_RESPONSES.unshift(entry);
  return entry;
}

// ----------------------------------------------------------------------
// Clock in settings mock defaults
// ----------------------------------------------------------------------

export const DEFAULT_BREAK_RULES = [
  { minHours: 12, unpaidMinutes: 60 },
  { minHours: 6, unpaidMinutes: 30 },
];

export function formatBreakRules(rules = []) {
  if (!rules || !rules.length) return 'No unpaid break rules configured';
  return rules
    .map((rule) => {
      const hoursUnpaid = rule.unpaidMinutes / 60;
      const unpaidStr = hoursUnpaid % 1 === 0 ? `${hoursUnpaid} hr` : `${hoursUnpaid} hr`;
      return `${unpaidStr} unpaid per ${rule.minHours}-hour shift`;
    })
    .join(' · ');
}

export const DEFAULT_CLOCK_IN_SETTINGS = {
  phoneCheckIn: true,
  breakTracking: true,
  lateToleranceMinutes: 10,
  lateTolerance: '10 minutes',
  breakRules: DEFAULT_BREAK_RULES,
  unpaidBreakAllowance: '1 hr unpaid per 12-hour shift · 0.5 hr unpaid per 6-hour shift',
  autoClockOut: true,
};

// ----------------------------------------------------------------------
// External widget settings — lets a site manager embed their Tempy
// availability widget on an external site such as carehome.co.uk.
// TODO: replace with a real API/RTK Query slice once the endpoint exists.
// ----------------------------------------------------------------------

export const WIDGET_ORIENTATION_OPTIONS = [
  {
    value: 'horizontal',
    label: 'Horizontal Banner Widget',
    helperText: 'A wide banner strip, best for a page header or footer',
    icon: 'solar:gallery-wide-bold-duotone',
  },
  {
    value: 'vertical',
    label: 'Vertical Sidebar Widget',
    helperText: 'A tall panel, best for a page sidebar',
    icon: 'solar:widget-5-bold-duotone',
  },
];

export const DEFAULT_EXTERNAL_WIDGET_SETTINGS = {
  orientation: 'horizontal',
  profileUrl: '',
};

export function saveMockExternalWidgetSettings(next) {
  Object.assign(DEFAULT_EXTERNAL_WIDGET_SETTINGS, next);
  return DEFAULT_EXTERNAL_WIDGET_SETTINGS;
}

export function getExternalWidgetEmbedCode({ orientation }) {
  return `<script src="https://tempy.app/widgets/embed.js" data-layout="${orientation}"></script>`;
}

// ----------------------------------------------------------------------
// Documents uploaded to back a kiosk QR widget. Each upload is stored
// against a token, which becomes the public "/view-document/:token" link
// the QR code encodes — no login required to open it.
// TODO: replace with a real upload endpoint + object storage; the object
// URL below only resolves in this browser tab, for demo purposes.
// ----------------------------------------------------------------------

export const mockKioskDocuments = {};

export function registerMockKioskDocument(file) {
  const token = `doc-${Date.now()}-${Math.round(Math.random() * 1e4)}`;

  mockKioskDocuments[token] = {
    token,
    fileName: file.name,
    fileUrl: URL.createObjectURL(file),
    uploadedAt: new Date().toISOString(),
  };

  return token;
}

export function getMockKioskDocument(token) {
  return mockKioskDocuments[token] || null;
}