export const GAZETTE_STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'primary', countKey: 'all' },
  { value: 'ready', label: 'Ready', color: 'success', countKey: 'ready' },
  { value: 'notReady', label: 'Not ready', color: 'warning', countKey: 'notReady' },
  { value: 'printed', label: 'Printed', color: 'info', countKey: 'printed' },
  { value: 'failed', label: 'Failed', color: 'error', countKey: 'failed' },
  { value: 'building', label: 'Building', color: 'info', countKey: 'building' },
];

export function getGazetteItemId(item) {
  return item?.itemId || item?.id || '';
}

export function mapGazetteListItem(item) {
  if (!item) return item;

  return {
    ...item,
    id: getGazetteItemId(item),
    resident: item.residentName || item.resident || '—',
    room: item.roomNumber || item.room || '—',
    family: item.familyCount ?? item.family ?? 0,
    messages: item.messageCount ?? item.messages ?? 0,
    avatarUrl: item.photoUrl || item.avatarUrl || '',
    status: item.status || item.state || '',
    statusLabel: item.statusLabel || item.status || '',
  };
}

export function triggerFileDownload(href, filename) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename || 'gazette.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
