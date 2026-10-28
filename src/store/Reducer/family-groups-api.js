import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Family groups
//
// GET /admin/organizations/:organizationId/family-groups?page&limit&status&keyword
// GET /admin/organizations/:organizationId/family-groups/:residentId
// Invite / edit / resend / revoke reuse family-invitations APIs.
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({ type: 'FamilyGroup', id: `LIST-${organizationId}` });

export const familyGroupsApi = createApi({
  reducerPath: 'familyGroupsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['FamilyGroup'],
  endpoints: (builder) => ({
    getFamilyGroups: builder.query({
      query: ({ organizationId, page = 1, limit = 10, status, keyword } = {}) => {
        const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

        return {
          url: API_ROUTES.ORGANIZATION_FAMILY_GROUPS(organizationId),
          method: 'GET',
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
          params: {
            page,
            limit,
            ...(status && status !== 'all' ? { status } : {}),
            ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
          },
        };
      },
      transformResponse: (res) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId }) =>
        result?.data
          ? [
              ...result.data
                .filter((item) => item?.residentId)
                .map(({ residentId }) => ({ type: 'FamilyGroup', id: residentId })),
              listTag(organizationId),
            ]
          : [listTag(organizationId)],
    }),

    getFamilyGroup: builder.query({
      query: ({ organizationId, residentId } = {}) => ({
        url: API_ROUTES.ORGANIZATION_FAMILY_GROUP_BY_RESIDENT(organizationId, residentId),
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { residentId }) => [{ type: 'FamilyGroup', id: residentId }],
    }),
  }),
});

export const { useGetFamilyGroupsQuery, useGetFamilyGroupQuery } = familyGroupsApi;
