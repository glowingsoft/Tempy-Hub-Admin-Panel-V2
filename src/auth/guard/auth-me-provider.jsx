import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { usePathname } from 'src/routes/hooks';

import { SplashScreen } from 'src/components/loading-screen';

import { useLazyGetMeQuery } from 'src/store/Reducer/auth';
import { mergeMeProfile } from 'src/store/slices/userSlice';

import { isPlatformAdmin } from '../permissions';

export function AuthMeProvider({ children }) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const user = useSelector((state) => state.user?.user);
  const skip = !user?.token || isPlatformAdmin(user);
  const hasModules = Array.isArray(user?.access?.modules);
  const fetchedOnce = useRef(hasModules);
  const [firstMeSettled, setFirstMeSettled] = useState(hasModules);

  const [fetchMe] = useLazyGetMeQuery();

  useEffect(() => {
    if (skip) return undefined;

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
  }, [dispatch, fetchMe, pathname, skip]);

  const waitingForFirstMe = !skip && !hasModules && !firstMeSettled;

  if (waitingForFirstMe) {
    return <SplashScreen />;
  }

  return children;
}
