import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { usePathname } from 'src/routes/hooks';

import { SplashScreen } from 'src/components/loading-screen';

import { useLazyGetMeQuery } from 'src/store/Reducer/auth';
import { mergeMeProfile } from 'src/store/slices/userSlice';
import { connectAuthSocket, subscribeAuthSocketStatus } from 'src/utils/auth-socket';
import { getOwnerOrganizationId } from 'src/utils/organization';

import { isPlatformAdmin } from '../permissions';

function getOrganizationId(value) {
  if (!value) return '';
  if (typeof value === 'object') return String(value._id || value.id || '');
  return String(value);
}

export function AuthMeProvider({ children }) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const user = useSelector((state) => state.user?.user);
  const skip = !user?.token || isPlatformAdmin(user);
  const hasModules = Array.isArray(user?.access?.modules);
  const fetchedOnce = useRef(hasModules);
  const currentOrgIdRef = useRef(getOrganizationId(user?.access?.organizationId));
  const [firstMeSettled, setFirstMeSettled] = useState(hasModules);
  const [socketLive, setSocketLive] = useState(false);

  const organizationId =
    getOrganizationId(user?.access?.organizationId) || getOwnerOrganizationId(user) || '';

  currentOrgIdRef.current = organizationId;

  const [fetchMe] = useLazyGetMeQuery();

  useEffect(() => subscribeAuthSocketStatus(setSocketLive), []);

  useEffect(() => {
    if (skip) return undefined;
    if (socketLive && fetchedOnce.current) return undefined;

    let cancelled = false;

    fetchMe()
      .unwrap()
      .then((data) => {
        if (cancelled) return;
        fetchedOnce.current = true;
        setFirstMeSettled(true);
        dispatch(mergeMeProfile(data));
      })
      .catch(() => {
        if (cancelled) return;
        fetchedOnce.current = true;
        setFirstMeSettled(true);
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, fetchMe, pathname, skip, socketLive]);

  useEffect(() => {
    if (skip || !user?.token || !organizationId) return undefined;

    return connectAuthSocket({
      token: user.token,
      organizationId,
      onMeUpdated: (me) => {
        if (!me) return;

        const incomingOrgId = getOrganizationId(me.access?.organizationId);
        const currentOrgId = currentOrgIdRef.current;
        if (incomingOrgId && currentOrgId && incomingOrgId !== currentOrgId) {
          return;
        }

        dispatch(mergeMeProfile(me));
      },
    });
  }, [dispatch, organizationId, skip, user?.token]);

  const waitingForFirstMe = !skip && !hasModules && !firstMeSettled;

  if (waitingForFirstMe) {
    return <SplashScreen />;
  }

  return children;
}
