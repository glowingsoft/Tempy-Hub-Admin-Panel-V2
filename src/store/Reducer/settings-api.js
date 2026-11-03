import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Platform / site settings
//
// GET /admin/settings/all
// PUT /admin/settings/all
//   Super admin: no x-org-id — body { billing }
//   Owner: x-org-id — body { family, visits }
// ----------------------------------------------------------------------

const orgHeaders = (organizationId) =>
  organizationId ? { 'x-org-id': organizationId } : undefined;

const settingsTag = ({ organizationId, branchId } = {}) => ({
  type: 'Settings',
  id: `${organizationId || 'PLATFORM'}-${branchId || 'ALL'}`,
});

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Settings'],
  endpoints: (builder) => ({
    getAllSettings: builder.query({
      extraOptions: { disableToast: true },
      query: ({ organizationId, branchId } = {}) => ({
        url: API_ROUTES.SETTINGS_ALL,
        method: 'GET',
        headers: orgHeaders(organizationId),
        params: {
          ...(branchId ? { branchId } : {}),
        },
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, arg) => [settingsTag(arg)],
    }),

    updateAllSettings: builder.mutation({
      extraOptions: { disableToast: true },
      query: ({ organizationId, branchId, body } = {}) => ({
        url: API_ROUTES.SETTINGS_ALL,
        method: 'PUT',
        headers: orgHeaders(organizationId),
        body: body || {},
      }),
      transformResponse: (res) => res,
      invalidatesTags: (result, error, arg) => [settingsTag(arg), { type: 'Settings', id: 'PLATFORM-ALL' }],
    }),
  }),
});

export const { useGetAllSettingsQuery, useUpdateAllSettingsMutation } = settingsApi;
