import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Billing & Usage
//
// GET /admin/billing/usage
// GET /admin/billing/usage/:organizationId
// ----------------------------------------------------------------------

const orgHeaders = (organizationId) =>
  organizationId ? { 'x-org-id': organizationId } : undefined;

const listTag = (organizationId) => ({
  type: 'BillingUsage',
  id: `LIST-${organizationId || 'ALL'}`,
});

export const billingApi = createApi({
  reducerPath: 'billingApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['BillingUsage'],
  endpoints: (builder) => ({
    getBillingUsage: builder.query({
      extraOptions: { disableToast: true },
      query: ({
        organizationId,
        headerOrganizationId,
        page = 1,
        limit = 10,
        keyword,
        sort,
      } = {}) => {
        const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

        return {
          url: API_ROUTES.BILLING_USAGE,
          method: 'GET',
          headers: orgHeaders(headerOrganizationId),
          params: {
            page,
            limit,
            ...(organizationId ? { organizationId } : {}),
            ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
            ...(sort ? { sort } : {}),
          },
        };
      },
      transformResponse: (res) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId, headerOrganizationId } = {}) => [
        listTag(organizationId || headerOrganizationId),
      ],
    }),

    getBillingUsageByOrg: builder.query({
      extraOptions: { disableToast: true },
      query: ({ organizationId, headerOrganizationId } = {}) => ({
        url: API_ROUTES.BILLING_USAGE_BY_ORG(organizationId),
        method: 'GET',
        headers: orgHeaders(headerOrganizationId || organizationId),
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { organizationId } = {}) => [
        { type: 'BillingUsage', id: organizationId },
      ],
    }),
  }),
});

export const { useGetBillingUsageQuery, useGetBillingUsageByOrgQuery } = billingApi;
