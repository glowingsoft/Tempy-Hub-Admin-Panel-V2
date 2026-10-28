import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------

export const documentCategoriesApi = createApi({
  reducerPath: 'documentCategoriesApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['DocumentCategories'],

  endpoints: (builder) => ({
    getDocumentCategories: builder.query({
      query: ({ organizationId, page = 1, limit = 100, keyword, search, active, status, ...params } = {}) => ({
        url: API_ROUTES.ORGANIZATION_DOCUMENT_CATEGORIES(organizationId),
        params: {
          page,
          limit,
          ...(keyword ? { keyword } : search ? { search } : {}),
          ...(typeof active === 'boolean' ? { active } : {}),
          ...(status && status !== 'all' ? { status } : {}),
          ...params,
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      providesTags: ['DocumentCategories'],
    }),

    createDocumentCategory: builder.mutation({
      query: ({ organizationId, title, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_DOCUMENT_CATEGORIES(organizationId),
        method: 'POST',
        body: { title, ...body },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: ['DocumentCategories'],
    }),

    updateDocumentCategory: builder.mutation({
      query: ({ organizationId, categoryId, title, active, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_DOCUMENT_CATEGORY_BY_ID(organizationId, categoryId),
        method: 'PATCH',
        body: {
          ...(title !== undefined ? { title } : {}),
          ...(active !== undefined ? { active } : {}),
          ...body,
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: ['DocumentCategories'],
    }),

    deleteDocumentCategory: builder.mutation({
      query: ({ organizationId, categoryId }) => ({
        url: API_ROUTES.ORGANIZATION_DOCUMENT_CATEGORY_BY_ID(organizationId, categoryId),
        method: 'DELETE',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: ['DocumentCategories'],
    }),
  }),
});

export const {
  useGetDocumentCategoriesQuery,
  useCreateDocumentCategoryMutation,
  useUpdateDocumentCategoryMutation,
  useDeleteDocumentCategoryMutation,
} = documentCategoriesApi;