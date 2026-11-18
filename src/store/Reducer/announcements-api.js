import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------

export const announcementsApi = createApi({
  reducerPath: 'announcementsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Announcements'],
  endpoints: (builder) => ({
    getAnnouncements: builder.query({
      query: ({ page = 1, limit = 10, branchId, keyword, organizationId }) => ({
        url: API_ROUTES.ADMIN_ANNOUNCEMENTS,
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: {
          page,
          limit,
          ...(branchId ? { branchId } : {}),
          ...(keyword && typeof keyword === 'string' && keyword.trim()
            ? { keyword: keyword.trim() }
            : {}),
        },
      }),
      transformResponse: (res) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Announcements', id: _id })),
              { type: 'Announcements', id: 'LIST' },
            ]
          : [{ type: 'Announcements', id: 'LIST' }],
    }),

    createAnnouncement: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ADMIN_ANNOUNCEMENTS,
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      invalidatesTags: [{ type: 'Announcements', id: 'LIST' }],
    }),

    getStaffAnnouncements: builder.query({
      query: ({ page = 1, limit = 10, keyword, organizationId } = {}) => ({
        url: API_ROUTES.APP_ANNOUNCEMENTS_MINE,
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: {
          page,
          limit,
          ...(keyword && typeof keyword === 'string' && keyword.trim()
            ? { keyword: keyword.trim() }
            : {}),
        },
      }),
      transformResponse: (res) => ({
        data: Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []),
        meta: res?.meta ?? {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id, id }) => ({ type: 'Announcements', id: _id || id })),
              { type: 'Announcements', id: 'STAFF_LIST' },
            ]
          : [{ type: 'Announcements', id: 'STAFF_LIST' }],
    }),

    getStaffAnnouncementDetail: builder.query({
      query: ({ announcementId, organizationId }) => ({
        url: API_ROUTES.APP_ANNOUNCEMENT_MINE_DETAIL(announcementId),
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { announcementId }) => [
        { type: 'Announcements', id: announcementId },
      ],
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useGetStaffAnnouncementsQuery,
  useGetStaffAnnouncementDetailQuery,
  useCreateAnnouncementMutation,
} = announcementsApi;
