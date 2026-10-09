import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Invitations / Memberships API
//
// An invitation belongs to an organization. List + create use organization
// routes; invitation-specific operations include the organization scope header.
//
// GET  /admin/organizations/:organizationId/invitations?page=1&limit=10&status=pending
//   status: "pending" | "accepted" | "revoked" (optional)
//   response:
//   {
//     "message": "Data fetched successfully",
//     "data": [
//       {
//         "_id": "string",
//         "organizationId": "string",
//         "email": "string",
//         "name": "string",
//         "role": "staff",
//         "branchId": "string" | null,
//         "branch": { "_id": "string", "name": "string" } | null,
//         "permissions": ["leave.approve"],
//         "jobTitleId": "string" | null,
//         "jobTitle": { "_id": "string", "name": "string" } | null,
//         "departmentIds": ["string"],
//         "departments": [{ "_id": "string", "name": "string" }],
//         "startDate": "ISO",
//         "status": "pending" | "accepted" | "revoked",
//         "expiresAt": "ISO" | null,
//         "lastSentAt": "ISO" | null,
//         "sendCount": 1,
//         "acceptedAt": "ISO" | null,
//         "revokedAt": "ISO" | null,
//         "acceptUrl": "string" | null,
//         "createdAt": "ISO",
//         "updatedAt": "ISO"
//       }
//     ],
//     "meta": { "currentPage": 1, "totalPages": 1, "totalRecords": 1, "limit": 10 }
//   }
//
// POST /admin/organizations/:organizationId/invitations
//   request:
//   {
//     "email": "string", "name": "string", "role": "staff",
//     "branchId": "string", "permissions": ["leave.approve"],
//     "jobTitleId": "string", "departmentIds": ["string"],
//     "startDate": "2026-02-01T00:00:00.000Z"
//   }
//   response: { "message": "string", "data": Invitation }
//
// POST /admin/invitations/:invitationId/resend  -> { "message": "string", "data": Invitation }
// POST /admin/invitations/:invitationId/revoke  -> { "message": "string", "data": Invitation }
// GET  /admin/organizations/:organizationId/invitations/:invitationId
// PUT  /admin/invitations/:invitationId          -> update a pending invitation (shape assumed)
// DELETE /admin/invitations/:invitationId        -> remove a revoked invitation (assumed)
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({ type: 'Invitation', id: `LIST-${organizationId}` });

export const invitationsApi = createApi({
  reducerPath: 'invitationsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Invitation'],

  endpoints: (builder) => ({
    getInvitations: builder.query({
      query: ({ organizationId, page = 1, limit = 10, status, keyword = '' }) => ({
        url: API_ROUTES.ORGANIZATION_INVITATIONS(organizationId),
        method: 'GET',
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(keyword ? { keyword } : {}),
        },
      }),
      transformResponse: (res) => ({
        data: res?.data ?? [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId }) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Invitation', id: _id })),
              listTag(organizationId),
            ]
          : [listTag(organizationId)],
    }),

    getInvitation: builder.query({
      query: ({ invitationId, organizationId }) => ({
        url: API_ROUTES.ORGANIZATION_INVITATION_BY_ID(organizationId, invitationId),
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { invitationId }) => [{ type: 'Invitation', id: invitationId }],
    }),

    createInvitation: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_INVITATIONS(organizationId),
        method: 'POST',
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId }) => [listTag(organizationId)],
    }),

    updateInvitation: builder.mutation({
      query: ({ invitationId, ...body }) => ({
        url: API_ROUTES.INVITATION_BY_ID(invitationId),
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { invitationId, organizationId }) => [
        { type: 'Invitation', id: invitationId },
        ...(organizationId ? [listTag(organizationId)] : []),
      ],
    }),

    resendInvitation: builder.mutation({
      query: ({ invitationId, organizationId }) => ({
        url: API_ROUTES.INVITATION_RESEND(invitationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { invitationId, organizationId }) => [
        { type: 'Invitation', id: invitationId },
        ...(organizationId ? [listTag(organizationId)] : []),
      ],
    }),

    revokeInvitation: builder.mutation({
      query: ({ invitationId, organizationId }) => ({
        url: API_ROUTES.INVITATION_REVOKE(invitationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { invitationId, organizationId }) => [
        { type: 'Invitation', id: invitationId },
        ...(organizationId ? [listTag(organizationId)] : []),
      ],
    }),

    deleteInvitation: builder.mutation({
      query: ({ invitationId }) => ({
        url: API_ROUTES.INVITATION_BY_ID(invitationId),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { invitationId, organizationId }) => [
        { type: 'Invitation', id: invitationId },
        ...(organizationId ? [listTag(organizationId)] : []),
      ],
    }),
  }),
});

export const {
  useGetInvitationsQuery,
  useGetInvitationQuery,
  useCreateInvitationMutation,
  useUpdateInvitationMutation,
  useResendInvitationMutation,
  useRevokeInvitationMutation,
  useDeleteInvitationMutation,
} = invitationsApi;
