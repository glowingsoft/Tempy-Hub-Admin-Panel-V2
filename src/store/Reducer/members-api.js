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
//         "membershipId": "string",
//         "organizationId": "string",
//         "userId": "string",
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
//         "status": "active" | "inactive",
//         "deactivatedAt": "ISO" | null,
//         "createdAt": "ISO",
//         "updatedAt": "ISO"
//       }
//     ],
//     "meta": { "currentPage": 1, "totalPages": 1, "totalRecords": 1, "limit": 10 }
//   }
//
// GET  /admin/memberships/:membershipId          -> { "message": "string", "data": Membership }  (assumed)
//
// PUT  /admin/memberships/:membershipId
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

export const membersApi = createApi({
  reducerPath: 'membersApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Member'],

  endpoints: (builder) => ({
    getMembers: builder.query({
      query: ({ organizationId, page = 1, limit = 10, keyword = '' }) => ({
        url: API_ROUTES.ORGANIZATION_MEMBERS(organizationId),
        method: 'GET',
        params: { page, limit, ...(keyword ? { keyword } : {}) },
      }),
      transformResponse: (res) => ({
        data: res?.data ?? [],
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
      query: (membershipId) => ({
        url: API_ROUTES.MEMBERSHIP_BY_ID(membershipId),
        method: 'GET',
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, membershipId) => [{ type: 'Member', id: membershipId }],
    }),

    updateMembership: builder.mutation({
      query: ({ membershipId, ...body }) => ({
        url: API_ROUTES.MEMBERSHIP_BY_ID(membershipId),
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { membershipId, organizationId }) => [
        { type: 'Member', id: membershipId },
        ...(organizationId ? [listTag(organizationId)] : []),
      ],
    }),

    deactivateMembership: builder.mutation({
      query: ({ membershipId }) => ({
        url: API_ROUTES.MEMBERSHIP_DEACTIVATE(membershipId),
        method: 'POST',
      }),
      invalidatesTags: (result, error, { membershipId, organizationId }) => [
        { type: 'Member', id: membershipId },
        ...(organizationId ? [listTag(organizationId)] : []),
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
