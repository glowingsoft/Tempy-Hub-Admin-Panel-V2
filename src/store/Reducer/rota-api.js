import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Rota Board & Management API
//
// GET   /admin/organizations/:organizationId/rota/board?branchId&period&scope&from&to&departmentId
// POST  /admin/organizations/:organizationId/shifts          (Book Shift)
// POST  /admin/organizations/:organizationId/leave-requests  (Record Leave)
// PATCH /admin/shifts/:shiftId                              (Update Shift)
// DELETE /admin/shifts/:shiftId                             (Cancel Shift)
// ----------------------------------------------------------------------

const rotaBoardTag = (organizationId) => ({
  type: 'RotaBoard',
  id: organizationId || 'CURRENT',
});

export const rotaApi = createApi({
  reducerPath: 'rotaApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['RotaBoard', 'Shift', 'LeaveRequest'],
  endpoints: (builder) => ({
    getRotaBoard: builder.query({
      query: ({
        organizationId,
        branchId,
        scope = 'all',
        period = 'week',
        from,
        to,
        departmentId,
        timezone,
      } = {}) => {
        const params = {
          scope,
          period,
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
          ...(departmentId && departmentId !== 'all' ? { departmentId } : {}),
          ...(timezone ? { timezone } : {}),
        };

        return {
          url: API_ROUTES.ORGANIZATION_ROTA_BOARD(organizationId),
          method: 'GET',
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
          params,
        };
      },
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { organizationId } = {}) => [rotaBoardTag(organizationId)],
    }),

    bookRotaShift: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_SHIFTS(organizationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId } = {}) => [
        rotaBoardTag(organizationId),
        { type: 'Shift', id: `LIST-${organizationId}` },
      ],
    }),

    recordRotaLeave: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_LEAVE_REQUESTS(organizationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId } = {}) => [
        rotaBoardTag(organizationId),
        { type: 'LeaveRequest', id: `LIST-${organizationId}` },
      ],
    }),

    updateRotaShift: builder.mutation({
      query: ({ shiftId, organizationId, ...body }) => ({
        url: API_ROUTES.SHIFT_BY_ID(shiftId),
        method: 'PATCH',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId } = {}) => [rotaBoardTag(organizationId)],
    }),

    deleteRotaShift: builder.mutation({
      query: ({ shiftId, organizationId }) => ({
        url: API_ROUTES.SHIFT_BY_ID(shiftId),
        method: 'DELETE',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId } = {}) => [rotaBoardTag(organizationId)],
    }),
  }),
});

export const {
  useGetRotaBoardQuery,
  useLazyGetRotaBoardQuery,
  useBookRotaShiftMutation,
  useRecordRotaLeaveMutation,
  useUpdateRotaShiftMutation,
  useDeleteRotaShiftMutation,
} = rotaApi;

