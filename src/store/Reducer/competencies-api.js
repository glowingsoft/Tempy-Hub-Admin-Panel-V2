import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------

export const competenciesApi = createApi({
  reducerPath: 'competenciesApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Competencies'],

  endpoints: (builder) => ({
    getCompetencies: builder.query({
      query: ({ organizationId, branchId, keyword, type, page, limit, ...params }) => ({
        url: API_ROUTES.ORGANIZATION_REQUIREMENTS(organizationId),
        params: {
          ...(type && type !== 'all' ? { type } : {}),
          ...(keyword ? { keyword } : {}),
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...(page ? { page } : {}),
          ...(limit ? { limit } : {}),
          ...params,
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      providesTags: ['Competencies'],
    }),

    getCompetencyById: builder.query({
      query: ({ organizationId, requirementId }) => ({
        url: API_ROUTES.ORGANIZATION_REQUIREMENT_BY_ID(organizationId, requirementId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['Competencies'],
    }),

    createRequirement: builder.mutation({
      query: ({ organizationId, data }) => ({
        url: API_ROUTES.ORGANIZATION_REQUIREMENTS(organizationId),
        method: 'POST',
        body: data,
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: ['Competencies'],
    }),

    updateRequirement: builder.mutation({
      query: ({ organizationId, requirementId, data }) => ({
        url: API_ROUTES.ORGANIZATION_REQUIREMENT_BY_ID(organizationId, requirementId),
        method: 'PATCH',
        body: data,
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: ['Competencies'],
    }),
  }),
});

export const {
  useGetCompetenciesQuery,
  useLazyGetCompetenciesQuery,
  useGetCompetencyByIdQuery,
  useCreateRequirementMutation,
  useUpdateRequirementMutation,
} = competenciesApi;

