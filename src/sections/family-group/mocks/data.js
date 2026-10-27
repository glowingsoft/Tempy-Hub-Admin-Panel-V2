export const FAMILY_GROUP_STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'invitePending', label: 'Invite pending', color: 'warning' },
  { value: 'noFamily', label: 'No family', color: 'error' },
];

export function getFamilyGroupStatusMeta(status) {
  return (
    FAMILY_GROUP_STATUS_OPTIONS.find((option) => option.value === status) || {
      value: status,
      label: status
        ? status
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_-]/g, ' ')
            .replace(/^\w/, (char) => char.toUpperCase())
            .trim()
        : '—',
      color: 'default',
    }
  );
}

export function getRelationshipLabel(value, options = []) {
  const match = options.find((option) => option.value === value);
  if (match?.label) return match.label;
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getInvitationId(invitation) {
  return invitation?._id || invitation?.invitationId || invitation?.pendingInvitationId || '';
}

export function getMemberStatusMeta(status) {
  if (status === 'pending' || status === 'invitePending') {
    return { label: 'Invite pending', color: 'warning' };
  }
  return getFamilyGroupStatusMeta(status);
}

export function toResidentOption(group) {
  if (!group?.residentId) return null;

  return {
    value: group.residentId,
    label: group.roomNumber
      ? `${group.residentName} - Room ${group.roomNumber}`
      : group.residentName,
  };
}
