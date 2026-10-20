import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Members / Memberships API
//
// A "member" is a user who has accepted an invitation and now belongs to an
// organization. This is a DIFFERENT resource from an invitation — keep the two
// flows separate. Listing is organization-scoped; update / deactivate address a
// membership directly by its `membershipId`.
//
// GET  /admin/organizations/:organizationId/members?page=1&limit=10&keyword=
//   response:
//   {
//     "message": "Data fetched successfully",
//     "data": [
//       {
//         "_id": "string",              // membershipId
//         "organizationId": "string",
//         "userId": "string",
//         "user": { "_id": "string", "name": "string", "email": "string" },
//         "role": "staff",
//         "branchId": "string" | null,
//         "branch": { "_id": "string", "name": "string", "code": "string" } | null,
//         "permissions": ["leave.approve"],
//         "jobTitleId": "string" | null,
//         "jobTitle": { "_id": "string", "name": "string" } | null,
//         "departmentIds": ["string"],
//         "departments": [{ "_id": "string", "name": "string" }],
//         "startDate": "ISO",
//         "status": "active" | "inactive",
//         "deactivatedAt": "ISO" | null,
//         "createdAt": "ISO",
//         "updatedAt": "ISO"
//       }
//     ],
//     "meta": { "currentPage": 1, "totalPages": 1, "totalRecords": 1, "limit": 10 }
//   }
//
// GET  /admin/memberships/:membershipId          -> { "message": "string", "data": Membership }
//
// PATCH /admin/memberships/:membershipId
//   request:
//   {
//     "name": "string", "role": "staff", "branchId": "string",
//     "permissions": ["leave.approve"], "jobTitleId": "string",
//     "departmentIds": ["string"], "startDate": "2026-02-01T00:00:00.000Z"
//   }
//   response: { "message": "string", "data": Membership }
//
// POST /admin/memberships/:membershipId/deactivate
//   -> { "message": "string", "data": Membership }  (status becomes "inactive" — NOT a delete)
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({ type: 'Member', id: `LIST-${organizationId}` });

const normalizeMembership = (membership) => ({
  ...membership,
  membershipId: membership.membershipId ?? membership._id,
  userId: membership.userId ?? membership.user?._id,
  name: membership.name ?? membership.user?.name,
  email: membership.email ?? membership.user?.email,
  branchId: membership.branchId ?? membership.branch?._id ?? null,
  startDate: membership.startDate ?? membership.staffProfile?.startDate ?? null,
});

export const membersApi = createApi({
  reducerPath: 'membersApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Member'],

  endpoints: (builder) => ({
    getMembers: builder.query({
      query: ({ organizationId, page = 1, limit = 10, status, keyword }) => ({
        url: API_ROUTES.ORGANIZATION_MEMBERS(organizationId),
        method: 'GET',
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(keyword ? { keyword } : {}),
        },
      }),
      transformResponse: (res) => ({
        data: (res?.data ?? []).map(normalizeMembership),
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId }) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Member', id: _id })),
              listTag(organizationId),
            ]
          : [listTag(organizationId)],
    }),

    getMember: builder.query({
      query: (arg) => {
        const membershipId = typeof arg === 'string' ? arg : arg?.membershipId;
        const organizationId = typeof arg === 'object' ? arg?.organizationId : undefined;

        return {
          url: API_ROUTES.MEMBERSHIP_BY_ID(membershipId),
          method: 'GET',
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        };
      },
      transformResponse: (res) => {
        const membership = res?.data ?? res;
        return membership ? normalizeMembership(membership) : membership;
      },
      providesTags: (result, error, arg) => [
        { type: 'Member', id: typeof arg === 'string' ? arg : arg?.membershipId },
      ],
    }),

    updateMembership: builder.mutation({
      query: ({ membershipId, organizationId, ...body }) => ({
        url: API_ROUTES.MEMBERSHIP_BY_ID(membershipId),
        method: 'PATCH',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { membershipId, organizationId }) => [
        { type: 'Member', id: membershipId },
        ...(organizationId ? [listTag(organizationId)] : []),
      ],
    }),

    deactivateMembership: builder.mutation({
      query: ({ membershipId, organizationId }) => ({
        url: API_ROUTES.MEMBERSHIP_DEACTIVATE(membershipId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) =>
        res?.data ? { ...normalizeMembership(res.data), message: res?.message } : res,
      invalidatesTags: (result, error, { membershipId, organizationId }) => [
        { type: 'Member', id: membershipId },
        ...(organizationId ? [listTag(organizationId)] : []),
        ...(result?.organizationId ? [listTag(result.organizationId)] : []),
      ],
    }),
  }),
});

export const {
  useGetMembersQuery,
  useGetMemberQuery,
  useUpdateMembershipMutation,
  useDeactivateMembershipMutation,
} = membersApi;
