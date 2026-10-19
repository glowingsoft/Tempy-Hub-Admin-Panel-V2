import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Branches API
//
// A branch belongs to an organization. List + create are organization-scoped;
// read + update address a branch directly.
//
// GET  /admin/organizations/:organizationId/branches?page=1&limit=10&keyword=
//   response:
//   {
//     "message": "Data fetched successfully",
//     "data": [
//       {
//         "_id": "string",
//         "organizationId": "string",
//         "name": "Willow House",
//         "code": "WLH",
//         "timezone": "Europe/London",
//         "address": "string",
//         "status": "active" | "inactive" | "pendingActivation",
//         "assemblyPoint": "string",
//         "settings": {
//           "enableBreaks": true,
//           "lateGraceMinutes": 5,
//           "allowPhoneCheckIn": false
//         },
//         "activation": { "activatedAt": "ISO" | null, "activatedBy": "string" | null } | null,
//         "manager": {
//           "_id": "string", "name": "string", "email": "string",
//           "jobTitleId": "string", "jobTitle": { "_id": "string", "name": "string" } | null,
//           "departmentId": "string" | null, "department": { "_id": "string", "name": "string" } | null,
//           "startDate": "ISO"
//         } | null,
//         "organization": { "_id": "string", "name": "string", "status": "string" },
//         "createdAt": "ISO",
//         "updatedAt": "ISO"
//       }
//     ],
//     "meta": { "currentPage": 1, "totalPages": 1, "totalRecords": 1, "limit": 10 }
//   }
//
// GET  /admin/branches/:branchId
//   response: { "message": "string", "data": Branch }
//
// POST /admin/organizations/:organizationId/branches
//   request:
//   {
//     "name": "Willow House Test",
//     "timezone": "Europe/London",
//     "assemblyPoint": "Front car park test",
//     "settings": { "enableBreaks": true, "lateGraceMinutes": 5, "allowPhoneCheckIn": false },
//     "manager": {
//       "email": "manager@example.com", "name": "Site Manager Name",
//       "jobTitleId": "string", "departmentId": "string" | undefined,
//       "startDate": "2026-02-01T00:00:00.000Z"
//     } | undefined
//   }
//   response: { "message": "string", "data": Branch }
//
// PUT  /admin/branches/:branchId
//   request:  Partial<Branch create payload> (name, timezone, address, assemblyPoint, settings, manager)
//   response: { "message": "string", "data": Branch }
// ----------------------------------------------------------------------

export const branchesApi = createApi({
  reducerPath: 'branchesApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Branch'],

  endpoints: (builder) => ({
    getBranches: builder.query({
      query: ({ organizationId, page = 1, limit = 10, keyword, status }) => {
        const params = { page, limit };
        const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

        if (trimmedKeyword) {
          params.keyword = trimmedKeyword;
        }

        if (status) {
          params.status = status;
        }

        return {
          url: API_ROUTES.ORGANIZATION_BRANCHES(organizationId),
          method: 'GET',
          params,
        };
      },
      transformResponse: (res) => ({
        data: res?.data ?? [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId }) =>
        result?.data
          ? [
            ...result.data.map(({ _id }) => ({ type: 'Branch', id: _id })),
            { type: 'Branch', id: `LIST-${organizationId}` },
          ]
          : [{ type: 'Branch', id: `LIST-${organizationId}` }],
    }),

    getBranch: builder.query({
      query: ({ branchId, organizationId }) => ({
        url: API_ROUTES.BRANCH_BY_ID(branchId),
        method: 'GET',
        headers: { 'x-org-id': organizationId },
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { branchId }) => [{ type: 'Branch', id: branchId }],
    }),

    createBranch: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_BRANCHES(organizationId),
        method: 'POST',
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId }) => [
        { type: 'Branch', id: `LIST-${organizationId}` },
      ],
    }),

    updateBranch: builder.mutation({
      query: ({ branchId, organizationId, ...body }) => ({
        url: API_ROUTES.BRANCH_BY_ID(branchId),
        method: 'PATCH',
        headers: { 'x-org-id': organizationId },
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { branchId, organizationId }) => [
        { type: 'Branch', id: branchId },
        ...(organizationId ? [{ type: 'Branch', id: `LIST-${organizationId}` }] : []),
      ],
    }),
  }),
});

export const {
  useGetBranchesQuery,
  useGetBranchQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
} = branchesApi;
