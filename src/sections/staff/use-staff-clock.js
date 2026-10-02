import { useState, useCallback } from 'react';

import { toast } from 'src/components/snackbar';

// import { attendanceApi } from 'src/store/Reducer/attendance-api';
import {
  staffClockState,
  clockInMock,
  clockOutMock,
  endBreakMock,
  startBreakMock,
} from './mocks/data';

// ----------------------------------------------------------------------
// Wraps the mock clock state machine. No backend yet — each action mutates the
// in-memory state (see mocks/data.js) and bumps a reload key so the widgets
// re-render. Swap the mock calls for the real attendance mutations when the
// endpoints are available.
// ----------------------------------------------------------------------

export function useStaffClock() {
  const [reloadKey, setReloadKey] = useState(0);
  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  const clockIn = useCallback(() => {
    // await clockInMutation({ staffId }).unwrap();
    clockInMock();
    refresh();
    toast.success('Clocked in');
  }, [refresh]);

  const clockOut = useCallback(() => {
    // await clockOutMutation({ staffId }).unwrap();
    clockOutMock();
    refresh();
    toast.success('Clocked out');
  }, [refresh]);

  const startBreak = useCallback(() => {
    // await breakMutation({ staffId, action: 'start' }).unwrap();
    startBreakMock();
    refresh();
    toast.success('Break started');
  }, [refresh]);

  const endBreak = useCallback(() => {
    // await breakMutation({ staffId, action: 'end' }).unwrap();
    endBreakMock();
    refresh();
    toast.success('Break ended');
  }, [refresh]);

  return {
    // `reloadKey` is unused by callers directly, but keeping it in the return
    // keeps the hook re-rendering consumers on every action.
    reloadKey,
    clock: staffClockState,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
  };
}
