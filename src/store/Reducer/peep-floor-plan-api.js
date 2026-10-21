import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------

export const peepFloorPlanApi = createApi({
  reducerPath: 'peepFloorPlanApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['PeepFloorSummary', 'PeepRecords'],

  endpoints: (builder) => ({
    getPeepFloorSummary: builder.query({
      query: ({ organizationId, branchId } = {}) => ({
        url: API_ROUTES.ORGANIZATION_PEEP_FLOOR_SUMMARY(organizationId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: branchId && branchId !== 'all' ? { branchId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['PeepFloorSummary'],
      keepUnusedDataFor: 30,
    }),

    getPeepRecords: builder.query({
      query: ({ organizationId, page = 1, limit = 10, branchId, peepLevel, keyword, residentId } = {}) => ({
        url: API_ROUTES.ORGANIZATION_PEEP_RECORDS(organizationId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: {
          page,
          limit,
          branchId: branchId && branchId !== 'all' ? branchId : '',
          peepLevel: peepLevel && peepLevel !== 'all' ? peepLevel : '',
          keyword: keyword ?? '',
          ...(residentId ? { residentId } : {}),
        },
      }),
      transformResponse: (res) => ({
        data: res?.data ?? [],
        meta: res?.meta ?? res?.pagination ?? {},
      }),
      providesTags: ['PeepRecords'],
      keepUnusedDataFor: 30,
    }),

    createPeepRecord: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_PEEP_RECORDS(organizationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      invalidatesTags: ['PeepRecords', 'PeepFloorSummary'],
    }),

    getPeepRecordById: builder.query({
      query: ({ peepRecordId, organizationId } = {}) => ({
        url: API_ROUTES.PEEP_RECORD_BY_ID(peepRecordId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { peepRecordId }) => [{ type: 'PeepRecords', id: peepRecordId }],
      keepUnusedDataFor: 30,
    }),

    updatePeepRecord: builder.mutation({
      query: ({ peepRecordId, organizationId, ...body }) => ({
        url: API_ROUTES.PEEP_RECORD_BY_ID(peepRecordId),
        method: 'PATCH',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      invalidatesTags: ['PeepRecords', 'PeepFloorSummary'],
    }),
  }),
});

export const {
  useGetPeepFloorSummaryQuery,
  useGetPeepRecordsQuery,
  useGetPeepRecordByIdQuery,
  useCreatePeepRecordMutation,
  useUpdatePeepRecordMutation,
} = peepFloorPlanApi;