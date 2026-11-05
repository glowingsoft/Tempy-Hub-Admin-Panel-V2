import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Statistics
//
// GET /admin/statistics?year=&period=&branchId=
// period: thisMonth | thisQuarter | thisYear
// branchId: optional site filter (owner / super admin)
// ----------------------------------------------------------------------

const orgHeaders = (organizationId) =>
  organizationId ? { 'x-org-id': organizationId } : undefined;

export const statisticsApi = createApi({
  reducerPath: 'statisticsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Statistics'],
  endpoints: (builder) => ({
    getStatistics: builder.query({
      extraOptions: { disableToast: true },
      query: ({
        year,
        period,
        branchId,
        headerOrganizationId,
      } = {}) => ({
        url: API_ROUTES.STATISTICS,
        method: 'GET',
        headers: orgHeaders(headerOrganizationId),
        params: {
          ...(year ? { year } : {}),
          ...(period ? { period } : {}),
          ...(branchId ? { branchId } : {}),
        },
      }),
      transformResponse: (res) => res?.data ?? {},
      providesTags: (result, error, { headerOrganizationId, branchId, year, period } = {}) => [
        {
          type: 'Statistics',
          id: `${headerOrganizationId || 'ALL'}-${branchId || 'ALL'}-${year || 'NA'}-${period || 'NA'}`,
        },
      ],
    }),
  }),
});

export const { useGetStatisticsQuery } = statisticsApi;
