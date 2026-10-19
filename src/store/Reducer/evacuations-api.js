import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------

export const evacuationsApi = createApi({
  reducerPath: 'evacuationsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Evacuation', 'OnSiteSummary', 'ActiveEvacuation', 'EvacuationCheck'],

  endpoints: (builder) => ({
    getOnSiteSummary: builder.query({
      query: ({ organizationId, branchId } = {}) => ({
        url: API_ROUTES.ORGANIZATION_EVACUATIONS_ON_SITE_SUMMARY(organizationId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: branchId && branchId !== 'all' ? { branchId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['OnSiteSummary'],
      keepUnusedDataFor: 30,
    }),

    getActiveEvacuation: builder.query({
      query: ({ organizationId, branchId } = {}) => ({
        url: API_ROUTES.ORGANIZATION_EVACUATIONS_ACTIVE(organizationId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: branchId ? { branchId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['ActiveEvacuation'],
      keepUnusedDataFor: 15,
    }),

    getEvacuations: builder.query({
      query: ({ organizationId, branchId, status, search, page = 1, limit = 10 } = {}) => ({
        url: API_ROUTES.ORGANIZATION_EVACUATIONS(organizationId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: {
          page,
          limit,
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...(status && status !== 'all' ? { status } : {}),
          ...(search ? { search } : {}),
        },
      }),
      transformResponse: (res) => ({
        data: res?.data ?? [],
        meta: res?.meta ?? res?.pagination ?? {},
      }),
      providesTags: ['Evacuation'],
      keepUnusedDataFor: 30,
    }),

    startEvacuation: builder.mutation({
      query: ({ organizationId, branchId, type }) => ({
        url: API_ROUTES.ORGANIZATION_EVACUATIONS(organizationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body: { branchId, type },
      }),
      invalidatesTags: ['Evacuation', 'ActiveEvacuation', 'OnSiteSummary'],
    }),

    getEvacuationById: builder.query({
      query: ({ evacuationEventId, organizationId } = {}) => ({
        url: API_ROUTES.EVACUATION_BY_ID(evacuationEventId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['Evacuation'],
      keepUnusedDataFor: 30,
    }),

    getEvacuationChecks: builder.query({
      query: ({ evacuationEventId, organizationId, unaccountedOnly = false } = {}) => ({
        url: API_ROUTES.EVACUATION_CHECKS(evacuationEventId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: { unaccountedOnly },
      }),
      transformResponse: (res) => {
        const raw = res?.data ?? res;
        const checks = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.checks)
          ? raw.checks
          : [];

        return {
          event: raw?.event || null,
          rollcallStats: raw?.rollcallStats || raw?.event?.rollcallStats || null,
          checks,
        };
      },
      providesTags: ['EvacuationCheck'],
      keepUnusedDataFor: 10,
    }),

    upsertEvacuationCheck: builder.mutation({
      query: ({
        evacuationEventId,organizationId,personKind,personId,status,locationLabel,clientEventId,
      }) => ({
        url: API_ROUTES.EVACUATION_CHECKS(evacuationEventId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body: {
          personKind,
          personId,
          status,
          ...(locationLabel ? { locationLabel } : {}),
          ...(clientEventId ? { clientEventId } : {}),
        },
      }),
      invalidatesTags: ['EvacuationCheck', 'Evacuation', 'ActiveEvacuation'],
    }),

    closeEvacuation: builder.mutation({
      query: ({ evacuationEventId, organizationId }) => ({
        url: API_ROUTES.EVACUATION_CLOSE(evacuationEventId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: ['Evacuation', 'ActiveEvacuation', 'OnSiteSummary', 'EvacuationCheck'],
    }),
  }),
});

export const {
  useGetOnSiteSummaryQuery,
  useGetActiveEvacuationQuery,
  useGetEvacuationsQuery,
  useStartEvacuationMutation,
  useGetEvacuationByIdQuery,
  useGetEvacuationChecksQuery,
  useUpsertEvacuationCheckMutation,
  useCloseEvacuationMutation,
} = evacuationsApi;
export default evacuationsApi;