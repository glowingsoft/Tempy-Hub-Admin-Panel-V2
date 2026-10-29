import { createApi } from '@reduxjs/toolkit/query/react';
import { defaultSerializeQueryArgs } from '@reduxjs/toolkit/query';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Community wall / family posts
//
// GET    /admin/organizations/:organizationId/family-posts
// GET    /admin/organizations/:organizationId/family-post-authors
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
      extraOptions: { disableToast: true },
      query: ({
        organizationId,
        page = 1,
        limit = 50,
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
        const currentPage = Number(page) > 0 ? Number(page) : 1;
        const pageSize = Number(limit) > 0 ? Number(limit) : 50;

        return {
          url: API_ROUTES.ORGANIZATION_FAMILY_POSTS(organizationId),
          method: 'GET',
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
          params: {
            page: currentPage,
            limit: pageSize,
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
      serializeQueryArgs: ({ endpointName, queryArgs, endpointDefinition }) => {
        const { page: _page, feedGeneration: _feedGeneration, ...filters } = queryArgs || {};
        return defaultSerializeQueryArgs({
          endpointName,
          queryArgs: filters,
          endpointDefinition,
        });
      },
      merge: (currentCache, responseData, { arg }) => {
        const incomingPage = Number(arg?.page) > 0 ? Number(arg.page) : 1;
        const incomingGeneration = Number(arg?.feedGeneration) || 0;
        const incomingPosts = Array.isArray(responseData?.data) ? responseData.data : [];
        const cachedGeneration = Number(currentCache.feedGeneration) || 0;

        if (incomingGeneration < cachedGeneration) {
          return;
        }

        const shouldReplace =
          incomingPage <= 1 || incomingGeneration !== cachedGeneration || !Array.isArray(currentCache.data);

        if (shouldReplace) {
          currentCache.data = incomingPosts;
          currentCache.meta = responseData?.meta ?? {};
          currentCache.feedGeneration = incomingGeneration;
          return;
        }

        const cachedPage = Number(currentCache.meta?.currentPage) || 1;
        if (incomingPage !== cachedPage + 1) {
          return;
        }

        const seenIds = new Set(
          currentCache.data.map((item) => item?.postId || item?._id).filter(Boolean)
        );
        incomingPosts.forEach((item) => {
          const id = item?.postId || item?._id;
          if (!id || seenIds.has(id)) return;
          seenIds.add(id);
          currentCache.data.push(item);
        });
        currentCache.meta = responseData?.meta ?? currentCache.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page ||
        currentArg?.feedGeneration !== previousArg?.feedGeneration,
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

    getFamilyPostAuthors: builder.query({
      query: ({ organizationId, branchId, keyword, page = 1, limit = 100 } = {}) => {
        const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';
        const currentPage = Number(page) > 0 ? Number(page) : 1;
        const pageSize = Number(limit) > 0 ? Number(limit) : 100;

        return {
          url: API_ROUTES.ORGANIZATION_FAMILY_POST_AUTHORS(organizationId),
          method: 'GET',
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
          params: {
            page: currentPage,
            limit: pageSize,
            ...(branchId ? { branchId } : {}),
            ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
          },
        };
      },
      transformResponse: (res) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta ?? {},
      }),
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
  useGetFamilyPostAuthorsQuery,
  useGetTaggableResidentsQuery,
  useUploadFamilyPostMediaMutation,
  useUploadFamilyPostMediaBatchMutation,
  useCreateFamilyPostMutation,
  useUpdateFamilyPostMutation,
  useRemoveFamilyPostMutation,
} = familyPostsApi;
