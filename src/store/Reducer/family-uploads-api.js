import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Family uploads (moderation queue)
//
// GET  /admin/organizations/:organizationId/family-uploads?page=1&limit=10
// PUT  /admin/family/uploads/:uploadId  { action: "approve" | "reject", rejectionReason? }
// POST /admin/family/uploads/media
// POST /admin/family/uploads/media/batch
// POST /admin/family/uploads
// ----------------------------------------------------------------------

const orgHeaders = (organizationId) =>
  organizationId ? { 'x-org-id': organizationId } : undefined;

const extractMediaItems = (res) => {
  const data = res?.data ?? res;
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.photos)
      ? data.photos
      : data?.mediaId || data?._id
        ? [data]
        : [];

  return list
    .map((item) => ({
      mediaId: item.mediaId || item._id,
      url: item.url || item.location || '',
    }))
    .filter((item) => item.mediaId);
};

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
          headers: orgHeaders(organizationId),
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
        headers: orgHeaders(organizationId),
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

    uploadFamilyUploadMedia: builder.mutation({
      query: ({ organizationId, file } = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: API_ROUTES.FAMILY_UPLOAD_MEDIA,
          method: 'POST',
          headers: orgHeaders(organizationId),
          body: formData,
        };
      },
      transformResponse: (res) => extractMediaItems(res),
    }),

    uploadFamilyUploadMediaBatch: builder.mutation({
      query: ({ organizationId, files = [] } = {}) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        return {
          url: API_ROUTES.FAMILY_UPLOAD_MEDIA_BATCH,
          method: 'POST',
          headers: orgHeaders(organizationId),
          body: formData,
        };
      },
      transformResponse: (res) => extractMediaItems(res),
    }),

    createFamilyUpload: builder.mutation({
      query: ({
        organizationId,
        residentId,
        message,
        mediaIds,
        includeInGazette = true,
        clientId,
      } = {}) => ({
        url: API_ROUTES.FAMILY_UPLOADS,
        method: 'POST',
        headers: orgHeaders(organizationId),
        body: {
          residentId,
          message,
          mediaIds: mediaIds || [],
          includeInGazette: Boolean(includeInGazette),
          ...(clientId ? { clientId } : {}),
        },
      }),
      invalidatesTags: (result, error, { organizationId }) => [listTag(organizationId)],
    }),
  }),
});

export const {
  useGetFamilyUploadsQuery,
  useDecideFamilyUploadMutation,
  useUploadFamilyUploadMediaMutation,
  useUploadFamilyUploadMediaBatchMutation,
  useCreateFamilyUploadMutation,
} = familyUploadsApi;
