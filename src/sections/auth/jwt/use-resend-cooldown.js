import { useCallback, useEffect, useState } from 'react';

import {
  getResendCooldownRemaining,
  startResendCooldown,
} from './password-reset-flow';

export function useResendCooldown() {
  const [remaining, setRemaining] = useState(() => getResendCooldownRemaining());
  const counting = remaining > 0;

  useEffect(() => {
    if (!counting) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setRemaining(getResendCooldownRemaining());
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [counting]);

  const start = useCallback((seconds) => {
    startResendCooldown(seconds);
    setRemaining(getResendCooldownRemaining());
  }, []);

  return {
    remaining,
    counting,
    start,
  };
}
