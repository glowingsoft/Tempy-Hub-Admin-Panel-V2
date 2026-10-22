import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------

export const supervisionApi = createApi({
  reducerPath: 'supervisionApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Supervision'],

  endpoints: (builder) => ({
    getSupervisions: builder.query({
      query: ({ organizationId, branchId, staffId, ...params }) => ({
        url: API_ROUTES.ORGANIZATION_SUPERVISION(organizationId),
        params: {
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...(staffId ? { staffId } : {}),
          ...params,
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      providesTags: ['Supervision'],
    }),

    bookSupervision: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_SUPERVISION(organizationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: ['Supervision'],
    }),
  }),
});

export const { useGetSupervisionsQuery, useBookSupervisionMutation } = supervisionApi;