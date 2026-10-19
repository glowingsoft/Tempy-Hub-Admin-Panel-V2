import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Residents API
//
// POST /admin/residents
//   request:
//   {
//     "name": "James Taylor",
//     "roomNumber": "106",
//     "branchId": "string",
//     "email": "james.taylor@example.com",
//     "phone": "+447700900001",
//     "careLevel": "low" | "medium" | "high",
//     "admissionStatus": "admitted" | "pending" | "discharged",
//     "visitorPasscode": "PASS-1098"
//   }
//   response: { "message": "string", "data": Resident }
//
// PATCH /admin/residents/:residentId
//   request: { "careLevel": "low" | "medium" | "high", "roomNumber": "string", "admissionStatus": "admitted" | "pending" | "discharged" }
//   response: { "message": "string", "data": Resident }
//
// PUT /admin/residents/:residentId/visitor-passcode
//   request: { "visitorPasscode": "string" }
//   response: { "message": "string", "data": Resident }
//
// POST /admin/residents/:residentId/verify-passcode
//   request: { "visitorPasscode": "string" }
//
// GET /admin/residents?page=1&limit=10&keyword=&branchId=&admissionStatus=
//   response: { "message": "string", "data": Resident[], "meta": { currentPage, totalPages, totalRecords, limit, admitted, discharged } }
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({
  type: 'Resident',
  id: organizationId ? `LIST-${organizationId}` : 'LIST',
});

export const residentsApi = createApi({
  reducerPath: 'residentsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Resident'],

  endpoints: (builder) => ({
    getResidents: builder.query({
      query: ({ organizationId, ...params } = {}) => ({
        url: API_ROUTES.RESIDENTS,
        params,
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => ({ data: res?.data ?? [], meta: res?.meta ?? {} }),
      providesTags: (result, error, { organizationId } = {}) => [
        ...(result?.data?.map(({ _id }) => ({ type: 'Resident', id: _id })) ?? []),
        listTag(organizationId),
      ],
    }),

    getResident: builder.query({
      query: (arg) => {
        const residentId = typeof arg === 'string' ? arg : arg?.residentId;
        const organizationId = typeof arg === 'object' ? arg?.organizationId : undefined;
        return {
          url: API_ROUTES.RESIDENT_BY_ID(residentId),
          method: 'GET',
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        };
      },
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, arg) => {
        const residentId = typeof arg === 'string' ? arg : arg?.residentId;
        return [{ type: 'Resident', id: residentId }];
      },
    }),

    createResident: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.RESIDENTS,
        method: 'POST',
        body,
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: (result, error, { organizationId } = {}) => [listTag(organizationId)],
    }),

    updateResident: builder.mutation({
      query: ({ residentId, organizationId, ...body }) => ({
        url: API_ROUTES.RESIDENT_BY_ID(residentId),
        method: 'PATCH',
        body,
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { residentId, organizationId } = {}) => [
        { type: 'Resident', id: residentId },
        listTag(organizationId),
      ],
    }),

    updateResidentVisitorPasscode: builder.mutation({
      query: ({ residentId, organizationId, visitorPasscode }) => ({
        url: API_ROUTES.RESIDENT_VISITOR_PASSCODE(residentId),
        method: 'PUT',
        body: { visitorPasscode },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { residentId, organizationId } = {}) => [
        { type: 'Resident', id: residentId },
        listTag(organizationId),
      ],
    }),

    verifyResidentPasscode: builder.mutation({
      query: ({ residentId, organizationId, visitorPasscode }) => ({
        url: API_ROUTES.RESIDENT_VERIFY_PASSCODE(residentId),
        method: 'POST',
        body: { visitorPasscode },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
    }),
  }),
});

export const {
  useGetResidentsQuery,
  useGetResidentQuery,
  useCreateResidentMutation,
  useUpdateResidentMutation,
  useUpdateResidentVisitorPasscodeMutation,
  useVerifyResidentPasscodeMutation,
} = residentsApi;
