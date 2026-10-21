export function getAssignedBranch(user) {
  const branch = user?.branch;
  const membership = user?.access?.memberships?.[0];
  const membershipBranch = membership?.branch;
  const getBranchId = (value) => (typeof value === 'object' ? value?._id : value);
  const branchId = getBranchId(user?.branchId) || getBranchId(branch) || getBranchId(membership?.branchId) || getBranchId(membershipBranch);

  if (!branchId) return null;

  return {
    id: branchId,
    name: (typeof branch === 'object' ? branch?.name : null) || (typeof membershipBranch === 'object' ? membershipBranch?.name : null) || user?.branchName || null,
  };
}
