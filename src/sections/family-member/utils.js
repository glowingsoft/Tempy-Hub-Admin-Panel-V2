export const FAMILY_MEMBER_STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'default' },
  { value: 'rejected', label: 'Rejected', color: 'error' },
  { value: 'cancelled', label: 'Cancelled', color: 'default' },
];

export function getFamilyMemberStatusMeta(value) {
  return (
    FAMILY_MEMBER_STATUS_OPTIONS.find((option) => option.value === value) || {
      value,
      label: value ? value.charAt(0).toUpperCase() + value.slice(1) : '—',
      color: 'default',
    }
  );
}

export function getFamilyMemberId(member) {
  return member?._id || member?.memberId || '';
}

export function getRelationshipLabel(value, options = []) {
  const match = options.find((option) => option.value === value);
  if (match?.label) return match.label;
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1);
}
