import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------

export const kiosksApi = createApi({
  reducerPath: 'kiosksApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Kiosks'],

  endpoints: (builder) => ({
    getKiosks: builder.query({
      query: ({
        organizationId, branchId, page = 1, limit = 10, keyword, setupStatus, kioskMode, presence, ...params } = {}) => ({
          url: API_ROUTES.KIOSKS,
          params: {
            page,
            limit,
            ...(branchId && branchId !== 'all' ? { branchId } : {}),
            ...(keyword ? { keyword } : {}),
            ...(setupStatus && setupStatus !== 'all' ? { setupStatus } : {}),
            ...(kioskMode && kioskMode !== 'all' ? { kioskMode } : {}),
            ...(presence && presence !== 'all' ? { presence } : {}),
            ...params,
          },
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        }),
      providesTags: ['Kiosks'],
    }),

    getKioskById: builder.query({
      query: ({ kioskId, organizationId }) => ({
        url: API_ROUTES.KIOSK_BY_ID(kioskId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      providesTags: (result, error, { kioskId }) => [{ type: 'Kiosks', id: kioskId }],
    }),

    createKiosk: builder.mutation({
      query: ({ organizationId, ...data }) => ({
        url: API_ROUTES.KIOSKS,
        method: 'POST',
        body: data,
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: ['Kiosks'],
    }),

    updateKiosk: builder.mutation({
      query: ({ kioskId, organizationId, ...data }) => ({
        url: API_ROUTES.KIOSK_BY_ID(kioskId),
        method: 'PATCH',
        body: data,
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: (result, error, { kioskId }) => [
        'Kiosks',
        { type: 'Kiosks', id: kioskId },
      ],
    }),

    toggleKioskLock: builder.mutation({
      query: ({ kioskId, organizationId }) => ({
        url: API_ROUTES.KIOSK_TOGGLE_LOCK(kioskId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: (result, error, { kioskId }) => [
        'Kiosks',
        { type: 'Kiosks', id: kioskId },
      ],
    }),
  }),
});

export const {
  useGetKiosksQuery,
  useGetKioskByIdQuery,
  useCreateKioskMutation,
  useUpdateKioskMutation,
  useToggleKioskLockMutation,
} = kiosksApi;