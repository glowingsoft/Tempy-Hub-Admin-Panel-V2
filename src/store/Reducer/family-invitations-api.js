import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';
import { familyGroupsApi } from './family-groups-api';

// ----------------------------------------------------------------------
// Family invitations (Family Groups)
//
// GET  /admin/family/relationships
// GET  /admin/organizations/:organizationId/family-invitations?page&limit&status
// GET  /admin/organizations/:organizationId/family-invitations/:familyInvitationId
// POST /admin/family-invitations  { email, name, residentId, relationship, isNextOfKin }
// PUT  /admin/family-invitations/:id  { action: "resend" | "revoke" | "edit", ... }
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({
  type: 'FamilyInvitation',
  id: `LIST-${organizationId}`,
});

export const familyInvitationsApi = createApi({
  reducerPath: 'familyInvitationsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['FamilyInvitation', 'FamilyRelationship'],
  endpoints: (builder) => ({
    getFamilyRelationships: builder.query({
      query: () => ({
        url: API_ROUTES.FAMILY_RELATIONSHIPS,
        method: 'GET',
      }),
      transformResponse: (res) => (Array.isArray(res?.data) ? res.data : []),
      providesTags: ['FamilyRelationship'],
    }),

    getFamilyInvitations: builder.query({
      query: ({ organizationId, page = 1, limit = 10, status, keyword } = {}) => {
        const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

        return {
          url: API_ROUTES.ORGANIZATION_FAMILY_INVITATIONS(organizationId),
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
                .filter((item) => item?._id)
                .map(({ _id }) => ({ type: 'FamilyInvitation', id: _id })),
              listTag(organizationId),
            ]
          : [listTag(organizationId)],
    }),

    getFamilyInvitation: builder.query({
      query: ({ organizationId, familyInvitationId } = {}) => ({
        url: API_ROUTES.ORGANIZATION_FAMILY_INVITATION_BY_ID(organizationId, familyInvitationId),
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => {
        const data = res?.data ?? res;
        if (!data || typeof data !== 'object') return data;
        return {
          ...data,
          _id: data._id || data.invitationId,
        };
      },
      providesTags: (result, error, { familyInvitationId }) => [
        { type: 'FamilyInvitation', id: familyInvitationId },
      ],
    }),

    inviteFamilyMember: builder.mutation({
      query: ({ organizationId, email, name, residentId, relationship, isNextOfKin } = {}) => ({
        url: API_ROUTES.FAMILY_INVITATIONS,
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body: {
          email,
          name,
          residentId,
          relationship,
          isNextOfKin: Boolean(isNextOfKin),
        },
      }),
      invalidatesTags: (result, error, { organizationId }) => [listTag(organizationId)],
      async onQueryStarted({ organizationId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(familyGroupsApi.util.invalidateTags(['FamilyGroup']));
        } catch {
          // leave family-group cache unchanged when invite fails
        }
      },
    }),

    decideFamilyInvitation: builder.mutation({
      query: ({ organizationId, familyInvitationId, ...body } = {}) => ({
        url: API_ROUTES.FAMILY_INVITATION_BY_ID(familyInvitationId),
        method: 'PUT',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      invalidatesTags: (result, error, { organizationId, familyInvitationId }) => [
        { type: 'FamilyInvitation', id: familyInvitationId },
        listTag(organizationId),
      ],
      async onQueryStarted({ organizationId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(familyGroupsApi.util.invalidateTags(['FamilyGroup']));
        } catch {
          // leave family-group cache unchanged when the action fails
        }
      },
    }),
  }),
});

export const {
  useGetFamilyRelationshipsQuery,
  useGetFamilyInvitationsQuery,
  useGetFamilyInvitationQuery,
  useInviteFamilyMemberMutation,
  useDecideFamilyInvitationMutation,
} = familyInvitationsApi;
