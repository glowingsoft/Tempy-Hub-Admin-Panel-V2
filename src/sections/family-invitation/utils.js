export const FAMILY_INVITATION_STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'accepted', label: 'Accepted', color: 'success' },
  { value: 'revoked', label: 'Revoked', color: 'error' },
  { value: 'expired', label: 'Expired', color: 'default' },
];

export function getFamilyInvitationStatusMeta(value) {
  return (
    FAMILY_INVITATION_STATUS_OPTIONS.find((option) => option.value === value) || {
      value,
      label: value ? value.charAt(0).toUpperCase() + value.slice(1) : '—',
      color: 'default',
    }
  );
}

export function getInvitationId(invitation) {
  return invitation?._id || invitation?.invitationId || '';
}

export function getRelationshipLabel(value, options = []) {
  const match = options.find((option) => option.value === value);
  if (match?.label) return match.label;
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1);
}
