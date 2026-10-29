import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Family newsletters
//
// GET    /admin/organizations/:organizationId/family-newsletters
// GET    /admin/organizations/:organizationId/family-newsletters/:newsletterId
// GET    /admin/organizations/:organizationId/family-newsletters/:newsletterId/pdf
// POST   /admin/family/newsletters  { branchId, month }
// PUT    /admin/family/newsletters/:newsletterId
// PUT    /admin/family/newsletters/:newsletterId/delivery
// DELETE /admin/family/newsletters/:newsletterId
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({ type: 'FamilyNewsletter', id: `LIST-${organizationId}` });

const orgHeaders = (organizationId) =>
  organizationId ? { 'x-org-id': organizationId } : undefined;

const parseFilename = (disposition, fallback) => {
  const match = (disposition || '').match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
  if (!match?.[1]) return fallback;
  return decodeURIComponent(match[1].replace(/"/g, '').trim());
};

const blobResponseHandler = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return { message: 'Unable to download file' };
    }
  }

  const blob = await response.blob();
  return {
    blob,
    filename: parseFilename(response.headers.get('content-disposition'), 'newsletter.pdf'),
  };
};

export const familyNewslettersApi = createApi({
  reducerPath: 'familyNewslettersApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['FamilyNewsletter'],
  endpoints: (builder) => ({
    getFamilyNewsletters: builder.query({
      query: ({ organizationId, page = 1, limit = 10, status, branchId, month, keyword } = {}) => {
        const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

        return {
          url: API_ROUTES.ORGANIZATION_FAMILY_NEWSLETTERS(organizationId),
          method: 'GET',
          headers: orgHeaders(organizationId),
          params: {
            page,
            limit,
            ...(status && status !== 'all' ? { status } : {}),
            ...(branchId ? { branchId } : {}),
            ...(month ? { month } : {}),
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
                .filter((item) => item?.newsletterId)
                .map(({ newsletterId }) => ({ type: 'FamilyNewsletter', id: newsletterId })),
              listTag(organizationId),
            ]
          : [listTag(organizationId)],
    }),

    getFamilyNewsletter: builder.query({
      query: ({ organizationId, newsletterId } = {}) => ({
        url: API_ROUTES.ORGANIZATION_FAMILY_NEWSLETTER_BY_ID(organizationId, newsletterId),
        method: 'GET',
        headers: orgHeaders(organizationId),
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { newsletterId }) => [{ type: 'FamilyNewsletter', id: newsletterId }],
    }),

    getFamilyNewsletterPdf: builder.query({
      extraOptions: { disableToast: true },
      query: ({ organizationId, newsletterId, download = false, format } = {}) => ({
        url: API_ROUTES.ORGANIZATION_FAMILY_NEWSLETTER_PDF(organizationId, newsletterId),
        method: 'GET',
        headers: orgHeaders(organizationId),
        params: {
          download: download ? 'true' : 'false',
          ...(format ? { format } : {}),
        },
        responseHandler: format === 'url' ? undefined : blobResponseHandler,
      }),
      transformResponse: (res) => {
        if (res?.blob instanceof Blob) return res;
        return res?.data ?? res;
      },
      keepUnusedDataFor: 0,
    }),

    createFamilyNewsletter: builder.mutation({
      query: ({ organizationId, branchId, month } = {}) => ({
        url: API_ROUTES.FAMILY_NEWSLETTERS,
        method: 'POST',
        headers: orgHeaders(organizationId),
        body: { branchId, month },
      }),
      invalidatesTags: (result, error, { organizationId }) => [listTag(organizationId)],
    }),

    updateFamilyNewsletter: builder.mutation({
      query: ({ organizationId, newsletterId, ...body } = {}) => ({
        url: API_ROUTES.FAMILY_NEWSLETTER_BY_ID(newsletterId),
        method: 'PUT',
        headers: orgHeaders(organizationId),
        body,
      }),
      invalidatesTags: (result, error, { organizationId, newsletterId }) => [
        { type: 'FamilyNewsletter', id: newsletterId },
        listTag(organizationId),
      ],
    }),

    updateFamilyNewsletterDelivery: builder.mutation({
      query: ({ organizationId, newsletterId, ...body } = {}) => ({
        url: API_ROUTES.FAMILY_NEWSLETTER_DELIVERY(newsletterId),
        method: 'PUT',
        headers: orgHeaders(organizationId),
        body,
      }),
      invalidatesTags: (result, error, { organizationId, newsletterId }) => [
        { type: 'FamilyNewsletter', id: newsletterId },
        listTag(organizationId),
      ],
    }),

    deleteFamilyNewsletter: builder.mutation({
      query: ({ organizationId, newsletterId } = {}) => ({
        url: API_ROUTES.FAMILY_NEWSLETTER_BY_ID(newsletterId),
        method: 'DELETE',
        headers: orgHeaders(organizationId),
      }),
      invalidatesTags: (result, error, { organizationId, newsletterId }) => [
        { type: 'FamilyNewsletter', id: newsletterId },
        listTag(organizationId),
      ],
    }),
  }),
});

export const {
  useGetFamilyNewslettersQuery,
  useGetFamilyNewsletterQuery,
  useLazyGetFamilyNewsletterPdfQuery,
  useCreateFamilyNewsletterMutation,
  useUpdateFamilyNewsletterMutation,
  useUpdateFamilyNewsletterDeliveryMutation,
  useDeleteFamilyNewsletterMutation,
} = familyNewslettersApi;
