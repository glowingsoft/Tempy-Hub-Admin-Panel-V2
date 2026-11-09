import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Reports API
// ----------------------------------------------------------------------

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: [
    'AttendanceReport',
    'StaffHoursReport',
    'VisitorCheckInsReport',
    'SicknessRateReport',
    'LateCheckInsReport',
  ],
  endpoints: (builder) => ({
    getAttendanceReport: builder.query({
      query: ({
        organizationId,
        branchId,
        page = 1,
        limit = 10,
        from,
        to,
        departmentId,
        periodPreset,
      } = {}) => ({
        url: API_ROUTES.REPORTS_ATTENDANCE(organizationId),
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: {
          page,
          limit,
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
          ...(departmentId && departmentId !== 'all' ? { departmentId } : {}),
          ...(periodPreset && periodPreset !== 'custom' ? { periodPreset, preset: periodPreset } : {}),
        },
      }),
      providesTags: (result, error, { organizationId, branchId }) => [
        { type: 'AttendanceReport', id: `${organizationId}-${branchId || 'ALL'}` },
      ],
    }),

    getStaffHoursReport: builder.query({
      query: ({
        organizationId,
        branchId,
        page = 1,
        limit = 10,
        from,
        to,
        departmentId,
        periodPreset,
      } = {}) => ({
        url: API_ROUTES.REPORTS_STAFF_HOURS_SUMMARY(organizationId),
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: {
          page,
          limit,
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
          ...(departmentId && departmentId !== 'all' ? { departmentId } : {}),
          ...(periodPreset && periodPreset !== 'custom' ? { periodPreset, preset: periodPreset } : {}),
        },
      }),
      providesTags: (result, error, { organizationId, branchId }) => [
        { type: 'StaffHoursReport', id: `${organizationId}-${branchId || 'ALL'}` },
      ],
    }),

    getVisitorCheckInsReport: builder.query({
      query: ({
        organizationId,
        branchId,
        page = 1,
        limit = 10,
        from,
        to,
        departmentId,
        periodPreset,
        status,
        search,
        personType,
      } = {}) => ({
        url: API_ROUTES.REPORTS_VISITOR_CHECK_INS(organizationId),
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: {
          page,
          limit,
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
          ...(departmentId && departmentId !== 'all' ? { departmentId } : {}),
          ...(periodPreset && periodPreset !== 'custom' ? { periodPreset, preset: periodPreset } : {}),
          ...(status && status !== 'all' ? { status } : {}),
          ...(search ? { search, keyword: search } : {}),
          ...(personType && personType !== 'all' ? { personType, userType: personType } : {}),
        },
      }),
      providesTags: (result, error, { organizationId, branchId }) => [
        { type: 'VisitorCheckInsReport', id: `${organizationId}-${branchId || 'ALL'}` },
      ],
    }),

    getSicknessRateReport: builder.query({
      query: ({
        organizationId,
        branchId,
        page = 1,
        limit = 20,
        from,
        to,
        departmentId,
        periodPreset,
      } = {}) => ({
        url: API_ROUTES.REPORTS_SICKNESS_RATE(organizationId),
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: {
          page,
          limit,
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
          ...(departmentId && departmentId !== 'all' ? { departmentId } : {}),
          ...(periodPreset && periodPreset !== 'custom' ? { periodPreset, preset: periodPreset } : {}),
        },
      }),
      providesTags: (result, error, { organizationId, branchId }) => [
        { type: 'SicknessRateReport', id: `${organizationId}-${branchId || 'ALL'}` },
      ],
    }),

    getLateCheckInsReport: builder.query({
      query: ({
        organizationId,
        branchId,
        page = 1,
        limit = 10,
        from,
        to,
        departmentId,
        periodPreset,
        status,
        search,
        personType,
      } = {}) => ({
        url: API_ROUTES.REPORTS_LATE_CHECK_INS(organizationId),
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: {
          page,
          limit,
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
          ...(departmentId && departmentId !== 'all' ? { departmentId } : {}),
          ...(periodPreset && periodPreset !== 'custom' ? { periodPreset, preset: periodPreset } : {}),
          ...(status && status !== 'all' ? { status } : {}),
          ...(search ? { search, keyword: search } : {}),
          ...(personType && personType !== 'all' ? { personType, userType: personType } : {}),
        },
      }),
      providesTags: (result, error, { organizationId, branchId }) => [
        { type: 'LateCheckInsReport', id: `${organizationId}-${branchId || 'ALL'}` },
      ],
    }),
  }),
});

export const {
  useGetAttendanceReportQuery,
  useGetStaffHoursReportQuery,
  useGetVisitorCheckInsReportQuery,
  useGetSicknessRateReportQuery,
  useGetLateCheckInsReportQuery,
} = reportsApi;

