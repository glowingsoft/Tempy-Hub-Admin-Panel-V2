import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';
import { familyGroupsApi } from './family-groups-api';

// ----------------------------------------------------------------------
// Family members
//
// GET    /admin/organizations/:organizationId/family-members?page&limit&status&keyword
// GET    /admin/organizations/:organizationId/family-members/:memberId
// PUT    /admin/family/members/:memberId  { relationship }
// PUT    /admin/family/members/:memberId/access  { action: "activate" | "deactivate" }
// DELETE /admin/family/residents/:residentId/members/:memberId
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({ type: 'FamilyMember', id: `LIST-${organizationId}` });

const normalizeMember = (data) => {
  if (!data || typeof data !== 'object') return data;
  const memberId = data.memberId || data._id;
  return {
    ...data,
    memberId,
    _id: memberId,
  };
};

const invalidateGroups = async (queryFulfilled, dispatch) => {
  try {
    await queryFulfilled;
    dispatch(familyGroupsApi.util.invalidateTags(['FamilyGroup']));
  } catch {
    // leave family-group cache unchanged when the member action fails
  }
};

export const familyMembersApi = createApi({
  reducerPath: 'familyMembersApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['FamilyMember'],
  endpoints: (builder) => ({
    getFamilyMembers: builder.query({
      query: ({ organizationId, page = 1, limit = 10, status, keyword } = {}) => {
        const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

        return {
          url: API_ROUTES.ORGANIZATION_FAMILY_MEMBERS(organizationId),
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
        data: Array.isArray(res?.data) ? res.data.map(normalizeMember) : [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId }) =>
        result?.data
          ? [
              ...result.data
                .filter((item) => item?.memberId)
                .map(({ memberId }) => ({ type: 'FamilyMember', id: memberId })),
              listTag(organizationId),
            ]
          : [listTag(organizationId)],
    }),

    getFamilyMember: builder.query({
      query: ({ organizationId, memberId } = {}) => ({
        url: API_ROUTES.ORGANIZATION_FAMILY_MEMBER_BY_ID(organizationId, memberId),
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => normalizeMember(res?.data ?? res),
      providesTags: (result, error, { memberId }) => [{ type: 'FamilyMember', id: memberId }],
    }),

    updateFamilyMember: builder.mutation({
      query: ({ organizationId, memberId, relationship } = {}) => ({
        url: API_ROUTES.FAMILY_MEMBER_BY_ID(memberId),
        method: 'PUT',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body: { relationship },
      }),
      invalidatesTags: (result, error, { organizationId, memberId }) => [
        { type: 'FamilyMember', id: memberId },
        listTag(organizationId),
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await invalidateGroups(queryFulfilled, dispatch);
      },
    }),

    decideFamilyMemberAccess: builder.mutation({
      query: ({ organizationId, memberId, action } = {}) => ({
        url: API_ROUTES.FAMILY_MEMBER_ACCESS(memberId),
        method: 'PUT',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body: { action },
      }),
      invalidatesTags: (result, error, { organizationId, memberId }) => [
        { type: 'FamilyMember', id: memberId },
        listTag(organizationId),
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await invalidateGroups(queryFulfilled, dispatch);
      },
    }),

    removeFamilyMember: builder.mutation({
      query: ({ organizationId, residentId, memberId } = {}) => ({
        url: API_ROUTES.FAMILY_RESIDENT_MEMBER_BY_ID(residentId, memberId),
        method: 'DELETE',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: (result, error, { organizationId, memberId }) => [
        { type: 'FamilyMember', id: memberId },
        listTag(organizationId),
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await invalidateGroups(queryFulfilled, dispatch);
      },
    }),
  }),
});

export const {
  useGetFamilyMembersQuery,
  useGetFamilyMemberQuery,
  useUpdateFamilyMemberMutation,
  useDecideFamilyMemberAccessMutation,
  useRemoveFamilyMemberMutation,
} = familyMembersApi;
