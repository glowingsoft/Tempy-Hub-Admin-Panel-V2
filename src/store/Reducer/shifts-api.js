import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Shifts API (Rota)
//
// A shift belongs to an organization and a branch, and may be assigned to a
// staff member or left open/unassigned. List + create are organization-scoped;
// read + update address a shift directly by its id.
//
// GET  /admin/organizations/:organizationId/shifts?page=1&limit=10
//   response:
//   {
//     "message": "string",
//     "data": [
//       {
//         "_id": "string", "organizationId": "string", "branchId": "string",
//         "staffId": "string" | null,
//         "startsAt": "ISO", "endsAt": "ISO",
//         "status": "open" | "filled" | "cancelled" | string,
//         "visibility": "branch" | string, "urgentCover": false,
//         "openedAt": "ISO" | null, "filledAt": "ISO" | null, "filledByClaimId": "string" | null,
//         "createdAt": "ISO", "updatedAt": "ISO",
//         "branch": { "_id": "string", "name": "string", "code": "string", "status": "string" },
//         "staff": { ...staff } | null
//       }
//     ],
//     "meta": { "currentPage": 1, "totalPages": 1, "totalRecords": 3, "limit": 10 }
//   }
//
// GET  /admin/shifts/:shiftId            -> { "message": "string", "data": Shift }
//
// POST /admin/organizations/:organizationId/shifts
//   request: { "branchId": "string", "startsAt": "ISO", "endsAt": "ISO", "staffId": "string" | undefined }
//   response: { "message": "string", "data": Shift }
//
// PUT  /admin/shifts/:shiftId
//   request:  Partial<create payload> (branchId, staffId, startsAt, endsAt)
//   response: { "message": "string", "data": Shift }
//
// GET  /app/shifts/my?keyword=... -> {
//   "message": "string", "data": Shift[],
//   "meta": { "totalRecords": 2, "counts": { "scheduled": 2, "cancelled": 0, "completed": 0 } }
// }
// GET  /app/shifts/open?keyword=... -> { "message": "string", "data": Shift[] }
// POST /app/shifts/:shiftId/claims
//   request: { "note": "string" }
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({ type: 'Shift', id: `LIST-${organizationId}` });
const staffListTag = (listType, organizationId) => ({
    type: 'Shift',
    id: `STAFF-${listType}-${organizationId || 'UNSCOPED'}`,
});

export const shiftsApi = createApi({
    reducerPath: 'shiftsApi',
    baseQuery: createCustomFetchBaseQuery(),
    tagTypes: ['Shift'],
    endpoints: (builder) => ({
        getShifts: builder.query({
            query: ({ organizationId, page = 1, limit = 10, status, keyword }) => {
                const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

                return {
                    url: API_ROUTES.ORGANIZATION_SHIFTS(organizationId),
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
                    ? [...result.data.map(({ _id }) => ({ type: 'Shift', id: _id })), listTag(organizationId)]
                    : [listTag(organizationId)],
        }),
        getShift: builder.query({
            query: (arg) => {
                const shiftId = typeof arg === 'string' ? arg : arg?.shiftId;
                const organizationId = typeof arg === 'object' ? arg?.organizationId : undefined;
                return {
                    url: API_ROUTES.SHIFT_BY_ID(shiftId),
                    method: 'GET',
                    params: organizationId ? { organizationId } : undefined,
                    headers: organizationId ? { 'x-org-id': organizationId } : undefined,
                };
            },
            transformResponse: (res) => res?.data ?? res,
            providesTags: (result, error, arg) => {
                const shiftId = typeof arg === 'string' ? arg : arg?.shiftId;
                return [{ type: 'Shift', id: shiftId }];
            },
        }),
        createShift: builder.mutation({
            query: ({ organizationId, ...body }) => ({
                url: API_ROUTES.ORGANIZATION_SHIFTS(organizationId),
                method: 'POST',
                headers: organizationId ? { 'x-org-id': organizationId } : undefined,
                body,
            }),
            transformResponse: (res) => res?.data ?? res,
            invalidatesTags: (result, error, { organizationId }) => [listTag(organizationId)],
        }),
        updateShift: builder.mutation({
            // `organizationId` is only used for cache invalidation & headers, keep it out of the body.
            query: ({ shiftId, organizationId, ...body }) => ({
                url: API_ROUTES.SHIFT_BY_ID(shiftId),
                method: 'PATCH',
                params: organizationId ? { organizationId } : undefined,
                headers: organizationId ? { 'x-org-id': organizationId } : undefined,
                body,
            }),
            transformResponse: (res) => res?.data ?? res,
            invalidatesTags: (result, error, { shiftId, organizationId }) => [
                { type: 'Shift', id: shiftId },
                ...(organizationId ? [listTag(organizationId)] : []),
            ],
        }),
        getMyShifts: builder.query({
            query: ({ organizationId, keyword, status } = {}) => {
                const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';
                const trimmedStatus = typeof status === 'string' ? status.trim() : '';

                return {
                    url: API_ROUTES.STAFF_MY_SHIFTS,
                    method: 'GET',
                    headers: organizationId ? { 'x-org-id': organizationId } : undefined,
                    params: {
                        ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
                        ...(trimmedStatus && trimmedStatus !== 'all' ? { status: trimmedStatus } : {}),
                    },
                };
            },
            transformResponse: (res) => ({
                data: Array.isArray(res?.data) ? res.data : [],
                meta: res?.meta ?? {},
            }),
            providesTags: (result, error, { organizationId } = {}) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: 'Shift', id: _id })),
                        staffListTag('MY', organizationId),
                    ]
                    : [staffListTag('MY', organizationId)],
        }),
        getOpenShifts: builder.query({
            query: ({ organizationId, keyword } = {}) => {
                const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

                return {
                    url: API_ROUTES.STAFF_OPEN_SHIFTS,
                    method: 'GET',
                    headers: organizationId ? { 'x-org-id': organizationId } : undefined,
                    params: trimmedKeyword ? { keyword: trimmedKeyword } : undefined,
                };
            },
            transformResponse: (res) => ({
                data: Array.isArray(res?.data) ? res.data : [],
                meta: res?.meta ?? {},
            }),
            providesTags: (result, error, { organizationId } = {}) =>
                result?.data
                    ? [
                        ...result.data.map(({ _id }) => ({ type: 'Shift', id: _id })),
                        staffListTag('OPEN', organizationId),
                    ]
                    : [staffListTag('OPEN', organizationId)],
        }),
        claimStaffShift: builder.mutation({
            query: ({ shiftId, note, organizationId }) => ({
                url: API_ROUTES.STAFF_SHIFT_CLAIMS(shiftId),
                method: 'POST',
                headers: organizationId ? { 'x-org-id': organizationId } : undefined,
                body: { note },
            }),
            invalidatesTags: (result, error, { shiftId, organizationId }) => [
                { type: 'Shift', id: shiftId },
                staffListTag('OPEN', organizationId),
            ],
        }),
    }),
});

export const {
    useGetShiftsQuery,
    useGetShiftQuery,
    useCreateShiftMutation,
    useUpdateShiftMutation,
    useGetMyShiftsQuery,
    useGetOpenShiftsQuery,
    useClaimStaffShiftMutation,
} = shiftsApi;
