import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Family overview dashboard
//
// GET /admin/organizations/:organizationId/family-overview?branchId=&days=
// Omit `days` for all time. Omit `branchId` to let the API choose a site.
// ----------------------------------------------------------------------

const orgHeaders = (organizationId) =>
  organizationId ? { 'x-org-id': organizationId } : undefined;

export const familyOverviewApi = createApi({
  reducerPath: 'familyOverviewApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['FamilyOverview'],
  endpoints: (builder) => ({
    getFamilyOverview: builder.query({
      query: ({ organizationId, branchId, days } = {}) => ({
        url: API_ROUTES.ORGANIZATION_FAMILY_OVERVIEW(organizationId),
        method: 'GET',
        headers: orgHeaders(organizationId),
        params: {
          ...(branchId ? { branchId } : {}),
          ...(days != null ? { days } : {}),
        },
      }),
      transformResponse: (res) => res?.data ?? {},
      providesTags: (result, error, { organizationId }) => [
        { type: 'FamilyOverview', id: organizationId || 'CURRENT' },
      ],
    }),
  }),
});

export const { useGetFamilyOverviewQuery } = familyOverviewApi;
