import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Visitor API
//
// GET    /admin/organizations/:organizationId/visitor-invitations?page=1&limit=10&branchId=...
// POST   /admin/organizations/:organizationId/visitor-invitations
// POST   /admin/visitor-invitations/:invitationId/resend
// GET    /admin/organizations/:organizationId/visit-sessions?page=1&limit=10&keyword=...
// POST   /admin/visit-sessions/:visitSessionId/approve
// POST   /admin/visit-sessions/:visitSessionId/deny
// GET    /admin/organizations/:organizationId/visitor-account-invitations
// POST   /admin/organizations/:organizationId/visitor-account-invitations
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({ type: 'VisitorInvitation', id: `LIST-${organizationId}` });
const sessionListTag = (organizationId) => ({ type: 'VisitSession', id: `LIST-${organizationId}` });
const accountInvitationListTag = (organizationId) => ({
  type: 'VisitorAccountInvitation',
  id: `LIST-${organizationId}`,
});

export const visitorApi = createApi({
  reducerPath: 'visitorApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['VisitorInvitation', 'VisitSession', 'VisitorAccountInvitation'],

  endpoints: (builder) => ({
    getVisitorInvitations: builder.query({
      query: ({ organizationId, page = 1, limit = 10, branchId, keyword, status, ...params } = {}) => ({
        url: API_ROUTES.ORGANIZATION_VISITOR_INVITATIONS(organizationId),
        method: 'GET',
        params: {
          page,
          limit,
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...(keyword?.trim() ? { keyword: keyword.trim() } : {}),
          ...(status && status !== 'all' ? { status } : {}),
          ...params,
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => ({
        data: res?.data ?? [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId }) =>
        result?.data
          ? [
            ...result.data.map(({ _id, id }) => ({
              type: 'VisitorInvitation',
              id: _id || id,
            })),
            listTag(organizationId),
          ]
          : [listTag(organizationId)],
    }),

    createVisitorInvitation: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_VISITOR_INVITATIONS(organizationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId }) => [listTag(organizationId)],
    }),

    resendVisitorInvitation: builder.mutation({
      query: ({ invitationId, organizationId }) => ({
        url: API_ROUTES.VISITOR_INVITATION_RESEND(invitationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: organizationId ? { organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId }) => [listTag(organizationId)],
    }),

    getVisitSessions: builder.query({
      query: ({ organizationId, page = 1, limit = 10, keyword, status, ...params } = {}) => ({
        url: API_ROUTES.ORGANIZATION_VISIT_SESSIONS(organizationId),
        method: 'GET',
        params: {
          page,
          limit,
          ...(keyword?.trim() ? { keyword: keyword.trim() } : {}),
          ...(status && status !== 'all' ? { status } : {}),
          ...params,
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => ({
        data: res?.data ?? [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId }) =>
        result?.data
          ? [
            ...result.data.map(({ _id, id }) => ({
              type: 'VisitSession',
              id: _id || id,
            })),
            sessionListTag(organizationId),
          ]
          : [sessionListTag(organizationId)],
    }),

    approveVisitSession: builder.mutation({
      query: ({ visitSessionId, organizationId }) => ({
        url: API_ROUTES.VISIT_SESSION_APPROVE(visitSessionId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId }) => [sessionListTag(organizationId)],
    }),

    denyVisitSession: builder.mutation({
      query: ({ visitSessionId, organizationId }) => ({
        url: API_ROUTES.VISIT_SESSION_DENY(visitSessionId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId }) => [sessionListTag(organizationId)],
    }),

    getVisitorAccountInvitations: builder.query({
      query: ({ organizationId, page = 1, limit = 10, keyword, branchId, status, ...params } = {}) => ({
        url: API_ROUTES.ORGANIZATION_VISITOR_ACCOUNT_INVITATIONS(organizationId),
        method: 'GET',
        params: {
          page,
          limit,
          ...(keyword?.trim() ? { keyword: keyword.trim() } : {}),
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...(status && status !== 'all' ? { status } : {}),
          ...params,
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => ({
        data: res?.data ?? [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId }) =>
        result?.data
          ? [
            ...result.data.map(({ _id, id }) => ({
              type: 'VisitorAccountInvitation',
              id: _id || id,
            })),
            accountInvitationListTag(organizationId),
          ]
          : [accountInvitationListTag(organizationId)],
    }),

    createVisitorAccountInvitation: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_VISITOR_ACCOUNT_INVITATIONS(organizationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId }) => [accountInvitationListTag(organizationId)],
    }),

    resendVisitorAccountInvitation: builder.mutation({
      query: ({ organizationId, invitationId }) => ({
        url: API_ROUTES.VISITOR_ACCOUNT_INVITATION_RESEND(organizationId, invitationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId }) => [
        accountInvitationListTag(organizationId),
      ],
    }),

    revokeVisitorAccountInvitation: builder.mutation({
      query: ({ organizationId, invitationId }) => ({
        url: API_ROUTES.VISITOR_ACCOUNT_INVITATION_REVOKE(organizationId, invitationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId }) => [
        accountInvitationListTag(organizationId),
      ],
    }),
  }),
});

export const {
  useGetVisitorInvitationsQuery,
  useCreateVisitorInvitationMutation,
  useResendVisitorInvitationMutation,
  useGetVisitSessionsQuery,
  useApproveVisitSessionMutation,
  useDenyVisitSessionMutation,
  useGetVisitorAccountInvitationsQuery,
  useCreateVisitorAccountInvitationMutation,
  useResendVisitorAccountInvitationMutation,
  useRevokeVisitorAccountInvitationMutation,
} = visitorApi;
