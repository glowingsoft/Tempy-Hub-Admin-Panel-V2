const SORT_PARAM = {
  'name-asc': 'nameAsc',
  'name-desc': 'nameDesc',
  'totalUsedGb-asc': 'usedAsc',
  'totalUsedGb-desc': 'usedDesc',
  'usagePercentage-asc': 'percentAsc',
  'usagePercentage-desc': 'percentDesc',
};

export function formatGb(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return '0';
  if (Math.abs(n) >= 10) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
  }
  if (Math.abs(n) >= 1) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return String(Number(n.toPrecision(3)));
}

export function getBillingSortParam(orderBy, order) {
  if (!orderBy || !order) return undefined;
  return SORT_PARAM[`${orderBy}-${order}`];
}

export function mapUsageListRow(item) {
  const person = item?.owner || item?.manager || {};
  const images = item?.images || {};
  const files = item?.files || {};

  return {
    id: item?.branchId || item?.organizationId,
    organizationId: item?.organizationId,
    branchId: item?.branchId,
    name: item?.name || '—',
    ownerName: person.name || '—',
    ownerEmail: person.email || '',
    totalUsedGb: item?.usedGb ?? 0,
    imageUsageGb: images.gb ?? 0,
    otherFilesGb: files.gb ?? 0,
    quotaGb: item?.planLimitGb ?? 0,
    usagePercentage: item?.usagePercent ?? 0,
    imageCount: images.count ?? 0,
    documentCount: files.count ?? 0,
    imagePercent: images.percentOfUsed,
    filePercent: files.percentOfUsed,
    status: item?.status,
    statusLabel: item?.statusLabel,
    canEdit: Boolean(item?.canEdit),
    measuredAt: item?.measuredAt,
    unmeasured: item?.unmeasured,
    isSite: Boolean(item?.branchId),
    emergencyNotifyOffsite: item?.emergencyNotifyOffsite,
  };
}

export function mapUsageSummary(summary = {}, { isFiltered = false, organization } = {}) {
  const images = summary.images || {};
  const files = summary.files || {};
  const billing = summary.billing || {};

  return {
    isFiltered,
    selectedOrgName: organization?.name || '',
    totalUsedGb: summary.totalUsedGb ?? 0,
    imageUsageGb: images.gb ?? 0,
    otherFilesGb: files.gb ?? 0,
    quotaGb: summary.planLimitGb ?? summary.totalPlanGb ?? organization?.planLimitGb ?? 0,
    usagePercentage: summary.quotaPercent ?? organization?.usagePercent ?? 0,
    imageCount: images.count ?? 0,
    documentCount: files.count ?? 0,
    imagePercentOfTotal: images.percentOfTotal ?? 0,
    filesPercentOfTotal: files.percentOfTotal ?? 0,
    billingStatus: billing.label || 'Within Plan',
    tierMonthlyCost: billing.baseTierGbp ?? 0,
    overageGbpPerGb: billing.overageGbpPerGb ?? 0.15,
    overageChargeGbp: billing.overageChargeGbp ?? 0,
    organizationsCount: summary.activeOrganizations ?? 0,
  };
}

export function usageProgressColor(status, usagePercentage) {
  if (status === 'high' || usagePercentage >= 85) return 'error';
  if (status === 'approaching' || usagePercentage >= 60) return 'warning';
  return 'success';
}
