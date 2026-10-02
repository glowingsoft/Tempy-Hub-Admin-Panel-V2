// Mock Data Usage dataset tied directly to the organizations present in the repository.
// Serves data for the Data Usage dashboard, KPI summary cards, and breakdown details.

import { mockOrganizations } from 'src/sections/organization/mocks/data';

// Known storage footprint configuration for existing organizations
const KNOWN_ORG_STORAGE = {
  // Bluebell Care Group
  '6a96a00da9e9deba097fb21b': {
    totalUsedGb: 540,
    imageUsageGb: 390,
    otherFilesGb: 150,
    quotaGb: 750,
    usagePercentage: 72,
    imageCount: 14850,
    documentCount: 1920,
    billingTier: 'Enterprise (750 GB)',
    billingStatus: 'Within Plan',
    tierMonthlyCost: 180,
    projectedOverageGb: 0,
    sites: [
      { name: 'Willow House', totalGb: 230, imageGb: 165, otherGb: 65, photosCount: 6200 },
      { name: 'Meadow View', totalGb: 180, imageGb: 130, otherGb: 50, photosCount: 5100 },
      { name: 'Cedar Court', totalGb: 130, imageGb: 95, otherGb: 35, photosCount: 3550 },
    ],
    categories: [
      { name: 'Fire Drill Evidence Photos', sizeGb: 210, count: 8200, type: 'image' },
      { name: 'PEEP & Floor Plans', sizeGb: 110, count: 3400, type: 'image' },
      { name: 'Staff Profile & Kiosk Photos', sizeGb: 70, count: 3250, type: 'image' },
      { name: 'E-Sign Policies & PDFs', sizeGb: 95, count: 1120, type: 'file' },
      { name: 'Audit & Compliance Archives', sizeGb: 55, count: 800, type: 'file' },
    ],
  },
  // Willow Care Group
  '6a9579204f38edb8df1640b6': {
    totalUsedGb: 310,
    imageUsageGb: 210,
    otherFilesGb: 100,
    quotaGb: 650,
    usagePercentage: 48,
    imageCount: 7640,
    documentCount: 1450,
    billingTier: 'Professional (650 GB)',
    billingStatus: 'Within Plan',
    tierMonthlyCost: 120,
    projectedOverageGb: 0,
    sites: [
      { name: 'Willow North', totalGb: 175, imageGb: 120, otherGb: 55, photosCount: 4300 },
      { name: 'Willow Garden', totalGb: 135, imageGb: 90, otherGb: 45, photosCount: 3340 },
    ],
    categories: [
      { name: 'Fire Drill Evidence Photos', sizeGb: 120, count: 4300, type: 'image' },
      { name: 'PEEP & Floor Plans', sizeGb: 55, count: 1940, type: 'image' },
      { name: 'Staff Profile & Kiosk Photos', sizeGb: 35, count: 1400, type: 'image' },
      { name: 'E-Sign Policies & PDFs', sizeGb: 65, count: 950, type: 'file' },
      { name: 'Audit & Compliance Archives', sizeGb: 35, count: 500, type: 'file' },
    ],
  },
  // Demo Care Group
  '6a9576de4f38edb8df164091': {
    totalUsedGb: 180,
    imageUsageGb: 120,
    otherFilesGb: 60,
    quotaGb: 500,
    usagePercentage: 36,
    imageCount: 4200,
    documentCount: 820,
    billingTier: 'Starter (500 GB)',
    billingStatus: 'Within Plan',
    tierMonthlyCost: 80,
    projectedOverageGb: 0,
    sites: [
      { name: 'Demo Central', totalGb: 180, imageGb: 120, otherGb: 60, photosCount: 4200 },
    ],
    categories: [
      { name: 'Fire Drill Evidence Photos', sizeGb: 70, count: 2400, type: 'image' },
      { name: 'PEEP & Floor Plans', sizeGb: 30, count: 1100, type: 'image' },
      { name: 'Staff Profile & Kiosk Photos', sizeGb: 20, count: 700, type: 'image' },
      { name: 'E-Sign Policies & PDFs', sizeGb: 40, count: 520, type: 'file' },
      { name: 'Audit & Compliance Archives', sizeGb: 20, count: 300, type: 'file' },
    ],
  },
};

// Generates fallback deterministic storage data for any newly created organization
function getFallbackStorage(org) {
  const seed = (org.name || 'org').length;
  const totalUsedGb = 100 + ((seed * 15) % 250);
  const imageUsageGb = Math.round(totalUsedGb * 0.68);
  const otherFilesGb = totalUsedGb - imageUsageGb;
  const quotaGb = 400;
  const usagePercentage = Math.round((totalUsedGb / quotaGb) * 100);

  return {
    totalUsedGb,
    imageUsageGb,
    otherFilesGb,
    quotaGb,
    usagePercentage,
    imageCount: Math.round(imageUsageGb * 35),
    documentCount: Math.round(otherFilesGb * 12),
    billingTier: 'Starter (400 GB)',
    billingStatus: usagePercentage > 85 ? 'Approaching Limit' : 'Within Plan',
    tierMonthlyCost: 75,
    projectedOverageGb: 0,
    sites: [
      {
        name: 'Headquarters',
        totalGb: totalUsedGb,
        imageGb: imageUsageGb,
        otherGb: otherFilesGb,
        photosCount: imageUsageGb * 35,
      },
    ],
    categories: [
      {
        name: 'Fire Drill Evidence Photos',
        sizeGb: Math.round(imageUsageGb * 0.6),
        count: Math.round(imageUsageGb * 20),
        type: 'image',
      },
      {
        name: 'PEEP & Floor Plans',
        sizeGb: Math.round(imageUsageGb * 0.25),
        count: Math.round(imageUsageGb * 10),
        type: 'image',
      },
      {
        name: 'Staff Profile & Kiosk Photos',
        sizeGb: Math.round(imageUsageGb * 0.15),
        count: Math.round(imageUsageGb * 5),
        type: 'image',
      },
      {
        name: 'E-Sign Policies & PDFs',
        sizeGb: Math.round(otherFilesGb * 0.65),
        count: Math.round(otherFilesGb * 8),
        type: 'file',
      },
      {
        name: 'Audit & Compliance Archives',
        sizeGb: Math.round(otherFilesGb * 0.35),
        count: Math.round(otherFilesGb * 4),
        type: 'file',
      },
    ],
  };
}

/**
 * Returns all organization usage data rows bound to current organizations in the repository.
 */
export function getAllDataUsageRows() {
  return mockOrganizations.map((org) => {
    const storage = KNOWN_ORG_STORAGE[org._id] || getFallbackStorage(org);
    return {
      id: org._id,
      name: org.name,
      ownerName: org.owner?.name || 'Administrator',
      ownerEmail: org.owner?.email || 'admin@example.com',
      status: org.status || 'active',
      createdAt: org.createdAt,
      totalUsedGb: storage.totalUsedGb,
      imageUsageGb: storage.imageUsageGb,
      otherFilesGb: storage.otherFilesGb,
      quotaGb: storage.quotaGb,
      usagePercentage: storage.usagePercentage,
      imageCount: storage.imageCount,
      documentCount: storage.documentCount,
      billingTier: storage.billingTier,
      billingStatus: storage.billingStatus,
      tierMonthlyCost: storage.tierMonthlyCost,
      sites: storage.sites,
      categories: storage.categories,
    };
  });
}

/**
 * Returns summary statistics for either all organizations (aggregated) or a specific organization.
 */
export function getDataUsageStats(selectedOrgId = 'all') {
  const allRows = getAllDataUsageRows();

  if (selectedOrgId && selectedOrgId !== 'all') {
    const single = allRows.find((row) => row.id === selectedOrgId) || allRows[0];
    if (single) {
      return {
        isFiltered: true,
        selectedOrgName: single.name,
        totalUsedGb: single.totalUsedGb,
        imageUsageGb: single.imageUsageGb,
        otherFilesGb: single.otherFilesGb,
        quotaGb: single.quotaGb,
        usagePercentage: single.usagePercentage,
        imageCount: single.imageCount,
        documentCount: single.documentCount,
        billingTier: single.billingTier,
        billingStatus: single.billingStatus,
        tierMonthlyCost: single.tierMonthlyCost,
        projectedOverageGb: single.projectedOverageGb || 0,
        organizationsCount: 1,
      };
    }
  }

  // Aggregated totals
  const totalUsedGb = allRows.reduce((acc, row) => acc + row.totalUsedGb, 0);
  const imageUsageGb = allRows.reduce((acc, row) => acc + row.imageUsageGb, 0);
  const otherFilesGb = allRows.reduce((acc, row) => acc + row.otherFilesGb, 0);
  const quotaGb = allRows.reduce((acc, row) => acc + row.quotaGb, 0);
  const imageCount = allRows.reduce((acc, row) => acc + row.imageCount, 0);
  const documentCount = allRows.reduce((acc, row) => acc + row.documentCount, 0);
  const usagePercentage = quotaGb > 0 ? Math.round((totalUsedGb / quotaGb) * 100) : 0;

  return {
    isFiltered: false,
    selectedOrgName: 'All Organizations',
    totalUsedGb,
    imageUsageGb,
    otherFilesGb,
    quotaGb,
    usagePercentage,
    imageCount,
    documentCount,
    billingTier: 'Platform Total',
    billingStatus: usagePercentage > 80 ? 'Approaching Limit' : 'Within Plan',
    tierMonthlyCost: allRows.reduce((acc, row) => acc + row.tierMonthlyCost, 0),
    projectedOverageGb: 0,
    organizationsCount: allRows.length,
  };
}
