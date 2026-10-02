import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Job Titles API
//
// A job title belongs to an organization (and optionally a branch). All
// endpoints are scoped by `:organizationId` in the URL.
//
// GET  /admin/organizations/:organizationId/job-titles?page=1&limit=10
//   response:
//   {
//     "message": "Data fetched successfully",
//     "data": [
//       {
//         "_id": "string",
//         "organizationId": "string",
//         "branchId": null | "string",
//         "name": "Head Chef",
//         "level": "siteManagement",
//         "active": true,
//         "nameKey": "head chef",
//         "createdAt": "ISO",
//         "updatedAt": "ISO",
//         "__v": 0,
//         "organization": { "_id": "string", "name": "string", "status": "string" },
//         "branch": null | { "_id": "string", "name": "string" }
//       }
//     ],
//     "meta": { "currentPage": 1, "totalPages": 1, "totalRecords": 1, "limit": 10 }
//   }
//
// POST /admin/organizations/:organizationId/job-titles
//   request:  { "name": "Head Chef", "level": "siteManagement", "branchId"?: string }
//   response: { "message": "string", "data": JobTitle }
//
// PATCH /admin/organizations/:organizationId/job-titles/:jobTitleId
//   request:  { "name"?: string, "level"?: string, "active"?: boolean, "branchId"?: string | null }
//   response: { "message": "string", "data": JobTitle }
//   (PATCH shape assumed — align with the backend when wired.)
// ----------------------------------------------------------------------

export const jobTitlesApi = createApi({
  reducerPath: 'jobTitlesApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['JobTitle'],

  endpoints: (builder) => ({
    getJobTitles: builder.query({
      query: ({ organizationId, page = 1, limit = 10 }) => ({
        url: API_ROUTES.ORGANIZATION_JOB_TITLES(organizationId),
        method: 'GET',
        params: { page, limit },
      }),
      transformResponse: (res) => ({
        data: res?.data ?? [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId }) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'JobTitle', id: _id })),
              { type: 'JobTitle', id: `LIST-${organizationId}` },
            ]
          : [{ type: 'JobTitle', id: `LIST-${organizationId}` }],
    }),

    getJobTitle: builder.query({
      query: ({ organizationId, jobTitleId }) => ({
        url: API_ROUTES.ORGANIZATION_JOB_TITLE_BY_ID(organizationId, jobTitleId),
        method: 'GET',
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { jobTitleId }) => [{ type: 'JobTitle', id: jobTitleId }],
    }),

    createJobTitle: builder.mutation({
      query: ({ organizationId, name, level, branchId }) => ({
        url: API_ROUTES.ORGANIZATION_JOB_TITLES(organizationId),
        method: 'POST',
        body: { name, level, ...(branchId ? { branchId } : {}) },
      }),
      invalidatesTags: (result, error, { organizationId }) => [
        { type: 'JobTitle', id: `LIST-${organizationId}` },
      ],
    }),

    updateJobTitle: builder.mutation({
      query: ({ organizationId, jobTitleId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_JOB_TITLE_BY_ID(organizationId, jobTitleId),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { organizationId, jobTitleId }) => [
        { type: 'JobTitle', id: jobTitleId },
        { type: 'JobTitle', id: `LIST-${organizationId}` },
      ],
    }),
  }),
});

export const {
  useGetJobTitlesQuery,
  useGetJobTitleQuery,
  useCreateJobTitleMutation,
  useUpdateJobTitleMutation,
} = jobTitlesApi;
