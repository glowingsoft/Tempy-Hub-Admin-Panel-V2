export function getAssignedBranch(user, organizationId) {
  const memberships = Array.isArray(user?.access?.memberships) ? user.access.memberships : [];
  const membership = organizationId
    ? memberships.find((item) => {
        const itemOrganizationId =
          typeof item?.organizationId === 'string'
            ? item.organizationId
            : item?.organizationId?._id || item?.organizationId?.id;
        return itemOrganizationId && itemOrganizationId === organizationId;
      })
    : memberships[0];

  if (organizationId && memberships.length > 0 && !membership) return null;

  const branchCandidates = organizationId && membership
    ? [membership.branchId, membership.branch]
    : [user?.branchId, user?.assignedBranch, user?.branch, membership?.branchId, membership?.branch];
  const getBranchId = (value) => (
    typeof value === 'object' ? value?._id || value?.id || value?.value : value
  );
  const branchId = branchCandidates.map(getBranchId).find(Boolean);

  if (!branchId) return null;

  const matchingBranch = branchCandidates.find(
    (value) =>
      typeof value === 'object' &&
      value?.name &&
      (!getBranchId(value) || getBranchId(value) === branchId)
  );
  const name = organizationId
    ? matchingBranch?.name ||
      (typeof user?.branch === 'object' ? user.branch?.name : null) ||
      user?.branchName ||
      null
    : (typeof user?.branch === 'object' ? user.branch?.name : null) ||
      matchingBranch?.name ||
      user?.branchName ||
      null;

  return { id: branchId, name };
}
