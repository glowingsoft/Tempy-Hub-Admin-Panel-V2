// ----------------------------------------------------------------------
// Re-export organization helper functions from canonical src/utils/organization
// ----------------------------------------------------------------------

export {
  getOwnerOrganizationId,
  getOwnerOrganizationName,
} from 'src/utils/organization';

export function isLineManagerMember(member) {
  const role = String(member?.role || '')
    .trim()
    .replace(/[\s_-]+/g, '')
    .toLowerCase();

  return role === 'linemanager';
}

export function canEditMember(member) {
  return isLineManagerMember(member);
}
