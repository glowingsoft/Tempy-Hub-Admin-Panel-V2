// ----------------------------------------------------------------------
// Re-export centralized organization lookups for backwards compatibility
// ----------------------------------------------------------------------

export {
  useOrganizationLookups,
  useOrganizationLookups as useInvitationLookups,
  resolveBranchName,
  resolveJobTitleName,
  resolveDepartmentNames,
} from 'src/hooks/use-organization-lookups';
