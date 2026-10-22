import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';


const listTag = (organizationId) => ({ type: 'Invitation', id: `LIST-${organizationId}` });

export const invitationsApi = createApi({
  reducerPath: 'invitationsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Invitation', 'GrantablePermission'],

  endpoints: (builder) => ({
    getInvitations: builder.query({
      query: ({ organizationId, page = 1, limit = 10, status, keyword }) => ({
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
      query: ({ invitationId, organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_INVITATION_BY_ID(organizationId, invitationId),
        method: 'PATCH',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
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

    getGrantablePermissions: builder.query({
      query: ({ organizationId }) => ({
        url: API_ROUTES.ORGANIZATION_GRANTABLE_PERMISSIONS(organizationId),
        method: 'GET',
      }),
      transformResponse: (res) => {
        const modules = Array.isArray(res?.data?.modules) ? res.data.modules : [];
        const options = modules.flatMap((module) =>
          (module?.permissions ?? []).map((permission) => ({
            value: permission.key,
            label: permission.label || permission.key,
            moduleName: module.moduleName,
          }))
        );
        return { grantedBy: res?.data?.grantedBy ?? null, modules, options };
      },
      providesTags: (result, error, { organizationId }) => [
        { type: 'GrantablePermission', id: organizationId },
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
  useGetGrantablePermissionsQuery,
} = invitationsApi;
