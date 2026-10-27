import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------

export const documentsApi = createApi({
  reducerPath: 'documentsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Documents'],

  endpoints: (builder) => ({
    getDocuments: builder.query({
      query: ({ organizationId, branchId, page = 1, limit = 10, keyword, category, audience, scope, ...params } = {}) => ({
        url: API_ROUTES.ORGANIZATION_DOCUMENTS(organizationId),
        params: {
          page,
          limit,
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...(keyword ? { keyword } : {}),
          ...(category && category !== 'all' ? { category } : {}),
          ...(audience && audience !== 'all' ? { audience } : {}),
          ...(scope && scope !== 'all' ? { scope } : {}),
          ...params,
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      providesTags: ['Documents'],
    }),

    getDocumentById: builder.query({
      query: (arg) => {
        const documentId = typeof arg === 'object' ? arg?.documentId : arg;
        const organizationId = typeof arg === 'object' ? arg?.organizationId : undefined;

        return {
          url: API_ROUTES.DOCUMENT_BY_ID(documentId),
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        };
      },
      providesTags: (result, error, arg) => {
        const documentId = typeof arg === 'object' ? arg?.documentId : arg;
        return [{ type: 'Documents', id: documentId }];
      },
    }),

    uploadDocument: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_DOCUMENTS(organizationId),
        method: 'POST',
        body,
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: ['Documents'],
    }),

    updateDocument: builder.mutation({
      query: ({ documentId, organizationId, ...body }) => ({
        url: API_ROUTES.UPDATE_DOCUMENT(documentId),
        method: 'PATCH',
        body,
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: (result, error, { documentId }) => [
        'Documents',
        { type: 'Documents', id: documentId },
      ],
    }),

    replaceDocumentVersion: builder.mutation({
      query: ({ documentId, organizationId, ...body }) => ({
        url: API_ROUTES.REPLACE_DOCUMENT_VERSION(documentId),
        method: 'POST',
        body,
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: (result, error, { documentId }) => [
        'Documents',
        { type: 'Documents', id: documentId },
      ],
    }),

    deleteDocument: builder.mutation({
      query: ({ documentId, organizationId }) => ({
        url: API_ROUTES.DELETE_DOCUMENT(documentId),
        method: 'DELETE',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: ['Documents'],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentByIdQuery,
  useUploadDocumentMutation,
  useUpdateDocumentMutation,
  useReplaceDocumentVersionMutation,
  useDeleteDocumentMutation,
} = documentsApi;