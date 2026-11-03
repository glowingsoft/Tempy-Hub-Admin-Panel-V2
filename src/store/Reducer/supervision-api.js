import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// GET /app/supervision?page&limit&search&status -> { data: Supervision[], meta: { counts, compliance } }
// GET /app/supervision/:supervisionId -> { data: Supervision }

export const supervisionApi = createApi({
  reducerPath: 'supervisionApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Supervision'],

  endpoints: (builder) => ({
    getAppSupervisions: builder.query({
      query: ({ organizationId, page = 1, limit = 10, search, status } = {}) => ({
        url: API_ROUTES.APP_SUPERVISION,
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status && status !== 'all' ? { status } : {}),
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      providesTags: ['Supervision'],
    }),

    getAppSupervisionById: builder.query({
      query: ({ organizationId, supervisionId }) => ({
        url: API_ROUTES.APP_SUPERVISION_BY_ID(supervisionId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['Supervision'],
    }),

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

    getSupervisionById: builder.query({
      query: ({ organizationId, supervisionId }) => ({
        url: API_ROUTES.ORGANIZATION_SUPERVISION_BY_ID(organizationId, supervisionId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
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

    rescheduleSupervision: builder.mutation({
      query: ({ organizationId, supervisionId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_SUPERVISION_BY_ID(organizationId, supervisionId),
        method: 'PUT',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: ['Supervision'],
    }),

    signOffSupervisionActionPoints: builder.mutation({
      query: ({ organizationId, supervisionId, actionPointIds }) => ({
        url: API_ROUTES.ORGANIZATION_SUPERVISION_ACTION_POINTS_SIGN_OFF(organizationId, supervisionId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body: { actionPointIds },
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: ['Supervision'],
    }),
  }),
});

export const {
  useGetAppSupervisionsQuery,
  useGetAppSupervisionByIdQuery,
  useGetSupervisionsQuery,
  useGetSupervisionByIdQuery,
  useBookSupervisionMutation,
  useRescheduleSupervisionMutation,
  useSignOffSupervisionActionPointsMutation,
} = supervisionApi;