export function isKioskLocked(kiosk) {
  const kioskMode = String(kiosk?.kioskMode || kiosk?.raw?.kioskMode || '')
    .trim()
    .toLowerCase();

  if (kioskMode === 'locked') return true;
  if (kioskMode === 'setup') return false;

  return Boolean(kiosk?.isLocked || kiosk?.isLock || kiosk?.locked || kiosk?.raw?.isLocked || kiosk?.raw?.isLock || kiosk?.raw?.locked);
}
