function asText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const text = value.trim();
  if (!text) {
    return '';
  }

  if (text.includes('\n')) {
    return text.split('\n')[0].replace(/^AppError:\s*/i, '').trim();
  }

  return text;
}

function isCodeLike(text) {
  if (!text) {
    return true;
  }

  return /^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)+$/.test(text);
}

function flattenValidationErrors(errors) {
  if (!errors) {
    return [];
  }

  if (typeof errors === 'string') {
    return [errors];
  }

  if (Array.isArray(errors)) {
    return errors.flatMap((item) => {
      if (typeof item === 'string') {
        return [item];
      }
      if (item && typeof item === 'object') {
        return [item.message, item.msg, item.detail].filter((value) => typeof value === 'string');
      }
      return [];
    });
  }

  if (typeof errors === 'object') {
    return Object.values(errors).flatMap((value) => flattenValidationErrors(value));
  }

  return [];
}

function collectBackendMessages(error) {
  const data = error?.data ?? error?.response?.data ?? error?.body ?? error;

  const candidates = [
    data?.message,
    data?.msg,
    data?.errorMessage,
    data?.error_message,
    data?.detail,
    typeof data?.error === 'string' ? data.error : undefined,
    ...flattenValidationErrors(data?.errors),
    data?.data?.message,
    data?.data?.msg,
    typeof data?.error?.message === 'string' ? data.error.message : undefined,
    typeof error?.error === 'string' ? error.error : undefined,
    typeof error?.message === 'string' ? error.message : undefined,
  ];

  return candidates.map(asText).filter(Boolean);
}

export function handleApiError(error) {
  if (!error) {
    return '';
  }

  const messages = collectBackendMessages(error);
  const readable = messages.find((message) => !isCodeLike(message));

  return readable || messages[0] || '';
}
