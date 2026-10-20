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

    getFloorPlanById: builder.query({
      query: ({ floorPlanId, organizationId } = {}) => ({
        url: API_ROUTES.FLOOR_PLAN_BY_ID(floorPlanId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { floorPlanId }) => [
        { type: 'FloorPlans', id: floorPlanId },
      ],
      keepUnusedDataFor: 0,
    }),

    updateFloorPlan: builder.mutation({
      query: ({ floorPlanId, organizationId, ...body }) => ({
        url: API_ROUTES.FLOOR_PLAN_BY_ID(floorPlanId),
        method: 'PATCH',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      invalidatesTags: (result, error, { floorPlanId }) => [
        { type: 'FloorPlans', id: floorPlanId },
        'FloorPlans',
      ],
    }),

    createFloorPlanPin: builder.mutation({
      query: ({ floorPlanId, organizationId, residentId, x, y }) => ({
        url: API_ROUTES.FLOOR_PLAN_PINS(floorPlanId),
        method: 'PUT',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body: { residentId, x, y },
      }),
      invalidatesTags: (result, error, { floorPlanId }) => [
        { type: 'FloorPlans', id: floorPlanId },
        'FloorPlans',
      ],
    }),

    deleteFloorPlanPin: builder.mutation({
      query: ({ floorPlanId, floorPlanPinId, organizationId }) => ({
        url: API_ROUTES.FLOOR_PLAN_PIN_BY_ID(floorPlanId, floorPlanPinId),
        method: 'DELETE',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: (result, error, { floorPlanId }) => [
        { type: 'FloorPlans', id: floorPlanId },
        'FloorPlans',
      ],
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
  useGetFloorPlanByIdQuery,
  useUpdateFloorPlanMutation,
  useCreateFloorPlanPinMutation,
  useDeleteFloorPlanPinMutation,
  useCreateFloorMutation,
} = floorPlansApi;