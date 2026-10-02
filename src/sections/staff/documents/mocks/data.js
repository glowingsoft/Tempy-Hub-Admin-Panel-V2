import { getAllDocuments } from 'src/sections/active-sections/documents/mocks/data';

export function getStaffDocuments() {
  return getAllDocuments().map((document, index) => ({
    ...document,
    createdAt: document.createdAt || document.updatedAt,
    acknowledged: Boolean(document.signed || document.isSigned || document.acknowledged || index === 1),
  }));
}

export const staffDocuments = getStaffDocuments();
