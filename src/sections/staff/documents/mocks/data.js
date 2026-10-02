import { getAllDocuments } from 'src/sections/active-sections/documents/mocks/data';

export function getStaffDocuments() {
  return getAllDocuments().map((document) => ({
    ...document,
    createdAt: document.createdAt || document.updatedAt,
    acknowledged: Boolean(document.acknowledged),
  }));
}

export const staffDocuments = getStaffDocuments();
