import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Attendance API
//
// 1. GET  /admin/organizations/:organizationId/attendance?page=1&limit=10
//    Lists attendance days for an organization with optional status, dateRange,
//    branchId, and search filters.
//
// 2. GET  /admin/attendance/:attendanceDayId
//    Fetches a single attendance day record by ID with full clock in/out,
//    breaks breakdown, and geo/event metadata.
//
// 3. GET  /admin/organizations/:organizationId/attendance-change-requests
//    Lists staff-submitted attendance time adjustment and change requests
//    for organization approval.
// ----------------------------------------------------------------------

export function extractRecordsArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.attendance)) return payload.attendance;
  if (Array.isArray(payload.records)) return payload.records;
  if (Array.isArray(payload.docs)) return payload.docs;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.attendanceDays)) return payload.attendanceDays;
  if (Array.isArray(payload.attendanceRecords)) return payload.attendanceRecords;
  if (Array.isArray(payload.changeRequests)) return payload.changeRequests;
  if (Array.isArray(payload.list)) return payload.list;

  if (payload.data && typeof payload.data === 'object') {
    const fromNestedData = extractRecordsArray(payload.data);
    if (Array.isArray(fromNestedData) && fromNestedData.length) return fromNestedData;
  }

  for (const key of Object.keys(payload)) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  return [];
}

export function extractMeta(payload, fallbackLength = 0) {
  const meta = payload?.meta || payload?.data?.meta || payload?.pagination;
  if (meta && typeof meta === 'object') return meta;
  const total =
    payload?.total ??
    payload?.data?.total ??
    payload?.totalRecords ??
    payload?.data?.totalRecords ??
    payload?.totalDocs ??
    payload?.data?.totalDocs ??
    fallbackLength;
  return { totalRecords: total, totalPages: Math.ceil(total / 10) || 1, currentPage: 1 };
}

const listTag = (organizationId) => ({ type: 'Attendance', id: `LIST-${organizationId}` });
const changeRequestsListTag = (organizationId) => ({
  type: 'AttendanceChangeRequest',
  id: `LIST-${organizationId}`,
});

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Attendance', 'AttendanceChangeRequest'],
  endpoints: (builder) => ({
    getOrganizationAttendance: builder.query({
      query: ({
        organizationId,
        page = 1,
        limit = 10,
        status,
        search,
        startDate,
        endDate,
        branchId,
        ...otherParams
      } = {}) => ({
        url: API_ROUTES.ORGANIZATION_ATTENDANCE(organizationId),
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(search ? { search } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...otherParams,
        },
      }),
      transformResponse: (res) => {
        const data = extractRecordsArray(res);
        return {
          data,
          meta: extractMeta(res, data.length),
        };
      },
      providesTags: (result, error, { organizationId }) =>
        result?.data && Array.isArray(result.data)
          ? [
              ...result.data
                .filter((item) => item?._id)
                .map(({ _id }) => ({ type: 'Attendance', id: _id })),
              listTag(organizationId),
            ]
          : [listTag(organizationId)],
    }),

    getAttendanceById: builder.query({
      query: (attendanceDayId) => ({
        url: API_ROUTES.ATTENDANCE_BY_ID(attendanceDayId),
        method: 'GET',
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, attendanceDayId) => [
        { type: 'Attendance', id: attendanceDayId },
      ],
    }),

    getAttendanceChangeRequests: builder.query({
      query: ({
        organizationId,
        page = 1,
        limit = 10,
        status,
        search,
        ...otherParams
      } = {}) => ({
        url: API_ROUTES.ORGANIZATION_ATTENDANCE_CHANGE_REQUESTS(organizationId),
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(search ? { search } : {}),
          ...otherParams,
        },
      }),
      transformResponse: (res) => {
        const data = extractRecordsArray(res);
        return {
          data,
          meta: extractMeta(res, data.length),
        };
      },
      providesTags: (result, error, { organizationId }) =>
        result?.data && Array.isArray(result.data)
          ? [
              ...result.data
                .filter((item) => item?._id)
                .map(({ _id }) => ({ type: 'AttendanceChangeRequest', id: _id })),
              changeRequestsListTag(organizationId),
            ]
          : [changeRequestsListTag(organizationId)],
    }),
  }),
});

export const {
  useGetOrganizationAttendanceQuery,
  useGetAttendanceByIdQuery,
  useGetAttendanceChangeRequestsQuery,
} = attendanceApi;