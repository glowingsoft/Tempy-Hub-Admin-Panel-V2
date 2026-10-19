import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Departments API
//
// A department belongs to an organization. All endpoints are scoped by
// `:organizationId` in the URL.
//
// GET  /admin/organizations/:organizationId/departments?page=1&limit=10
//   response:
//   {
//     "message": "Data fetched successfully",
//     "data": [
//       {
//         "_id": "string",
//         "name": "Kitchen",
//         "sortOrder": 1,
//         "active": true,
//         "organizationId": "string",
//         "organization": { "_id": "string", "name": "string" },
//         "createdAt": "ISO",
//         "updatedAt": "ISO"
//       }
//     ],
//     "meta": { "currentPage": 1, "totalPages": 1, "totalRecords": 1, "limit": 10 }
//   }
//
// POST /admin/organizations/:organizationId/departments
//   request:  { "name": "Kitchen", "sortOrder": 1 }
//   response: { "message": "string", "data": Department }
//
// PATCH /admin/organizations/:organizationId/departments/:departmentId
//   request:  { "name"?: string, "sortOrder"?: number, "active"?: boolean, "branchId"?: string | null }
//   response: { "message": "string", "data": Department }
//   (shape assumed — align with the backend when wired.)
// ----------------------------------------------------------------------

export const departmentsApi = createApi({
  reducerPath: 'departmentsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Department'],

  endpoints: (builder) => ({
    getDepartments: builder.query({
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
          url: API_ROUTES.ORGANIZATION_DEPARTMENTS(organizationId),
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
              ...result.data.map(({ _id }) => ({ type: 'Department', id: _id })),
              { type: 'Department', id: `LIST-${organizationId}` },
            ]
          : [{ type: 'Department', id: `LIST-${organizationId}` }],
    }),

    getDepartment: builder.query({
      query: ({ organizationId, departmentId }) => ({
        url: API_ROUTES.ORGANIZATION_DEPARTMENT_BY_ID(organizationId, departmentId),
        method: 'GET',
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { departmentId }) => [
        { type: 'Department', id: departmentId },
      ],
    }),

    createDepartment: builder.mutation({
      query: ({ organizationId, name, branchId, active }) => {
        const body = { name };

        if (branchId) {
          body.branchId = branchId;
        }

        if (active !== undefined) {
          body.active = active;
        }

        return {
          url: API_ROUTES.ORGANIZATION_DEPARTMENTS(organizationId),
          method: 'POST',
          body,
        };
      },
      invalidatesTags: (result, error, { organizationId }) => [
        { type: 'Department', id: `LIST-${organizationId}` },
      ],
    }),

    updateDepartment: builder.mutation({
      query: ({ organizationId, departmentId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_DEPARTMENT_BY_ID(organizationId, departmentId),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { organizationId, departmentId }) => [
        { type: 'Department', id: departmentId },
        { type: 'Department', id: `LIST-${organizationId}` },
      ],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} = departmentsApi;
