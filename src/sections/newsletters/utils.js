import dayjs from 'dayjs';

export const NEWSLETTER_STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'primary', countKey: 'all' },
  { value: 'draft', label: 'Draft', color: 'default', countKey: 'draft' },
  { value: 'scheduled', label: 'Scheduled', color: 'warning', countKey: 'scheduled' },
  { value: 'sending', label: 'Sending', color: 'info', countKey: 'sending' },
  { value: 'sent', label: 'Sent', color: 'success', countKey: 'sent' },
];

export const NEWSLETTER_SECTION_OPTIONS = [
  { key: 'welcome', label: 'Welcome from the manager' },
  { key: 'highlights', label: 'Highlights' },
  { key: 'comingUp', label: 'Coming up' },
  { key: 'notices', label: 'Notices' },
  { key: 'newResidents', label: 'New residents' },
  { key: 'gallery', label: 'Photo gallery' },
];

export function getAllowedNewsletterMonths() {
  const current = dayjs();
  const previous = current.subtract(1, 'month');

  return [
    { value: current.format('YYYY-MM'), label: current.format('MMMM YYYY') },
    { value: previous.format('YYYY-MM'), label: previous.format('MMMM YYYY') },
  ];
}

export function getNewsletterId(item) {
  return item?.newsletterId || item?._id || '';
}

export function canDeleteNewsletter(status) {
  return status !== 'sent';
}

export function canCancelNewsletter(status) {
  return status === 'scheduled';
}

export function getNewsletterStatusColor(status) {
  if (status === 'sent') return 'success';
  if (status === 'scheduled') return 'warning';
  if (status === 'sending') return 'info';
  return 'default';
}

export function toDateInput(value) {
  if (!value) return '';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '';
}

export function emptyNewsletterForm() {
  return {
    title: '',
    template: 'classic',
    sections: {
      welcome: true,
      highlights: true,
      comingUp: true,
      notices: true,
      newResidents: true,
      gallery: true,
    },
    welcome: { text: '', signedBy: '' },
    highlights: [],
    comingUp: [],
    notices: [],
    newResidents: [],
    gallery: [],
    footer: { homeName: '', address: '', phone: '', email: '' },
    delivery: { inApp: false, email: false, pdf: false },
  };
}

export function hydrateNewsletterForm(detail) {
  const defaults = emptyNewsletterForm();
  if (!detail) return defaults;

  return {
    title: detail.title || defaults.title,
    template: detail.template || 'classic',
    sections: { ...defaults.sections, ...(detail.sections || {}) },
    welcome: {
      text: detail.welcome?.text || '',
      signedBy: detail.welcome?.signedBy || '',
    },
    highlights: Array.isArray(detail.highlights) ? detail.highlights : [],
    comingUp: Array.isArray(detail.comingUp) ? detail.comingUp : [],
    notices: Array.isArray(detail.notices) ? detail.notices : [],
    newResidents: Array.isArray(detail.newResidents) ? detail.newResidents : [],
    gallery: Array.isArray(detail.gallery) ? detail.gallery : [],
    footer: {
      homeName: detail.footer?.homeName || detail.homeName || '',
      address: detail.footer?.address || '',
      phone: detail.footer?.phone || '',
      email: detail.footer?.email || '',
    },
    delivery: {
      inApp: Boolean(detail.delivery?.inApp),
      email: Boolean(detail.delivery?.email),
      pdf: Boolean(detail.delivery?.pdf),
    },
  };
}

function isBlank(value) {
  return !String(value || '').trim();
}

export function isIncompleteNotice(item) {
  return isBlank(item?.title) || isBlank(item?.body);
}

export function isIncompleteEvent(item) {
  return isBlank(toDateInput(item?.date)) || isBlank(item?.time) || isBlank(item?.title);
}

export function validateNewsletterForm(form) {
  const errors = { notices: {}, comingUp: {} };

  if (isBlank(form?.title)) {
    return { valid: false, message: 'Please enter a newsletter title', errors: { ...errors, title: true } };
  }

  if (form?.sections?.comingUp) {
    (form.comingUp || []).forEach((item, index) => {
      if (!isIncompleteEvent(item)) return;
      errors.comingUp[index] = {
        date: isBlank(toDateInput(item?.date)),
        time: isBlank(item?.time),
        title: isBlank(item?.title),
      };
    });

    const firstInvalid = Object.keys(errors.comingUp)[0];
    if (firstInvalid != null) {
      return {
        valid: false,
        message: `Please fill date, time and title for event ${Number(firstInvalid) + 1}`,
        errors,
      };
    }
  }

  if (form?.sections?.notices) {
    (form.notices || []).forEach((item, index) => {
      if (!isIncompleteNotice(item)) return;
      errors.notices[index] = {
        title: isBlank(item?.title),
        body: isBlank(item?.body),
      };
    });

    const firstInvalid = Object.keys(errors.notices)[0];
    if (firstInvalid != null) {
      return {
        valid: false,
        message: `Please fill title and body for notice ${Number(firstInvalid) + 1}`,
        errors,
      };
    }
  }

  return { valid: true, message: '', errors };
}

export function buildNewsletterUpdatePayload(form) {
  return {
    title: form.title,
    template: form.template || 'classic',
    sections: form.sections,
    welcome: {
      text: form.welcome?.text || '',
      signedBy: form.welcome?.signedBy || '',
    },
    highlights: (form.highlights || []).map((item) => ({
      postId: item.postId,
      title: item.title || '',
      text: item.text || '',
      mediaId: item.mediaId,
    })),
    comingUp: (form.comingUp || []).map((item) => ({
      date: toDateInput(item.date),
      time: item.time || '',
      title: item.title || '',
      description: item.description || '',
      category: item.category || '',
    })),
    notices: (form.notices || []).map((item) => ({
      title: item.title || '',
      body: item.body || '',
    })),
    newResidentIds: (form.newResidents || [])
      .map((item) => item.residentId || item.value)
      .filter(Boolean),
    gallery: (form.gallery || []).map((item) => ({
      mediaId: item.mediaId,
      caption: item.caption || '',
    })),
    footer: {
      homeName: form.footer?.homeName || '',
      address: form.footer?.address || '',
      phone: form.footer?.phone || '',
      email: form.footer?.email || '',
    },
    delivery: {
      inApp: Boolean(form.delivery?.inApp),
      email: Boolean(form.delivery?.email),
      pdf: Boolean(form.delivery?.pdf),
    },
  };
}
