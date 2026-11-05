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
//     "meta": { "currentPage": 1, "totalPages": 1, "totalRecords": 1, "limit": 10, "counts": { pending, approved, rejected, cancelled, closed } }
//   }
//
// PUT  /admin/organizations/:organizationId/leave-entitlements
//   request:  { "staffId": "string", "year": "2026-2027", "leaveType": "annual", "entitlementDays": 24 }
//   response: { "message": "string", "data": LeaveEntitlement }
//
// GET  /admin/leave-requests/:leaveRequestId
//   response: { "message": "string", "data": LeaveRequest }
//
// POST /admin/leave-approvals/:leaveRequestId/approve
//   header:   x-org-id: <organizationId>
//   response: { "message": "string", "data": LeaveRequest }
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({ type: 'LeaveRequest', id: `LIST-${organizationId}` });
const staffListTag = (organizationId) => ({
  type: 'LeaveRequest',
  id: `STAFF-LIST-${organizationId || 'UNSCOPED'}`,
});

export const leaveRequestsApi = createApi({
  reducerPath: 'leaveRequestsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['LeaveRequest', 'LeaveEntitlement'],
  endpoints: (builder) => ({
    createStaffLeaveRequest: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.STAFF_LEAVE_REQUESTS,
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId }) =>
        result && organizationId ? [staffListTag(organizationId)] : [],
    }),

    getStaffLeaveRequests: builder.query({
      query: ({ organizationId, page = 1, limit = 10, status, keyword } = {}) => ({
        url: API_ROUTES.STAFF_LEAVE_REQUESTS,
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(typeof keyword === 'string' && keyword.trim()
            ? { keyword: keyword.trim() }
            : {}),
        },
      }),
      transformResponse: (res) => ({
        requests: Array.isArray(res?.data?.requests) ? res.data.requests : [],
        summary: res?.data?.summary ?? {},
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId } = {}) =>
        result?.requests
          ? [
              ...result.requests
                .filter((request) => request?._id)
                .map(({ _id }) => ({ type: 'LeaveRequest', id: _id })),
              staffListTag(organizationId),
            ]
          : [staffListTag(organizationId)],
    }),

    getLeaveRequests: builder.query({
      query: ({ organizationId, page = 1, limit = 10, status, keyword, branchId }) => {
        const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

        return {
          url: API_ROUTES.ORGANIZATION_LEAVE_REQUESTS(organizationId),
          method: 'GET',
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
          params: {
            page,
            limit,
            ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
            ...(status && status !== 'all' ? { status } : {}),
            ...(branchId && branchId !== 'all' ? { branchId } : {}),
          },
        };
      },
      transformResponse: (res) => ({ data: res?.data ?? [], meta: res?.meta ?? {} }),
      providesTags: (result, error, { organizationId }) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'LeaveRequest', id: _id })),
              listTag(organizationId),
            ]
          : [listTag(organizationId)],
    }),

    getLeaveRequest: builder.query({
      query: ({ leaveRequestId, organizationId }) => ({
        url: API_ROUTES.LEAVE_REQUEST_BY_ID(leaveRequestId),
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { leaveRequestId }) => [{ type: 'LeaveRequest', id: leaveRequestId }],
    }),

    setLeaveEntitlement: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_LEAVE_ENTITLEMENTS(organizationId),
        method: 'PUT',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
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
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
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
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
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
  useCreateStaffLeaveRequestMutation,
  useGetStaffLeaveRequestsQuery,
  useGetLeaveRequestsQuery,
  useGetLeaveRequestQuery,
  useSetLeaveEntitlementMutation,
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
} = leaveRequestsApi;
