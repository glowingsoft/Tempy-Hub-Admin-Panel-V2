import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Family uploads (moderation queue)
//
// GET  /admin/organizations/:organizationId/family-uploads?page=1&limit=10
// PUT  /admin/family/uploads/:uploadId  { action: "approve" | "reject", rejectionReason? }
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({ type: 'FamilyUpload', id: `LIST-${organizationId}` });

export const familyUploadsApi = createApi({
  reducerPath: 'familyUploadsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['FamilyUpload'],
  endpoints: (builder) => ({
    getFamilyUploads: builder.query({
      query: ({ organizationId, page = 1, limit = 10, status, keyword } = {}) => {
        const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

        return {
          url: API_ROUTES.ORGANIZATION_FAMILY_UPLOADS(organizationId),
          method: 'GET',
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
          params: {
            page,
            limit,
            ...(status && status !== 'all' ? { status } : {}),
            ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
          },
        };
      },
      transformResponse: (res) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId }) =>
        result?.data
          ? [
              ...result.data
                .filter((item) => item?.uploadId)
                .map(({ uploadId }) => ({ type: 'FamilyUpload', id: uploadId })),
              listTag(organizationId),
            ]
          : [listTag(organizationId)],
    }),

    decideFamilyUpload: builder.mutation({
      query: ({ uploadId, organizationId, action, rejectionReason } = {}) => ({
        url: API_ROUTES.FAMILY_UPLOAD_BY_ID(uploadId),
        method: 'PUT',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body: {
          action,
          ...(action === 'reject' && rejectionReason ? { rejectionReason } : {}),
        },
      }),
      invalidatesTags: (result, error, { organizationId, uploadId }) => [
        { type: 'FamilyUpload', id: uploadId },
        listTag(organizationId),
      ],
    }),
  }),
});

export const { useGetFamilyUploadsQuery, useDecideFamilyUploadMutation } = familyUploadsApi;
