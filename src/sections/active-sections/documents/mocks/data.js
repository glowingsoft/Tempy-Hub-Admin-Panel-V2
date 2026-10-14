import { mockEmployees } from 'src/sections/user/mocks/data';

// mocks/data.js — updated document shape

// Client feedback: documents need to be groupable into folders (the dense
// table view itself is fine as-is — no layout change needed, just a way to
// group/filter what's already there).
export const FOLDER_OPTIONS = [
  { value: 'policies', label: 'Policies' },
  { value: 'risk_assessments', label: 'Risk Assessments' },
  { value: 'hr', label: 'HR' },
];

// Default PDF used for all mock documents that pre-exist in the system.
// Replaced with a real object-URL once a user uploads a new document.
export const DEFAULT_DOCUMENT_URL =
  '/Agnes and Arthur First Floor plans with Zones - August 25 (1).pdf';

export const mockDocuments = [
  {
    _id: 'doc-001',
    name: 'Fire Evacuation Policy',
    fileType: 'pdf',
    category: 'fire_safety',
    folder: 'policies',
    scopeType: 'all_staff',
    scopeLabel: 'All staff',
    version: 'v4',
    updatedAt: '12 Aug 2026',
    uploadedBy: 'Site Manager',
    actionType: 'sign',
    acknowledgementStats: { acknowledged: 18, assigned: 24, overdue: 2 },
    fileUrl: DEFAULT_DOCUMENT_URL,
  },
  {
    _id: 'doc-002',
    name: 'Safeguarding Handbook',
    fileType: 'pdf',
    category: 'health_safety',
    folder: 'policies',
    scopeType: 'all_staff',
    scopeLabel: 'All staff',
    version: 'v2',
    updatedAt: '3 Mar 2026',
    uploadedBy: 'HR Department',
    actionType: 'sign',
    acknowledgementStats: { acknowledged: 22, assigned: 24, overdue: 1 },
    description: 'Comprehensive safeguarding policies and procedures applicable to all care staff. Please review all sections before signing.',
    fileUrl: DEFAULT_DOCUMENT_URL,
  },
  {
    _id: 'doc-003',
    name: 'Infection Control SOP',
    fileType: 'pdf',
    category: 'health_safety',
    folder: 'policies',
    scopeType: 'all_staff',
    scopeLabel: 'All staff',
    version: 'v3',
    updatedAt: '11 Jan 2026',
    uploadedBy: 'Clinical Lead',
    actionType: 'sign',
    acknowledgementStats: { acknowledged: 20, assigned: 24, overdue: 3 },
    description: 'Standard Operating Procedure for infection prevention and control. Please review and sign.',
    fileUrl: DEFAULT_DOCUMENT_URL,
  },
  {
    _id: 'doc-004',
    name: 'Hazelmere fire risk assessment',
    fileType: 'pdf',
    category: 'fire_safety',
    folder: 'risk_assessments',
    scopeType: 'site',
    scopeLabel: 'Hazelmere only',
    version: 'v1',
    updatedAt: '2 Aug 2026',
    uploadedBy: 'Fire Safety Officer',
    actionType: 'sign',
    description: 'Annual fire risk assessment specific to the Hazelmere Residence site. Review and signature required.',
    acknowledgementStats: { acknowledged: 7, assigned: 10, overdue: 2 },
    fileUrl: DEFAULT_DOCUMENT_URL,
  },
  {
    _id: 'doc-005',
    name: 'A. Nwosu · contract',
    fileType: 'pdf',
    category: 'personal_hr',
    folder: 'hr',
    scopeType: 'personal',
    scopeLabel: 'Personal',
    version: 'v1',
    updatedAt: '2 Jan 2026',
    uploadedBy: 'HR Department',
    actionType: 'sign',
    description: 'Employment contract for A. Nwosu. This document must be signed and returned to HR.',
    acknowledgementStats: { acknowledged: 1, assigned: 1, overdue: 0 },
    assignedTo: 'A. Nwosu',
    fileUrl: DEFAULT_DOCUMENT_URL,
  },
  {
    _id: 'doc-006',
    name: 'A. Nwosu · contract',
    fileType: 'pdf',
    category: 'personal_hr',
    folder: 'hr',
    scopeType: 'personal',
    scopeLabel: 'Personal',
    version: 'v1',
    updatedAt: '2 Jan 2026',
    uploadedBy: 'HR Department',
    actionType: 'sign',
    description: 'Employment contract for A. Nwosu. This document must be signed and returned to HR.',
    acknowledgementStats: { acknowledged: 1, assigned: 1, overdue: 0 },
    assignedTo: 'A. Nwosu',
    fileUrl: DEFAULT_DOCUMENT_URL,
  },
];

// In-memory store for documents uploaded during the current browser session.
// Cleared on every page reload (same as all other prototype mock state).
let _uploadedDocuments = [];

export function getUploadedDocuments() {
  return _uploadedDocuments;
}

export function addUploadedDocument(doc) {
  _uploadedDocuments = [doc, ..._uploadedDocuments];
  return _uploadedDocuments;
}

export function getAllDocuments() {
  return [..._uploadedDocuments, ...mockDocuments];
}

export function getDocumentById(id) {
  return getAllDocuments().find((doc) => doc._id === id) || null;
}

export function getAcknowledgementRecords(documentId) {
  const document = getDocumentById(documentId);
  if (!document) return [];

  const stats = document.acknowledgementStats || {};
  const assignedCount = Math.max(stats.assigned || 0, 0);
  const acknowledgedCount = Math.min(stats.acknowledged || 0, assignedCount);
  const pendingCount = assignedCount - acknowledgedCount;
  const overdueCount = Math.min(stats.overdue || 0, pendingCount);
  const sampleSize = Math.min(assignedCount, 5, mockEmployees.length);
  const remainingByStatus = {
    acknowledged: acknowledgedCount,
    pending: pendingCount - overdueCount,
    overdue: overdueCount,
  };
  const sampleStatuses = [];

  Object.keys(remainingByStatus).forEach((status) => {
    if (remainingByStatus[status] > 0 && sampleStatuses.length < sampleSize) {
      sampleStatuses.push(status);
      remainingByStatus[status] -= 1;
    }
  });

  while (sampleStatuses.length < sampleSize) {
    Object.keys(remainingByStatus).forEach((status) => {
      if (remainingByStatus[status] > 0 && sampleStatuses.length < sampleSize) {
        sampleStatuses.push(status);
        remainingByStatus[status] -= 1;
      }
    });
  }
  const assignedDates = [
    'Sep 24, 2026',
    'Sep 25, 2026',
    'Sep 26, 2026',
    'Sep 27, 2026',
    'Sep 28, 2026',
  ];

  return mockEmployees.slice(0, sampleSize).map((employee, index) => {
    const status = sampleStatuses[index] || 'pending';

    return {
      id: `${documentId}-${employee.id}`,
      staffId: employee.id,
      name: employee.name,
      image: employee.image,
      role: employee.role || 'Staff member',
      department: employee.department || '—',
      assignedAt: assignedDates[index],
      respondedAt: status === 'acknowledged' ? `Sep ${29 - index}, 2026` : null,
      status,
    };
  });
}

export function updateDocument(id, updates) {
  const uploadedIdx = _uploadedDocuments.findIndex((doc) => doc._id === id);
  if (uploadedIdx !== -1) {
    _uploadedDocuments[uploadedIdx] = { ..._uploadedDocuments[uploadedIdx], ...updates };
    return _uploadedDocuments[uploadedIdx];
  }

  const mockIdx = mockDocuments.findIndex((doc) => doc._id === id);
  if (mockIdx !== -1) {
    mockDocuments[mockIdx] = { ...mockDocuments[mockIdx], ...updates };
    return mockDocuments[mockIdx];
  }

  return null;
}

export const getFolderLabel = (value) =>
  FOLDER_OPTIONS.find((option) => option.value === value)?.label || value || '—';