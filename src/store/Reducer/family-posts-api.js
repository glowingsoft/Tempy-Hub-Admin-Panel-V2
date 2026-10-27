import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Community wall / family posts
//
// GET    /admin/organizations/:organizationId/family-posts
// POST   /admin/family/posts
// PUT    /admin/family/posts/:postId
// DELETE /admin/family/posts/:postId
// POST   /admin/family/posts/media
// POST   /admin/family/posts/media/batch
// GET    /admin/family/posts/taggable-residents?branchId=
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({ type: 'FamilyPost', id: `LIST-${organizationId}` });

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

export const familyPostsApi = createApi({
  reducerPath: 'familyPostsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['FamilyPost'],
  endpoints: (builder) => ({
    getFamilyPosts: builder.query({
      query: ({
        organizationId,
        page = 1,
        limit = 20,
        status,
        branchId,
        residentId,
        authorId,
        audience,
        days,
        from,
        to,
        pinned,
        hasPhotos,
        reported,
        sort,
        keyword,
      } = {}) => {
        const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

        return {
          url: API_ROUTES.ORGANIZATION_FAMILY_POSTS(organizationId),
          method: 'GET',
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
          params: {
            page,
            limit,
            ...(status ? { status } : {}),
            ...(branchId ? { branchId } : {}),
            ...(residentId ? { residentId } : {}),
            ...(authorId ? { authorId } : {}),
            ...(audience ? { audience } : {}),
            ...(days ? { days } : {}),
            ...(from ? { from } : {}),
            ...(to ? { to } : {}),
            ...(pinned ? { pinned: true } : {}),
            ...(hasPhotos ? { hasPhotos: true } : {}),
            ...(reported ? { reported: true } : {}),
            ...(sort ? { sort } : {}),
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
                .filter((item) => item?.postId)
                .map(({ postId }) => ({ type: 'FamilyPost', id: postId })),
              listTag(organizationId),
            ]
          : [listTag(organizationId)],
    }),

    getTaggableResidents: builder.query({
      query: ({ organizationId, branchId } = {}) => ({
        url: API_ROUTES.FAMILY_POST_TAGGABLE_RESIDENTS,
        method: 'GET',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        params: {
          ...(branchId ? { branchId } : {}),
        },
      }),
      transformResponse: (res) => (Array.isArray(res?.data) ? res.data : []),
    }),

    uploadFamilyPostMedia: builder.mutation({
      query: ({ organizationId, file } = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: API_ROUTES.FAMILY_POST_MEDIA,
          method: 'POST',
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
          body: formData,
        };
      },
      transformResponse: (res) => extractMediaItems(res),
    }),

    uploadFamilyPostMediaBatch: builder.mutation({
      query: ({ organizationId, files = [] } = {}) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        return {
          url: API_ROUTES.FAMILY_POST_MEDIA_BATCH,
          method: 'POST',
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
          body: formData,
        };
      },
      transformResponse: (res) => extractMediaItems(res),
    }),

    createFamilyPost: builder.mutation({
      query: ({
        organizationId,
        branchId,
        title,
        message,
        mediaIds,
        taggedResidentIds,
        audience,
        isPinned,
      } = {}) => ({
        url: API_ROUTES.FAMILY_POSTS,
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body: {
          branchId,
          ...(title ? { title } : {}),
          message,
          mediaIds: mediaIds || [],
          taggedResidentIds: taggedResidentIds || [],
          audience,
          isPinned: Boolean(isPinned),
        },
      }),
      invalidatesTags: (result, error, { organizationId }) => [listTag(organizationId)],
    }),

    updateFamilyPost: builder.mutation({
      query: ({ organizationId, postId, title, message, isPinned } = {}) => ({
        url: API_ROUTES.FAMILY_POST_BY_ID(postId),
        method: 'PUT',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body: {
          ...(title !== undefined ? { title } : {}),
          ...(message !== undefined ? { message } : {}),
          ...(isPinned !== undefined ? { isPinned: Boolean(isPinned) } : {}),
        },
      }),
      invalidatesTags: (result, error, { organizationId, postId }) => [
        { type: 'FamilyPost', id: postId },
        listTag(organizationId),
      ],
    }),

    removeFamilyPost: builder.mutation({
      query: ({ organizationId, postId } = {}) => ({
        url: API_ROUTES.FAMILY_POST_BY_ID(postId),
        method: 'DELETE',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: (result, error, { organizationId, postId }) => [
        { type: 'FamilyPost', id: postId },
        listTag(organizationId),
      ],
    }),
  }),
});

export const {
  useGetFamilyPostsQuery,
  useGetTaggableResidentsQuery,
  useUploadFamilyPostMediaMutation,
  useUploadFamilyPostMediaBatchMutation,
  useCreateFamilyPostMutation,
  useUpdateFamilyPostMutation,
  useRemoveFamilyPostMutation,
} = familyPostsApi;
