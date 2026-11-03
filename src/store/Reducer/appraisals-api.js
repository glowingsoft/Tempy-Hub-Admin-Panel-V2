import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------

export const appraisalsApi = createApi({
  reducerPath: 'appraisalsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Appraisals', 'StaffAppraisals'],

  endpoints: (builder) => ({
    getAppStaffAppraisals: builder.query({
      query: ({
        organizationId,
        page = 1,
        limit = 10,
        search,
        status,
      } = {}) => ({
        url: API_ROUTES.APP_APPRAISALS,
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status && status !== 'all' ? { status } : {}),
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      providesTags: ['Appraisals', { type: 'StaffAppraisals', id: 'LIST' }],
    }),

    getAppStaffAppraisalById: builder.query({
      query: ({ organizationId, appraisalId }) => ({
        url: API_ROUTES.APP_APPRAISAL_BY_ID(appraisalId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { appraisalId }) => [
        { type: 'Appraisals', id: appraisalId },
        { type: 'StaffAppraisals', id: appraisalId },
      ],
    }),

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

    updateAppraisal: builder.mutation({
      query: ({ organizationId, appraisalId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_APPRAISAL_BY_ID(organizationId, appraisalId),
        method: 'PUT',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: ['Appraisals'],
    }),

    signOffAppraisalActionPoints: builder.mutation({
      query: ({ organizationId, appraisalId, actionPointIds }) => ({
        url: API_ROUTES.ORGANIZATION_APPRAISAL_ACTION_POINTS_SIGN_OFF(organizationId, appraisalId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body: { actionPointIds },
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: ['Appraisals'],
    }),

    signOffAppraisalActionPoint: builder.mutation({
      query: ({ organizationId, appraisalId, appraisalActionPointId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_APPRAISAL_ACTION_POINT_SIGN_OFF(
          organizationId,
          appraisalId,
          appraisalActionPointId
        ),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: ['Appraisals'],
    }),

    managerSignAppraisal: builder.mutation({
      query: ({ organizationId, appraisalId, signatureUrl }) => ({
        url: API_ROUTES.ORGANIZATION_APPRAISAL_MANAGER_SIGN(organizationId, appraisalId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body: { signatureUrl },
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { appraisalId }) => [
        { type: 'Appraisals', id: appraisalId },
        'Appraisals',
      ],
    }),

    acknowledgeStaffAppraisal: builder.mutation({
      query: ({ organizationId, appraisalId, signatureUrl }) => ({
        url: API_ROUTES.APP_APPRAISAL_ACKNOWLEDGE(appraisalId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body: { signatureUrl },
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { appraisalId }) => [
        { type: 'StaffAppraisals', id: appraisalId },
        { type: 'StaffAppraisals', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAppStaffAppraisalsQuery,
  useGetAppStaffAppraisalByIdQuery,
  useGetAppraisalsQuery,
  useGetAppraisalByIdQuery,
  useBookAppraisalMutation,
  useUpdateAppraisalMutation,
  useSignOffAppraisalActionPointsMutation,
  useSignOffAppraisalActionPointMutation,
  useManagerSignAppraisalMutation,
  useAcknowledgeStaffAppraisalMutation,
} = appraisalsApi;