import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------

export const floorPlansApi = createApi({
  reducerPath: 'floorPlansApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['FloorPlans'],

  endpoints: (builder) => ({
    getFloorPlans: builder.query({
      query: ({ organizationId, page = 1, limit = 10, branchId, status, keyword } = {}) => ({
        url: API_ROUTES.ORGANIZATION_FLOOR_PLANS(organizationId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: {
          page,
          limit,
          branchId: branchId && branchId !== 'all' ? branchId : '',
          status: status && status !== 'all' ? status : '',
          keyword: keyword ?? '',
        },
      }),
      transformResponse: (res) => ({
        data: res?.data ?? [],
        meta: res?.meta ?? res?.pagination ?? {},
      }),
      providesTags: ['FloorPlans'],
      keepUnusedDataFor: 30,
    }),

    createFloor: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_FLOOR_PLANS(organizationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      invalidatesTags: ['FloorPlans'],
    }),
  }),
});

export const {
  useGetFloorPlansQuery,
  useCreateFloorMutation,
} = floorPlansApi;