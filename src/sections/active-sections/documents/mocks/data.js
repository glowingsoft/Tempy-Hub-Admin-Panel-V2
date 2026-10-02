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