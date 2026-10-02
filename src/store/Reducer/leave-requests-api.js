import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Leave Requests API
//
// Leave requests belong to an organization (via the staff member / branch).
// List is organization-scoped; approve addresses a request directly and also
// carries the org id in an `x-org-id` header. Leave entitlements are set per
// staff member / year / leave type on an organization-scoped endpoint.
//
// GET  /admin/organizations/:organizationId/leave-requests?page=1&limit=10
//   response:
//   {
//     "message": "string",
//     "data": [
//       {
//         "_id": "string", "staffId": "string", "branchId": "string",
//         "leaveType": "annual" | string,
//         "startDate": "ISO", "endDate": "ISO", "totalDays": 1,
//         "reason": "string", "attachmentUrl": "string",
//         "status": "pending" | "approved" | "rejected" | "cancelled" | string,
//         "decidedBy": "string" | null, "decidedAt": "ISO" | null, "decisionNote": "string",
//         "source": "staffRequest" | string, "recordedByUserId": "string" | null,
//         "createdBy": "string", "createdAt": "ISO", "updatedAt": "ISO",
//         "staff": { "_id": "string", "employeeCode": "string", "name": "string", "email": "string" },
//         "branch": { "_id": "string", "name": "string", "code": "string", "status": "string" }
//       }
//     ],
//     "meta": { "currentPage": 1, "totalPages": 1, "totalRecords": 1, "limit": 10 }
//   }
//   TODO: confirm whether the list endpoint supports `status` / `keyword` params.
//
// PUT  /admin/organizations/:organizationId/leave-entitlements
//   request:  { "staffId": "string", "year": "2026-2027", "leaveType": "annual", "entitlementDays": 24 }
//   response: { "message": "string", "data": LeaveEntitlement }
//
// POST /admin/leave-approvals/:leaveRequestId/approve
//   header:   x-org-id: <organizationId>
//   response: { "message": "string", "data": LeaveRequest }
//
// TODO: confirm whether a `GET /admin/leave-requests/:id` endpoint exists for the
// detail screen (currently the detail view reads from the list result).
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({ type: 'LeaveRequest', id: `LIST-${organizationId}` });

export const leaveRequestsApi = createApi({
  reducerPath: 'leaveRequestsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['LeaveRequest', 'LeaveEntitlement'],
  endpoints: (builder) => ({
    getLeaveRequests: builder.query({
      query: ({ organizationId, page = 1, limit = 10, status }) => ({
        url: API_ROUTES.ORGANIZATION_LEAVE_REQUESTS(organizationId),
        method: 'GET',
        params: { page, limit, ...(status && status !== 'all' ? { status } : {}) },
      }),
      transformResponse: (res) => ({ data: res?.data ?? [], meta: res?.meta ?? {} }),
      providesTags: (result, error, { organizationId }) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'LeaveRequest', id: _id })),
              listTag(organizationId),
            ]
          : [listTag(organizationId)],
    }),

    setLeaveEntitlement: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_LEAVE_ENTITLEMENTS(organizationId),
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { organizationId }) => [
        { type: 'LeaveEntitlement', id: `LIST-${organizationId}` },
        listTag(organizationId),
      ],
    }),

    approveLeaveRequest: builder.mutation({
      query: ({ leaveRequestId, organizationId }) => ({
        url: API_ROUTES.LEAVE_APPROVAL_APPROVE(leaveRequestId),
        method: 'POST',
        headers: { 'x-org-id': organizationId },
      }),
      invalidatesTags: (result, error, { leaveRequestId, organizationId }) => [
        { type: 'LeaveRequest', id: leaveRequestId },
        ...(organizationId ? [listTag(organizationId)] : []),
      ],
    }),

    rejectLeaveRequest: builder.mutation({
      query: ({ leaveRequestId, organizationId, decisionNote }) => ({
        url: API_ROUTES.LEAVE_APPROVAL_REJECT(leaveRequestId),
        method: 'POST',
        headers: { 'x-org-id': organizationId },
        body: decisionNote ? { decisionNote } : undefined,
      }),
      invalidatesTags: (result, error, { leaveRequestId, organizationId }) => [
        { type: 'LeaveRequest', id: leaveRequestId },
        ...(organizationId ? [listTag(organizationId)] : []),
      ],
    }),
  }),
});

export const {
  useGetLeaveRequestsQuery,
  useSetLeaveEntitlementMutation,
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
} = leaveRequestsApi;
