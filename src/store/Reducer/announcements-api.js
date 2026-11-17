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
  }),
});

export const { useGetAnnouncementsQuery, useCreateAnnouncementMutation } = announcementsApi;
