export function handleApiError(error) {
  if (!error) return 'Unknown error occurred.';

  // 1. Nested error object message: e.g. { message: "...", error: { message: "keywordOr is not defined" } }
  if (error?.data?.error?.message && typeof error.data.error.message === 'string') {
    return error.data.error.message;
  }

  // 2. Nested error string: e.g. { message: "...", error: "keywordOr is not defined" }
  if (typeof error?.data?.error === 'string') {
    return error.data.error;
  }

  // 3. Top-level message: e.g. { message: "Some thing went wrong" }
  if (error?.data?.message && typeof error.data.message === 'string') {
    return error.data.message;
  }

  // 4. Top-level msg: e.g. { msg: "Some thing went wrong" }
  if (error?.data?.msg && typeof error.data.msg === 'string') {
    return error.data.msg;
  }

  // 5. Validation errors array: e.g. { errors: [{ message: "..." }] }
  if (Array.isArray(error?.data?.errors) && error.data.errors.length > 0) {
    return error.data.errors
      .map((item) => (typeof item === 'object' ? item.message || item.msg || JSON.stringify(item) : item))
      .filter(Boolean)
      .join(', ');
  }

  // 6. Validation errors object: e.g. { errors: { email: "Required" } }
  if (error?.data?.errors && typeof error.data.errors === 'object') {
    const errorValues = Object.values(error.data.errors);
    if (errorValues.length > 0) {
      return errorValues.join(', ');
    }
  }

  // 7. Status-based standard fallbacks
  if (error.status === 401) {
    return 'Unauthorized. Please login again.';
  }
  if (error.status === 404) {
    return 'Resource not found.';
  }
  if (error.status === 500) {
    return 'Internal server error. Please try again.';
  }

  // 8. General error string fallbacks
  if (typeof error?.error === 'string') {
    return error.error;
  }
  if (typeof error?.message === 'string') {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }

  return 'An error occurred. Please try again.';
}

