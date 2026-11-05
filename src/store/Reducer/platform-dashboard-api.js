import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Super admin platform dashboard
//
// GET /admin/platform/dashboard?year=&organizationId=
// ----------------------------------------------------------------------

export const platformDashboardApi = createApi({
  reducerPath: 'platformDashboardApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['PlatformDashboard'],
  endpoints: (builder) => ({
    getPlatformDashboard: builder.query({
      extraOptions: { disableToast: true },
      query: ({ year, organizationId } = {}) => ({
        url: API_ROUTES.PLATFORM_DASHBOARD,
        method: 'GET',
        params: {
          ...(year ? { year } : {}),
          ...(organizationId ? { organizationId } : {}),
        },
      }),
      transformResponse: (res) => res?.data ?? {},
      providesTags: (result, error, { year, organizationId } = {}) => [
        {
          type: 'PlatformDashboard',
          id: `${year || 'NA'}-${organizationId || 'DEFAULT'}`,
        },
      ],
    }),
  }),
});

export const { useGetPlatformDashboardQuery } = platformDashboardApi;
