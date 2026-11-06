import { toast as sonnerToast } from 'sonner';

// ----------------------------------------------------------------------
// Smart Toast Wrapper
// Prevents duplicate toast notifications and suppresses generic secondary
// error toasts when an API error toast has already been dispatched.
// ----------------------------------------------------------------------

let lastApiErrorTimestamp = 0;
let lastApiErrorMessage = '';
const recentErrorToasts = new Map();

function createToastProxy(target) {
  const handler = {
    apply(fn, thisArg, args) {
      return Reflect.apply(fn, target, args);
    },
    get(obj, prop) {
      if (prop === 'error') {
        return (message, options) => {
          const now = Date.now();
          const text =
            typeof message === 'string'
              ? message
              : message?.message || String(message || '');

          // Deduplicate identical error messages within 2000ms window
          const lastShown = recentErrorToasts.get(text);
          if (lastShown && now - lastShown < 2000) {
            return null;
          }

          // If explicitly flagged as an API error
          if (options?.isApiError) {
            lastApiErrorTimestamp = now;
            lastApiErrorMessage = text;
            recentErrorToasts.set(text, now);
            return target.error(message, options);
          }

          // If an API error was already displayed within 1500ms:
          // Suppress secondary/fallback toasts so only the API error is shown.
          if (now - lastApiErrorTimestamp < 1500) {
            return null;
          }

          recentErrorToasts.set(text, now);

          // Garbage collect older entries
          if (recentErrorToasts.size > 25) {
            for (const [k, t] of recentErrorToasts.entries()) {
              if (now - t > 3000) recentErrorToasts.delete(k);
            }
          }

          return target.error(message, options);
        };
      }

      if (prop === 'apiError') {
        return (message, options) => {
          const now = Date.now();
          const text =
            typeof message === 'string'
              ? message
              : message?.message || String(message || '');

          // Deduplicate identical API error messages within 2000ms window
          const lastShown = recentErrorToasts.get(text);
          if (lastShown && now - lastShown < 2000) {
            return null;
          }

          lastApiErrorTimestamp = now;
          lastApiErrorMessage = text;
          recentErrorToasts.set(text, now);
          return target.error(message, options);
        };
      }

      return Reflect.get(obj, prop);
    },
  };

  return new Proxy(target, handler);
}

export const toast = createToastProxy(sonnerToast);

export * from 'sonner';
export * from './snackbar';
