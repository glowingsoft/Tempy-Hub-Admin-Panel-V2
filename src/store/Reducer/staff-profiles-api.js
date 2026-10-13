import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Staff Profiles API
//
// A staff profile links a user to an organization with a branch, job title,
// departments, a start date and a PIN. This is a SEPARATE resource from members
// and invitations — the flows do not share data or endpoints.
//
// List + create are organization-scoped; read + update address a staff profile
// directly by its id.
//
// GET  /admin/organizations/:organizationId/staff-profiles?page=1&limit=10
//   response:
//   {
//     "message": "Data fetched successfully",
//     "data": [
//       {
//         "_id": "string",                 // staffProfileId
//         "organizationId": "string",
//         "userId": "string",
//         "user": { "_id": "string", "name": "string", "email": "string" } | null,
//         "branchId": "string" | null,
//         "branch": { "_id": "string", "name": "string" } | null,
//         "jobTitleId": "string" | null,
//         "jobTitle": { "_id": "string", "name": "string" } | null,
//         "departmentIds": ["string"],
//         "departments": [{ "_id": "string", "name": "string" }],
//         "startDate": "ISO",
//         "pin": "4321",
//         "createdAt": "ISO",
//         "updatedAt": "ISO"
//         // TODO: confirm whether the API returns a `status` field for staff profiles.
//       }
//     ],
//     "meta": { "currentPage": 1, "totalPages": 1, "totalRecords": 1, "limit": 10 }
//   }
//   TODO: confirm whether the list endpoint supports a `keyword` / search param.
//
// GET  /admin/staff-profiles/:staffProfileId   -> { "message": "string", "data": StaffProfile }
//
// POST /admin/organizations/:organizationId/staff-profiles
//   request:
//   {
//     "userId": "string", "branchId": "string", "jobTitleId": "string",
//     "departmentIds": ["string"], "startDate": "2026-01-15T00:00:00.000Z", "pin": "4321"
//   }
//   response: { "message": "string", "data": StaffProfile }
//
// PUT  /admin/staff-profiles/:staffProfileId
//   request:  Partial<create payload> (branchId, jobTitleId, departmentIds, startDate, pin)
//   response: { "message": "string", "data": StaffProfile }
//   TODO: confirm whether update is PUT or PATCH.
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({ type: 'StaffProfile', id: `LIST-${organizationId}` });

export const staffProfilesApi = createApi({
  reducerPath: 'staffProfilesApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['StaffProfile'],

  endpoints: (builder) => ({
    getStaffProfiles: builder.query({
      query: ({ organizationId, page = 1, limit = 10, keyword }) => ({
        url: API_ROUTES.ORGANIZATION_STAFF_PROFILES(organizationId),
        method: 'GET',
        params: {
          page,
          limit,
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
            ...result.data.map(({ _id }) => ({ type: 'StaffProfile', id: _id })),
            listTag(organizationId),
          ]
          : [listTag(organizationId)],
    }),

    getStaffProfile: builder.query({
      query: (arg) => {
        const staffProfileId = typeof arg === 'string' ? arg : arg?.staffProfileId;
        const organizationId = typeof arg === 'object' ? arg?.organizationId : undefined;

        return {
          url: API_ROUTES.STAFF_PROFILE_BY_ID(staffProfileId),
          method: 'GET',
          params: organizationId ? { organizationId } : undefined,
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        };
      },
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, arg) => {
        const staffProfileId = typeof arg === 'string' ? arg : arg?.staffProfileId;
        return [{ type: 'StaffProfile', id: staffProfileId }];
      },
    }),

    createStaffProfile: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_STAFF_PROFILES(organizationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId }) => [listTag(organizationId)],
    }),

    updateStaffProfile: builder.mutation({
      query: ({ staffProfileId, organizationId, ...body }) => ({
        url: API_ROUTES.STAFF_PROFILE_BY_ID(staffProfileId),
        method: 'PATCH',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { staffProfileId, organizationId }) => [
        { type: 'StaffProfile', id: staffProfileId },
        ...(organizationId ? [listTag(organizationId)] : []),
      ],
    }),
  }),
});

export const {
  useGetStaffProfilesQuery,
  useGetStaffProfileQuery,
  useCreateStaffProfileMutation,
  useUpdateStaffProfileMutation,
} = staffProfilesApi;
