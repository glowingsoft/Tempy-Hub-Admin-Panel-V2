import { useCallback, useState, useSyncExternalStore } from 'react';

import { toast } from 'src/components/snackbar';

// import { useConnectTempyMutation, useCreateTempyShiftRequestMutation } from 'src/store/Reducer/tempy-api';
import {
  tempyCostTrend,
  tempyUsageSummary,
  connectToTempyMock,
  subscribeToTempyChanges,
  requestShiftViaTempyMock,
  getTempyRequestsSnapshot,
  getTempyConnectionSnapshot,
} from './mocks/data';

// ----------------------------------------------------------------------
// Shared Tempy connection state — used by the connect card (owner + line
// manager dashboards), the usage & costs page, and the "send to Tempy" shift
// action. Backed by a small external store (mocks/data.js) rather than
// per-instance useState, so connecting/requesting in one mounted component
// (e.g. the card) is immediately reflected in every other (e.g. the usage
// page rendering the same card) — see useSyncExternalStore.
// ----------------------------------------------------------------------

export function useTempyConnection() {
  const connected = useSyncExternalStore(subscribeToTempyChanges, getTempyConnectionSnapshot);
  const requests = useSyncExternalStore(subscribeToTempyChanges, getTempyRequestsSnapshot);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // TODO: await connectTempy().unwrap();
      connectToTempyMock();
      toast.success('Connected to Tempy.');
    } catch (error) {
      toast.error(error?.data?.message || 'Could not connect to Tempy.');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const requestShift = useCallback(async (payload) => {
    try {
      // TODO: await createTempyShiftRequest(payload).unwrap();
      const created = requestShiftViaTempyMock(payload);
      toast.success('Shift sent to Tempy.');
      return created;
    } catch (error) {
      toast.error(error?.data?.message || 'Could not send this shift to Tempy.');
      return null;
    }
  }, []);

  return {
    connected,
    isConnecting,
    connect,
    requests,
    requestShift,
    usageSummary: tempyUsageSummary,
    costTrend: tempyCostTrend,
  };
}
