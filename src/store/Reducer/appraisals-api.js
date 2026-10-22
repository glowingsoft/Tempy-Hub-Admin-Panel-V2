import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------

export const appraisalsApi = createApi({
  reducerPath: 'appraisalsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Appraisals'],

  endpoints: (builder) => ({
    getAppraisals: builder.query({
      query: ({ organizationId, branchId, staffId, ...params } = {}) => ({
        url: API_ROUTES.ORGANIZATION_APPRAISALS(organizationId),
        params: {
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...(staffId ? { staffId } : {}),
          ...params,
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      providesTags: ['Appraisals'],
    }),

    getAppraisalById: builder.query({
      query: ({ organizationId, appraisalId }) => ({
        url: API_ROUTES.ORGANIZATION_APPRAISAL_BY_ID(organizationId, appraisalId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { appraisalId }) => [{ type: 'Appraisals', id: appraisalId }],
    }),

    bookAppraisal: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_APPRAISALS(organizationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: ['Appraisals'],
    }),
  }),
});

export const {
  useGetAppraisalsQuery,
  useGetAppraisalByIdQuery,
  useBookAppraisalMutation,
} = appraisalsApi;