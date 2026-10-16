import { paths } from 'src/routes/paths';

const EMAIL_KEY = 'tempy-password-reset-email';
const OTP_VERIFIED_KEY = 'tempy-password-reset-otp-verified';
const RESET_TOKEN_KEY = 'tempy-password-reset-token';
const RETURN_KEY = 'tempy-password-reset-return';
const GENERATED_OTP_KEY = 'tempy-password-reset-generated-otp';
const RESEND_UNTIL_KEY = 'tempy-password-reset-resend-until';

export const RESEND_COOLDOWN_SECONDS = 30;

const ALLOWED_RETURN_PATHS = new Set([
  '/',
  paths.auth.jwt.signIn,
  paths.auth.owner.signIn,
  paths.auth.staff.signIn,
]);

function withQuery(path, params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

export function getPasswordResetEmail() {
  try {
    return window.sessionStorage.getItem(EMAIL_KEY) || '';
  } catch {
    return '';
  }
}

export function getPasswordResetReturnPath(fallback = '/') {
  try {
    const stored = window.sessionStorage.getItem(RETURN_KEY);
    if (stored && ALLOWED_RETURN_PATHS.has(stored)) {
      return stored;
    }
  } catch {
    // Ignore storage access failures.
  }

  return ALLOWED_RETURN_PATHS.has(fallback) ? fallback : '/';
}

export function rememberPasswordResetReturnPath(returnPath) {
  if (!returnPath || !ALLOWED_RETURN_PATHS.has(returnPath)) {
    return;
  }

  try {
    window.sessionStorage.setItem(RETURN_KEY, returnPath);
  } catch {
    // Ignore storage access failures.
  }
}

export function startPasswordReset(email) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    window.sessionStorage.setItem(EMAIL_KEY, normalizedEmail);
    window.sessionStorage.removeItem(OTP_VERIFIED_KEY);
    window.sessionStorage.removeItem(RESET_TOKEN_KEY);
  } catch {
    // Ignore private-mode / quota failures; query params still carry the email.
  }

  return withQuery(paths.auth.jwt.verify, { email: normalizedEmail });
}

export function markPasswordResetOtpVerified(email, resetToken) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    window.sessionStorage.setItem(EMAIL_KEY, normalizedEmail);
    window.sessionStorage.setItem(OTP_VERIFIED_KEY, 'true');
    if (resetToken) {
      window.sessionStorage.setItem(RESET_TOKEN_KEY, resetToken);
    } else {
      window.sessionStorage.removeItem(RESET_TOKEN_KEY);
    }
  } catch {
    // Ignore storage access failures.
  }

  return withQuery(paths.auth.jwt.updatePassword, { email: normalizedEmail });
}

export function getPasswordResetToken() {
  try {
    return window.sessionStorage.getItem(RESET_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function isPasswordResetOtpVerified(email) {
  const normalizedEmail = (email || '').trim().toLowerCase();

  try {
    return (
      window.sessionStorage.getItem(OTP_VERIFIED_KEY) === 'true' &&
      Boolean(window.sessionStorage.getItem(RESET_TOKEN_KEY)) &&
      window.sessionStorage.getItem(EMAIL_KEY) === normalizedEmail
    );
  } catch {
    return false;
  }
}

export function clearPasswordResetFlow() {
  try {
    window.sessionStorage.removeItem(EMAIL_KEY);
    window.sessionStorage.removeItem(OTP_VERIFIED_KEY);
    window.sessionStorage.removeItem(RESET_TOKEN_KEY);
    window.sessionStorage.removeItem(RETURN_KEY);
    window.sessionStorage.removeItem(GENERATED_OTP_KEY);
    window.sessionStorage.removeItem(RESEND_UNTIL_KEY);
  } catch {
    // Ignore storage access failures.
  }
}

export function getPasswordResetHref(returnPath = '/') {
  return withQuery(paths.auth.jwt.resetPassword, {
    returnTo: ALLOWED_RETURN_PATHS.has(returnPath) ? returnPath : '/',
  });
}

export function rememberGeneratedOtp(email, otp) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const code = String(otp || '').replace(/\D/g, '').slice(0, 6);

  if (!normalizedEmail || code.length !== 6) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      GENERATED_OTP_KEY,
      JSON.stringify({ email: normalizedEmail, otp: code })
    );
  } catch {
    // Ignore storage access failures.
  }
}

export function getGeneratedOtp(email) {
  const normalizedEmail = (email || '').trim().toLowerCase();

  try {
    const stored = JSON.parse(window.sessionStorage.getItem(GENERATED_OTP_KEY) || 'null');
    if (stored?.email === normalizedEmail && stored?.otp) {
      return stored.otp;
    }
  } catch {
    return '';
  }

  return '';
}

export function startResendCooldown(seconds = RESEND_COOLDOWN_SECONDS) {
  try {
    window.sessionStorage.setItem(RESEND_UNTIL_KEY, String(Date.now() + seconds * 1000));
  } catch {
    // Ignore storage access failures.
  }
}

export function getResendCooldownRemaining() {
  try {
    const until = Number(window.sessionStorage.getItem(RESEND_UNTIL_KEY) || 0);
    if (!until) {
      return 0;
    }

    const remaining = Math.ceil((until - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
}
