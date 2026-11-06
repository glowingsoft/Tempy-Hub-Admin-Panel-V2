import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------

export const kioskBrandingApi = createApi({
  reducerPath: 'kioskBrandingApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['KioskBranding'],

  endpoints: (builder) => ({
    getKioskWidgets: builder.query({
      extraOptions: { disableToast: true },
      query: ({ organizationId, branchId, kioskId } = {}) => ({
        url: API_ROUTES.ORGANIZATION_KIOSK_WIDGETS(organizationId),
        params: {
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...(kioskId && kioskId !== 'all' ? { kioskId } : {}),
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      providesTags: (result, error, { branchId, kioskId } = {}) => [
        {
          type: 'KioskBranding',
          id: `${branchId && branchId !== 'all' ? branchId : 'all'}-${
            kioskId && kioskId !== 'all' ? kioskId : 'site'
          }`,
        },
        'KioskBranding',
      ],
    }),

    updateKioskWidgets: builder.mutation({
      query: ({ organizationId, ...data }) => ({
        url: API_ROUTES.ORGANIZATION_KIOSK_WIDGETS(organizationId),
        method: 'PUT',
        body: data,
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: ['KioskBranding'],
    }),
  }),
});

export const {
  useGetKioskWidgetsQuery,
  useUpdateKioskWidgetsMutation,
} = kioskBrandingApi;

