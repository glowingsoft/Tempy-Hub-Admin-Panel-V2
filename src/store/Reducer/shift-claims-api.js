import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Shift Claims API (Rota)
//
// A shift claim is a request/record for covering a shift. Kept SEPARATE from the
// shifts flow (own slice, own tag). List is organization-scoped; read + approve
// address a claim directly by its id.
//
// GET  /admin/organizations/:organizationId/shift-claims?page=1&limit=10
//   response:
//   {
//     "message": "string",
//     "data": [
//       {
//         "_id": "string", "organizationId": "string", "branchId": "string",
//         "staffId": "string" | null,
//         "startsAt": "ISO", "endsAt": "ISO",
//         "status": "open" | "scheduled" | string,
//         "visibility": "branch" | string, "urgentCover": false,
//         "openedAt": "ISO" | null, "filledAt": "ISO" | null, "filledByClaimId": "string" | null,
//         "createdAt": "ISO", "updatedAt": "ISO",
//         "branch": { "_id": "string", "name": "string", "code": "string", "status": "string" },
//         "staff": { "_id": "string", "employeeCode": "string", "name": "string", "email": "string" } | null
//       }
//     ],
//     "meta": { "currentPage": 1, "totalPages": 1, "totalRecords": 1, "limit": 10, "counts": { pending, approved, rejected, withdrawn } }
//   }
//   TODO: confirm the real shift-claim `status` enum (sample shows "open" / "scheduled").
//   TODO: confirm whether the list endpoint supports `status` / `keyword` params.
//
// GET  /admin/organizations/:organizationId/shift-claims/:claimId
//   response: { "message": "string", "data": ShiftClaim }
//
// POST /admin/shift-claims/:shiftClaimId/approve
//   -> { "message": "string", "data": ShiftClaim }
//   TODO: confirm the approve response shape (assumed to return the updated claim).
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({ type: 'ShiftClaim', id: `LIST-${organizationId}` });

export const shiftClaimsApi = createApi({
  reducerPath: 'shiftClaimsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['ShiftClaim'],
  endpoints: (builder) => ({
    getShiftClaims: builder.query({
      query: ({ organizationId, page = 1, limit = 10, status, keyword }) => {
        const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

        return {
          url: API_ROUTES.ORGANIZATION_SHIFT_CLAIMS(organizationId),
          method: 'GET',
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
          params: {
            page,
            limit,
            ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
            ...(status && status !== 'all' ? { status } : {}),
          },
        };
      },
      transformResponse: (res) => ({ data: res?.data ?? [], meta: res?.meta ?? {} }),
      providesTags: (result, error, { organizationId }) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'ShiftClaim', id: _id })),
              listTag(organizationId),
            ]
          : [listTag(organizationId)],
    }),

    getShiftClaim: builder.query({
      query: ({ shiftClaimId, organizationId }) => ({
        url: API_ROUTES.ORGANIZATION_SHIFT_CLAIM_BY_ID(organizationId, shiftClaimId),
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { shiftClaimId }) => [{ type: 'ShiftClaim', id: shiftClaimId }],
    }),

    approveShiftClaim: builder.mutation({
      query: ({ shiftClaimId, organizationId }) => ({
        url: API_ROUTES.SHIFT_CLAIM_APPROVE(shiftClaimId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { shiftClaimId, organizationId }) => [
        { type: 'ShiftClaim', id: shiftClaimId },
        ...(organizationId ? [listTag(organizationId)] : []),
      ],
    }),
  }),
});

export const {
  useGetShiftClaimsQuery,
  useGetShiftClaimQuery,
  useApproveShiftClaimMutation,
} = shiftClaimsApi;
